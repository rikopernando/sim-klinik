import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { medicalRecords, procedures, user, services } from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

interface ProcedureWithDetails {
  id: string
  medicalRecordId: string | null
  serviceId: string | null
  serviceName: string | null
  servicePrice: string | null
  icd9Code: string | null
  description: string | null
  performedBy: string | null
  performedByName: string | null
  performedAt: Date | null
  notes: string | null
  createdAt: Date | null
}

/**
 * GET /api/medical-records/[visitId]/procedures
 * Get procedures for a medical record by visit ID
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

      const response: ResponseApi<ProcedureWithDetails[]> = {
        message: "Procedures fetched successfully",
        data: proceduresList,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Procedures fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch procedures",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
