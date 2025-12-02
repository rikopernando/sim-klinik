/**
 * Billing Service
 * Handles billing operations, cost aggregation, and payment processing
 */

import { db } from "@/db";
import { billings, billingItems, payments, services } from "@/db/schema/billing";
import { visits } from "@/db/schema/visits";
import { medicalRecords, procedures } from "@/db/schema/medical-records";
import { drugs, prescriptions } from "@/db/schema/pharmacy";
import { patients } from "@/db/schema/patients";
import { user } from "@/db/schema/auth";
import { eq, and, or, desc, sql } from "drizzle-orm";

/**
 * Get visits ready for billing (RME locked, not yet paid)
 */
export async function getVisitsReadyForBilling() {
    const result = await db
        .select({
            visit: visits,
            patient: patients,
            billing: billings,
            medicalRecord: medicalRecords,
        })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .leftJoin(medicalRecords, eq(visits.id, medicalRecords.visitId))
        .leftJoin(billings, eq(visits.id, billings.visitId))
        .where(
            and(
                eq(medicalRecords.isLocked, true), // RME must be locked
                or(
                    eq(billings.paymentStatus, "pending"),
                    eq(billings.paymentStatus, "partial"),
                    sql`${billings.id} IS NULL` // Or no billing record exists yet
                )
            )
        )
        .orderBy(desc(visits.createdAt));

    return result;
}

/**
 * Calculate total billing for a visit
 * Aggregates costs from: admin fee, consultation, procedures, medications
 */
export async function calculateBillingForVisit(visitId: number) {
    // Get visit details
    const visitResult = await db
        .select()
        .from(visits)
        .where(eq(visits.id, visitId))
        .limit(1);

    if (visitResult.length === 0) {
        throw new Error("Visit not found");
    }

    const visit = visitResult[0];

    const items: Array<{
        itemType: string;
        itemId: number | null;
        itemName: string;
        itemCode: string | null;
        quantity: number;
        unitPrice: string;
        subtotal: string;
        discount: string;
        totalPrice: string;
        description?: string;
    }> = [];

    let subtotal = 0;

    // 1. Administration Fee (Registration)
    const adminServiceResult = await db
        .select()
        .from(services)
        .where(
            and(
                eq(services.serviceType, "administration"),
                eq(services.isActive, true)
            )
        )
        .limit(1);

    if (adminServiceResult.length > 0) {
        const adminService = adminServiceResult[0];
        const price = parseFloat(adminService.price);
        items.push({
            itemType: "service",
            itemId: adminService.id,
            itemName: adminService.name,
            itemCode: adminService.code,
            quantity: 1,
            unitPrice: adminService.price,
            subtotal: price.toFixed(2),
            discount: "0.00",
            totalPrice: price.toFixed(2),
            description: "Biaya administrasi pendaftaran",
        });
        subtotal += price;
    }

    // 2. Doctor Consultation Fee
    const consultationServiceResult = await db
        .select()
        .from(services)
        .where(
            and(
                eq(services.serviceType, "consultation"),
                eq(services.isActive, true)
            )
        )
        .limit(1);

    if (consultationServiceResult.length > 0) {
        const consultationService = consultationServiceResult[0];
        const price = parseFloat(consultationService.price);
        items.push({
            itemType: "service",
            itemId: consultationService.id,
            itemName: consultationService.name,
            itemCode: consultationService.code,
            quantity: 1,
            unitPrice: consultationService.price,
            subtotal: price.toFixed(2),
            discount: "0.00",
            totalPrice: price.toFixed(2),
            description: "Biaya konsultasi dokter",
        });
        subtotal += price;
    }

    // 3. Medical Procedures (from medical_records.procedures)
    const proceduresList = await db
        .select({
            procedure: procedures,
        })
        .from(procedures)
        .innerJoin(medicalRecords, eq(procedures.medicalRecordId, medicalRecords.id))
        .where(eq(medicalRecords.visitId, visitId));

    for (const { procedure } of proceduresList) {
        // Try to find service by ICD-9 code
        const procedureServiceResult = await db
            .select()
            .from(services)
            .where(
                and(
                    eq(services.serviceType, "procedure"),
                    eq(services.code, procedure.icd9Code),
                    eq(services.isActive, true)
                )
            )
            .limit(1);

        if (procedureServiceResult.length > 0) {
            const procedureService = procedureServiceResult[0];
            const price = parseFloat(procedureService.price);
            items.push({
                itemType: "service",
                itemId: procedureService.id,
                itemName: procedureService.name,
                itemCode: procedureService.code,
                quantity: 1,
                unitPrice: procedureService.price,
                subtotal: price.toFixed(2),
                discount: "0.00",
                totalPrice: price.toFixed(2),
                description: procedure.description || undefined,
            });
            subtotal += price;
        }
    }

    // 4. Medications (from prescriptions)
    const prescriptionsList = await db
        .select({
            prescription: prescriptions,
            drug: drugs,
        })
        .from(prescriptions)
        .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
        .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
        .where(
            and(
                eq(medicalRecords.visitId, visitId),
                eq(prescriptions.isFulfilled, true) // Only fulfilled prescriptions
            )
        );

    for (const { prescription, drug } of prescriptionsList) {
        const quantity = prescription.dispensedQuantity || prescription.quantity;
        const unitPrice = parseFloat(drug.price);
        const itemSubtotal = quantity * unitPrice;

        items.push({
            itemType: "drug",
            itemId: drug.id,
            itemName: drug.name,
            itemCode: null,
            quantity,
            unitPrice: drug.price,
            subtotal: itemSubtotal.toFixed(2),
            discount: "0.00",
            totalPrice: itemSubtotal.toFixed(2),
            description: `${prescription.dosage}, ${prescription.frequency}`,
        });
        subtotal += itemSubtotal;
    }

    return {
        visitId,
        items,
        subtotal: subtotal.toFixed(2),
        totalAmount: subtotal.toFixed(2),
    };
}

