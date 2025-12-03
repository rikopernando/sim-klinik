/**
 * Billing Preview API
 * GET /api/billing/preview?visitId=X
 * Returns billing breakdown before locking medical record
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { visits, prescriptions, procedures, drugs, services, medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const visitId = searchParams.get("visitId");

        if (!visitId) {
            return NextResponse.json(
                { error: "Visit ID is required" },
                { status: 400 }
            );
        }

        const visitIdNum = parseInt(visitId, 10);

        // Get medical record for this visit
        const [medicalRecord] = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.visitId, visitIdNum))
            .limit(1);

        if (!medicalRecord) {
            return NextResponse.json(
                { error: "Medical record not found" },
                { status: 404 }
            );
        }

        // Calculate consultation fee (default for now)
        const consultationFee = 50000;

        // Calculate drugs subtotal
        const prescriptionsList = await db
            .select({
                prescription: prescriptions,
                drug: drugs,
            })
            .from(prescriptions)
            .leftJoin(drugs, eq(prescriptions.drugId, drugs.id))
            .where(eq(prescriptions.medicalRecordId, medicalRecord.id));

        const drugsSubtotal = prescriptionsList.reduce((sum, item) => {
            if (item.drug && item.prescription.quantity) {
                return sum + (parseFloat(item.drug.price) * item.prescription.quantity);
            }
            return sum;
        }, 0);

        // Calculate procedures subtotal
        const proceduresList = await db
            .select({
                procedure: procedures,
                service: services,
            })
            .from(procedures)
            .leftJoin(services, eq(procedures.serviceId, services.id))
            .where(eq(procedures.medicalRecordId, medicalRecord.id));

        const proceduresSubtotal = proceduresList.reduce((sum, item) => {
            if (item.service) {
                return sum + parseFloat(item.service.price);
            }
            return sum;
        }, 0);

        const subtotal = consultationFee + drugsSubtotal + proceduresSubtotal;

        return NextResponse.json({
            success: true,
            data: {
                consultationFee,
                drugsSubtotal,
                proceduresSubtotal,
                subtotal,
            },
        });
    } catch (error) {
        console.error("Billing preview error:", error);
        return NextResponse.json(
            { error: "Failed to fetch billing preview" },
            { status: 500 }
        );
    }
}
