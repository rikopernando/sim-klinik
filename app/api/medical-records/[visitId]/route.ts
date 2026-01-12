import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import {
  medicalRecords,
  diagnoses,
  procedures,
  prescriptions,
  visits,
  drugs,
  user,
  services,
} from "@/db/schema"
import { labOrders, labTests } from "@/db/schema/laboratory"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { MedicalRecord, MedicalRecordData } from "@/types/medical-record"
import z from "zod"

/**
 * GET /api/medical-records/[visitId]
 * Get medical record by visit ID (RESTful endpoint)
 * Requires: medical_records:read permission
 */
export const GET = withRBAC(
  async (_request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Get medical record for specific visit
      const records = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, visitId))
        .limit(1)

      if (records.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record not found for this visit",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      const record = records[0]

      // Get diagnoses
      const diagnosisList = await db
        .select()
        .from(diagnoses)
        .where(eq(diagnoses.medicalRecordId, record.id))

      // Get procedures with performer and service information
      const proceduresList = await db
        .select({
          id: procedures.id,
          medicalRecordId: procedures.medicalRecordId,
          serviceId: procedures.serviceId,
          serviceName: services.name,
          servicePrice: services.price,
          icd9Code: procedures.icd9Code,
          description: procedures.description,
          performedBy: procedures.performedBy,
          performedByName: user.name,
          performedAt: procedures.performedAt,
          notes: procedures.notes,
          createdAt: procedures.createdAt,
        })
        .from(procedures)
        .leftJoin(user, eq(procedures.performedBy, user.id))
        .leftJoin(services, eq(procedures.serviceId, services.id))
        .where(eq(procedures.medicalRecordId, record.id))

      // Get prescriptions with drug information and pharmacist info
      const prescriptionsList = await db
        .select({
          id: prescriptions.id,
          medicalRecordId: prescriptions.medicalRecordId,
          drugId: prescriptions.drugId,
          drugName: drugs.name,
          drugPrice: drugs.price,
          dosage: prescriptions.dosage,
          frequency: prescriptions.frequency,
          duration: prescriptions.duration,
          quantity: prescriptions.quantity,
          instructions: prescriptions.instructions,
          route: prescriptions.route,
          isFulfilled: prescriptions.isFulfilled,
          fulfilledBy: prescriptions.fulfilledBy,
          fulfilledAt: prescriptions.fulfilledAt,
          dispensedQuantity: prescriptions.dispensedQuantity,
          inventoryId: prescriptions.inventoryId,
          notes: prescriptions.notes,
          // Pharmacist-added prescription fields
          addedByPharmacist: prescriptions.addedByPharmacist,
          addedByPharmacistId: prescriptions.addedByPharmacistId,
          addedByPharmacistName: user.name,
          approvedBy: prescriptions.approvedBy,
          approvedAt: prescriptions.approvedAt,
          pharmacistNote: prescriptions.pharmacistNote,
          createdAt: prescriptions.createdAt,
          updatedAt: prescriptions.updatedAt,
        })
        .from(prescriptions)
        .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
        .leftJoin(user, eq(prescriptions.addedByPharmacistId, user.id))
        .where(eq(prescriptions.medicalRecordId, record.id))

      // Get visit information
      const [visitInfo] = await db
        .select()
        .from(visits)
        .where(eq(visits.id, record.visitId))
        .limit(1)

      // Get lab orders for this visit (only verified ones for billing preview)
      const labOrdersList = await db
        .select({
          id: labOrders.id,
          orderNumber: labOrders.orderNumber,
          price: labOrders.price,
          status: labOrders.status,
          urgency: labOrders.urgency,
          clinicalIndication: labOrders.clinicalIndication,
          orderedAt: labOrders.orderedAt,
          testId: labOrders.testId,
          testName: labTests.name,
          testCode: labTests.code,
        })
        .from(labOrders)
        .leftJoin(labTests, eq(labOrders.testId, labTests.id))
        .where(eq(labOrders.visitId, visitId))

      const response: ResponseApi<MedicalRecordData> = {
        message: "Medical record fetched successfully",
        data: {
          medicalRecord: record,
          diagnoses: diagnosisList,
          procedures: proceduresList,
          prescriptions: prescriptionsList,
          labOrders: labOrdersList,
          visit: visitInfo,
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical record fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)

/**
 * Medical Record Schema
 */
const medicalRecordSchema = z.object({
  visitId: z.string().optional(),
  soapSubjective: z.string().optional(),
  soapObjective: z.string().optional(),
  soapAssessment: z.string().optional(),
  soapPlan: z.string().optional(),
  physicalExam: z.string().optional(),
  laboratoryResults: z.string().optional(),
  radiologyResults: z.string().optional(),
  isDraft: z.boolean().default(true),
})

/**
 * PATCH /api/medical-records/[visitId]
 * Update medical record by visit ID
 * Requires: medical_records:write permission
 */
export const PATCH = withRBAC(
  async (request: NextRequest, context: { params: { visitId: string } }) => {
    try {
      const { visitId } = context.params
      const body = await request.json()
      const validatedData = medicalRecordSchema.parse(body)

      if (!visitId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit ID is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Get medical record by visitId
      const existing = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, visitId))
        .limit(1)

      if (existing.length === 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

      if (existing[0].isLocked) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Cannot update locked medical record",
          status: HTTP_STATUS_CODES.FORBIDDEN,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.FORBIDDEN,
        })
      }

      // Update medical record
      const updatedRecord = await db
        .update(medicalRecords)
        .set(validatedData)
        .where(eq(medicalRecords.id, existing[0].id))
        .returning()

      const response: ResponseApi<MedicalRecord> = {
        message: "Medical record updated successfully",
        data: updatedRecord[0],
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical record update error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to update medical record",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:write"] }
)