/**
 * Create or update billing record for a visit
 */
export async function createOrUpdateBilling(
    visitId: number,
    userId: string,
    options?: {
        discount?: number;
        discountPercentage?: number;
        insuranceCoverage?: number;
    }
) {
    // Calculate billing
    const calculation = await calculateBillingForVisit(visitId);
    const subtotal = parseFloat(calculation.subtotal);

    // Calculate discount
    let discount = options?.discount || 0;
    if (options?.discountPercentage) {
        discount = subtotal * (options.discountPercentage / 100);
    }

    const insuranceCoverage = options?.insuranceCoverage || 0;
    const totalAmount = subtotal - discount;
    const patientPayable = totalAmount - insuranceCoverage;

    // Check if billing exists
    const existingBilling = await db.query.billings.findFirst({
        where: eq(billings.visitId, visitId),
    });

    let billingId: number;

    if (existingBilling) {
        // Update existing billing
        await db
            .update(billings)
            .set({
                subtotal: subtotal.toFixed(2),
                discount: discount.toFixed(2),
                discountPercentage: options?.discountPercentage?.toFixed(2) || null,
                insuranceCoverage: insuranceCoverage.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                patientPayable: patientPayable.toFixed(2),
                remainingAmount: (patientPayable - parseFloat(existingBilling.paidAmount)).toFixed(2),
                updatedAt: new Date(),
            })
            .where(eq(billings.id, existingBilling.id));

        billingId = existingBilling.id;
    } else {
        // Create new billing
        const [newBilling] = await db
            .insert(billings)
            .values({
                visitId,
                subtotal: subtotal.toFixed(2),
                discount: discount.toFixed(2),
                discountPercentage: options?.discountPercentage?.toFixed(2) || null,
                tax: "0.00",
                insuranceCoverage: insuranceCoverage.toFixed(2),
                totalAmount: totalAmount.toFixed(2),
                patientPayable: patientPayable.toFixed(2),
                paidAmount: "0.00",
                remainingAmount: patientPayable.toFixed(2),
                paymentStatus: "pending",
            })
            .returning();

        billingId = newBilling.id;
    }

    // Delete existing billing items
    await db.delete(billingItems).where(eq(billingItems.billingId, billingId));

    // Insert new billing items (only if there are items)
    if (calculation.items.length > 0) {
        await db.insert(billingItems).values(
            calculation.items.map((item) => ({
                billingId,
                ...item,
            }))
        );
    }

    return billingId;
}

/**
 * Process payment for a billing
 */
export async function processPayment(
    billingId: number,
    userId: string,
    paymentData: {
        amount: number;
        paymentMethod: string;
        paymentReference?: string;
        amountReceived?: number; // For cash payments
        notes?: string;
    }
) {
    const billing = await db.query.billings.findFirst({
        where: eq(billings.id, billingId),
    });

    if (!billing) {
        throw new Error("Billing not found");
    }

    const patientPayable = parseFloat(billing.patientPayable);
    const paidAmount = parseFloat(billing.paidAmount);
    const remainingAmount = patientPayable - paidAmount;

    if (paymentData.amount > remainingAmount) {
        throw new Error("Payment amount exceeds remaining balance");
    }

    // Calculate change for cash payments
    let changeGiven = 0;
    if (paymentData.paymentMethod === "cash" && paymentData.amountReceived) {
        changeGiven = paymentData.amountReceived - paymentData.amount;
        if (changeGiven < 0) {
            throw new Error("Amount received is less than payment amount");
        }
    }

    // Create payment record
    await db.insert(payments).values({
        billingId,
        amount: paymentData.amount.toFixed(2),
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference || null,
        amountReceived: paymentData.amountReceived?.toFixed(2) || null,
        changeGiven: changeGiven > 0 ? changeGiven.toFixed(2) : null,
        receivedBy: userId,
        notes: paymentData.notes || null,
    });

    // Update billing
    const newPaidAmount = paidAmount + paymentData.amount;
    const newRemainingAmount = patientPayable - newPaidAmount;
    const newPaymentStatus =
        newRemainingAmount <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : "pending";

    await db
        .update(billings)
        .set({
            paidAmount: newPaidAmount.toFixed(2),
            remainingAmount: newRemainingAmount.toFixed(2),
            paymentStatus: newPaymentStatus,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: paymentData.paymentReference || null,
            processedBy: userId,
            processedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(billings.id, billingId));

    return {
        success: true,
        paymentStatus: newPaymentStatus,
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        changeGiven,
    };
}

/**
 * Get billing details with items
 */
export async function getBillingDetails(visitId: number) {
    // Get billing record
    const billingResult = await db
        .select()
        .from(billings)
        .where(eq(billings.visitId, visitId))
        .limit(1);

    if (billingResult.length === 0) {
        return null;
    }

    const billing = billingResult[0];

    // Get billing items
    const items = await db
        .select()
        .from(billingItems)
        .where(eq(billingItems.billingId, billing.id))
        .orderBy(billingItems.id);

    // Get payment history
    const paymentHistory = await db
        .select()
        .from(payments)
        .where(eq(payments.billingId, billing.id))
        .orderBy(desc(payments.createdAt));

    return {
        billing,
        items,
        payments: paymentHistory,
    };
}
