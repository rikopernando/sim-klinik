/**
 * Billing Module API Service Layer
 * Database operations for billing, payments, and discharge
 */

import { db } from "@/db";
import {
    services,
    billings,
    billingItems,
    payments,
    dischargeSummaries,
} from "@/db/schema/billing";
import { visits } from "@/db/schema/visits";
import { patients } from "@/db/schema/patients";
import { prescriptions } from "@/db/schema/medical-records";
import { drugs } from "@/db/schema/pharmacy";
import { materialUsage } from "@/db/schema/inpatient";
import { rooms, bedAssignments } from "@/db/schema/inpatient";
import { eq, sql, and, desc} from "drizzle-orm";
import type {
    ServiceInput,
    ServiceUpdateInput,
    CreateBillingInput,
    PaymentInput,
    DischargeSummaryInput,
    BillingWithDetails,
} from "@/types/billing";
import {
    calculateItemTotal,
    calculateSubtotal,
    calculateDiscountFromPercentage,
    calculateTotalAmount,
    calculatePatientPayable,
    calculateRemainingAmount,
    determinePaymentStatus,
    calculateChange,
} from "./billing-utils";

/**
 * Get all services (master data)
 */
export async function getAllServices() {
    const allServices = await db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(services.category, services.name);

    return allServices;
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: number) {
    const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, serviceId))
        .limit(1);

    return service || null;
}

/**
 * Create new service
 */
export async function createService(data: ServiceInput) {
    const [newService] = await db
        .insert(services)
        .values({
            code: data.code,
            name: data.name,
            serviceType: data.serviceType,
            price: data.price,
            description: data.description || null,
            category: data.category || null,
        })
        .returning();

    return newService;
}

/**
 * Update service
 */
export async function updateService(serviceId: number, data: Partial<ServiceUpdateInput>) {
    const [updatedService] = await db
        .update(services)
        .set({
            ...data,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(services.id, serviceId))
        .returning();

    if (!updatedService) {
        throw new Error("Service not found");
    }

    return updatedService;
}

/**
 * Get billing by visit ID
 */
export async function getBillingByVisitId(visitId: number): Promise<BillingWithDetails | null> {
    const [billing] = await db
        .select()
        .from(billings)
        .where(eq(billings.visitId, visitId))
        .limit(1);

    if (!billing) return null;

    // Get billing items
    const items = await db
        .select()
        .from(billingItems)
        .where(eq(billingItems.billingId, billing.id))
        .orderBy(billingItems.createdAt);

    // Get payments
    const paymentsList = await db
        .select()
        .from(payments)
        .where(eq(payments.billingId, billing.id))
        .orderBy(desc(payments.receivedAt));

    // Get visit and patient info
    const [visitInfo] = await db
        .select({
            visit: visits,
            patient: patients,
        })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(visits.id, visitId))
        .limit(1);

    return {
        ...billing,
        items,
        payments: paymentsList,
        visit: visitInfo
            ? {
                  id: visitInfo.visit.id,
                  visitNumber: visitInfo.visit.visitNumber,
                  visitType: visitInfo.visit.visitType,
              }
            : undefined,
        patient: visitInfo
            ? {
                  id: visitInfo.patient.id,
                  name: visitInfo.patient.name,
                  mrNumber: visitInfo.patient.mrNumber,
              }
            : undefined,
    };
}

/**
 * Create billing with automatic aggregation from visit data
 * This is the BILLING ENGINE - aggregates all charges
 */
