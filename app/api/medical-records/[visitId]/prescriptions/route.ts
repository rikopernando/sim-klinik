import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { medicalRecords, prescriptions, drugs, user } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

interface PrescriptionWithDetails {
  id: string
  medicalRecordId: string | null
  drugId: string
  drugName: string
  drugPrice: string | null
  dosage: string | null
  frequency: string | null
  duration: string | null
  quantity: number
  instructions: string | null
  route: string | null
  isFulfilled: boolean | null
  fulfilledBy: string | null
  fulfilledAt: Date | null
  dispensedQuantity: number | null
  inventoryId: string | null
  notes: string | null
  addedByPharmacist: boolean | null
  addedByPharmacistId: string | null
  addedByPharmacistName: string | null
  approvedBy: string | null
  approvedAt: Date | null
  pharmacistNote: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

/**
 * GET /api/medical-records/[visitId]/prescriptions
 * Get prescriptions for a medical record by visit ID
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

      // Get medical record ID for this visit
      const [record] = await db
        .select({ id: medicalRecords.id })
        .from(medicalRecords)
        .where(eq(medicalRecords.visitId, visitId))
        .limit(1)

      if (!record) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Medical record not found for this visit",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.NOT_FOUND,
        })
      }

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

      const response: ResponseApi<PrescriptionWithDetails[]> = {
        message: "Prescriptions fetched successfully",
        data: prescriptionsList,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Prescriptions fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch prescriptions",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