export async function createBillingForVisit(data: CreateBillingInput) {
    // Verify visit exists
    const [visit] = await db.select().from(visits).where(eq(visits.id, data.visitId)).limit(1);

    if (!visit) {
        throw new Error("Visit not found");
    }

    // Check if billing already exists
    const existingBilling = await getBillingByVisitId(data.visitId);
    if (existingBilling) {
        throw new Error("Billing already exists for this visit");
    }

    // Aggregate all billing items
    const allItems = [...data.items];

    // 1. Add fulfilled prescriptions (drugs)
    const fulfilledPrescriptions = await db
        .select({
            prescription: prescriptions,
            drug: drugs,
        })
        .from(prescriptions)
        .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
        .where(
            and(
                eq(prescriptions.medicalRecordId, visit.id),
                eq(prescriptions.isFulfilled, true)
            )
        );

    fulfilledPrescriptions.forEach(({ prescription, drug }) => {
        const quantity = prescription.dispensedQuantity || prescription.quantity;
        allItems.push({
            itemType: "drug",
            itemId: drug.id,
            itemName: drug.name,
            itemCode: drug.genericName || undefined,
            quantity,
            unitPrice: drug.price,
            discount: "0",
            description: `${prescription.dosage} - ${prescription.frequency}`,
        });
    });

    // 2. Add material usage (for inpatient)
    if (visit.visitType === "inpatient") {
        const materials = await db
            .select()
            .from(materialUsage)
            .where(eq(materialUsage.visitId, visit.id));

        materials.forEach((material) => {
            allItems.push({
                itemType: "material",
                itemId: null,
                itemName: material.materialName,
                quantity: material.quantity,
                unitPrice: material.unitPrice,
                discount: "0",
                description: material.notes || undefined,
            });
        });

        // 3. Add room charges (for inpatient)
        const bedAssignment = await db
            .select({
                assignment: bedAssignments,
                room: rooms,
            })
            .from(bedAssignments)
            .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
            .where(
                and(
                    eq(bedAssignments.visitId, visit.id),
                    eq(bedAssignments.discharged, false)
                )
            )
            .limit(1);

        if (bedAssignment.length > 0) {
            const { assignment, room } = bedAssignment[0];

            // Calculate days stayed
            const admissionDate = new Date(assignment.assignedAt);
            const today = new Date();
            const daysStayed = Math.ceil(
                (today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            allItems.push({
                itemType: "room",
                itemId: room.id,
                itemName: `Kamar ${room.roomNumber} - ${room.roomType}`,
                itemCode: room.roomNumber,
                quantity: daysStayed,
                unitPrice: room.dailyRate,
                discount: "0",
                description: `Rawat inap ${daysStayed} hari`,
            });
        }
    }

    // Calculate billing amounts
    const itemsWithTotals = allItems.map((item) => ({
        ...item,
        subtotal: calculateItemTotal(item.quantity, item.unitPrice, "0"),
        totalPrice: calculateItemTotal(
            item.quantity,
            item.unitPrice,
            item.discount || "0"
        ),
    }));

    const subtotal = calculateSubtotal(itemsWithTotals);

    // Apply discount
    let discount = data.discount || "0";
    if (data.discountPercentage) {
        discount = calculateDiscountFromPercentage(subtotal, data.discountPercentage);
    }

    const tax = "0"; // No tax for now
    const totalAmount = calculateTotalAmount(subtotal, discount, tax);
    const insuranceCoverage = data.insuranceCoverage || "0";
    const patientPayable = calculatePatientPayable(totalAmount, insuranceCoverage);

    // Create billing record
    const [newBilling] = await db
        .insert(billings)
        .values({
            visitId: data.visitId,
            subtotal,
            discount,
            discountPercentage: data.discountPercentage || null,
            tax,
            totalAmount,
            insuranceCoverage,
            patientPayable,
            paymentStatus: "pending",
            paidAmount: "0",
            remainingAmount: patientPayable,
            notes: data.notes || null,
        })
        .returning();

    // Insert billing items
    await db.insert(billingItems).values(
        itemsWithTotals.map((item) => ({
            billingId: newBilling.id,
            itemType: item.itemType,
            itemId: item.itemId || null,
            itemName: item.itemName,
            itemCode: item.itemCode || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            discount: item.discount || "0",
            totalPrice: item.totalPrice,
            description: item.description || null,
        }))
    );

    return getBillingByVisitId(data.visitId);
}

/**
 * Process payment
 */
export async function processPayment(data: PaymentInput) {
    // Get billing
    const [billing] = await db
        .select()
        .from(billings)
        .where(eq(billings.id, data.billingId))
        .limit(1);

    if (!billing) {
        throw new Error("Billing not found");
    }

    // Validate payment amount
    const paymentAmount = parseFloat(data.amount);
    const remainingAmount = parseFloat(billing.remainingAmount || billing.patientPayable);

    if (paymentAmount <= 0) {
        throw new Error("Payment amount must be greater than 0");
    }

    if (paymentAmount > remainingAmount) {
        throw new Error("Payment amount exceeds remaining balance");
    }

    // Calculate change for cash payments
    let changeGiven = null;
    if (data.paymentMethod === "cash" && data.amountReceived) {
        changeGiven = calculateChange(data.amountReceived, data.amount);
    }

    // Insert payment record
    const [newPayment] = await db
        .insert(payments)
        .values({
            billingId: data.billingId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            paymentReference: data.paymentReference || null,
            amountReceived: data.amountReceived || null,
            changeGiven,
            receivedBy: data.receivedBy,
            notes: data.notes || null,
        })
        .returning();

    // Update billing record
    const newPaidAmount = parseFloat(billing.paidAmount) + paymentAmount;
    const newRemainingAmount = calculateRemainingAmount(
        billing.patientPayable,
        newPaidAmount.toString()
    );
    const newPaymentStatus = determinePaymentStatus(
        billing.patientPayable,
        newPaidAmount.toString()
    );

    await db
        .update(billings)
        .set({
            paidAmount: newPaidAmount.toFixed(2),
            remainingAmount: newRemainingAmount,
            paymentStatus: newPaymentStatus,
            paymentMethod: data.paymentMethod,
            paymentReference: data.paymentReference || null,
            processedBy: data.receivedBy,
            processedAt: sql`CURRENT_TIMESTAMP`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(billings.id, data.billingId));

    return newPayment;
}

/**
 * Get all pending billings
 */
export async function getPendingBillings() {
    const pendingBills = await db
        .select({
            billing: billings,
            visit: visits,
            patient: patients,
        })
        .from(billings)
        .innerJoin(visits, eq(billings.visitId, visits.id))
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .where(eq(billings.paymentStatus, "pending"))
        .orderBy(desc(billings.createdAt));

    return pendingBills;
}

/**
 * Check if visit can be discharged (billing gate)
 */
export async function canDischarge(visitId: number): Promise<{
    canDischarge: boolean;
    reason?: string;
    billing?: any;
}> {
    const billing = await getBillingByVisitId(visitId);

    if (!billing) {
        return {
            canDischarge: false,
            reason: "Billing belum dibuat. Harap buat billing terlebih dahulu.",
        };
    }

    if (billing.paymentStatus !== "paid") {
        return {
            canDischarge: false,
            reason: `Pembayaran belum lunas. Status: ${billing.paymentStatus}. Sisa: Rp ${parseFloat(
                billing.remainingAmount || "0"
            ).toLocaleString("id-ID")}`,
            billing,
        };
    }

    return {
        canDischarge: true,
        billing,
    };
}

/**
 * Create discharge summary
 */
export async function createDischargeSummary(data: DischargeSummaryInput) {
    // Check if visit can be discharged (billing gate)
    const dischargeCheck = await canDischarge(data.visitId);

    if (!dischargeCheck.canDischarge) {
        throw new Error(dischargeCheck.reason || "Cannot discharge patient");
    }

    // Check if discharge summary already exists
    const [existing] = await db
        .select()
        .from(dischargeSummaries)
        .where(eq(dischargeSummaries.visitId, data.visitId))
        .limit(1);

    if (existing) {
        throw new Error("Discharge summary already exists for this visit");
    }

    // Create discharge summary
    const [summary] = await db
        .insert(dischargeSummaries)
        .values({
            visitId: data.visitId,
            admissionDiagnosis: data.admissionDiagnosis,
            dischargeDiagnosis: data.dischargeDiagnosis,
            clinicalSummary: data.clinicalSummary,
            proceduresPerformed: data.proceduresPerformed || null,
            medicationsOnDischarge: data.medicationsOnDischarge || null,
            dischargeInstructions: data.dischargeInstructions,
            dietaryRestrictions: data.dietaryRestrictions || null,
            activityRestrictions: data.activityRestrictions || null,
            followUpDate: data.followUpDate || null,
            followUpInstructions: data.followUpInstructions || null,
            dischargedBy: data.dischargedBy,
        })
        .returning();

    // Update visit status to discharged
    await db
        .update(visits)
        .set({
            status: "completed",
            endAt: sql`CURRENT_TIMESTAMP`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(visits.id, data.visitId));

    // If inpatient, update bed assignment
    await db
        .update(bedAssignments)
        .set({
            discharged: true,
            dischargedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
            and(
                eq(bedAssignments.visitId, data.visitId),
                eq(bedAssignments.discharged, false)
            )
        );

    return summary;
}

/**
 * Get discharge summary by visit ID
 */
export async function getDischargeSummary(visitId: number) {
    const [summary] = await db
        .select()
        .from(dischargeSummaries)
        .where(eq(dischargeSummaries.visitId, visitId))
        .limit(1);

    return summary || null;
}

/**
 * Get billing statistics
 */
export async function getBillingStatistics() {
    // Get all billings
    const allBillings = await db.select().from(billings);

    const stats = {
        totalBillings: allBillings.length,
        pendingBillings: allBillings.filter((b) => b.paymentStatus === "pending").length,
        paidBillings: allBillings.filter((b) => b.paymentStatus === "paid").length,
        partialBillings: allBillings.filter((b) => b.paymentStatus === "partial").length,
        totalRevenue: allBillings
            .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0)
            .toFixed(2),
        pendingRevenue: allBillings
            .filter((b) => b.paymentStatus !== "paid")
            .reduce((sum, b) => sum + parseFloat(b.remainingAmount || "0"), 0)
            .toFixed(2),
    };

    // Get today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPayments = await db
        .select()
        .from(payments)
        .where(sql`DATE(${payments.receivedAt}) = CURRENT_DATE`);

    const collectedToday = todaysPayments
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
        .toFixed(2);

    return {
        ...stats,
        collectedToday,
    };
}
