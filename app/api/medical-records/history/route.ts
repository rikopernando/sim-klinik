import { NextRequest, NextResponse } from "next/server"
import { eq, desc, inArray } from "drizzle-orm"

import { db } from "@/db"
import {
  medicalRecords,
  diagnoses,
  procedures,
  prescriptions,
  visits,
  drugs,
  patients,
} from "@/db/schema"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import {
  Diagnosis,
  MedicalRecord,
  MedicalRecordHistory,
  MedicalRecordHistoryData,
  MedicalRecordPrescription,
  Procedure,
} from "@/types/medical-record"

/**
 * Helper: Group array items by a key
 */
function groupBy<T>(array: T[], getKey: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of array) {
    const key = getKey(item)
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(item)
  }
  return map
}

/**
 * GET /api/medical-records/history?patientId=X
 * Get complete medical record history for a patient
 * Includes all diagnoses, procedures, and prescriptions
 * D.6: Display patient's previous medical record history
 * Requires: medical_records:read permission
 */
export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams
      const patientId = searchParams.get("patientId")

      if (!patientId) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "patientId parameter is required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      // Get patient information
      const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1)

      if (!patient) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Patient not found",
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
      }

      // Get all medical records for the patient with visit information
      const medicalRecordsList = await db
        .select({
          medicalRecord: medicalRecords,
          visit: visits,
        })
        .from(medicalRecords)
        .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
        .where(eq(visits.patientId, patientId))
        .orderBy(desc(medicalRecords.createdAt))

      // Return early if no medical records
      if (medicalRecordsList.length === 0) {
        const response: ResponseApi<MedicalRecordHistoryData> = {
          message: "No medical records",
          data: {
            patient: {
              ...patient,
              createdAt: patient.createdAt?.toISOString() || "",
              updatedAt: patient.updatedAt?.toISOString() || "",
              dateOfBirth: patient.dateOfBirth?.toISOString() || "",
            },
            history: [],
            totalRecords: 0,
          },
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }

        return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
      }

      // Extract all medical record IDs for batch fetching
      const medicalRecordIds = medicalRecordsList.map((r) => r.medicalRecord.id)

      // Batch fetch all related data (3 queries instead of N*3 queries)
      const [allDiagnoses, allProcedures, allPrescriptionsWithDrugs] = await Promise.all([
        // Fetch all diagnoses in one query
        db.select().from(diagnoses).where(inArray(diagnoses.medicalRecordId, medicalRecordIds)),

        // Fetch all procedures in one query
        db.select().from(procedures).where(inArray(procedures.medicalRecordId, medicalRecordIds)),

        // Fetch all prescriptions with drugs in one query
        db
          .select({
            prescription: prescriptions,
            drug: drugs,
          })
          .from(prescriptions)
          .leftJoin(drugs, eq(prescriptions.drugId, drugs.id))
          .where(inArray(prescriptions.medicalRecordId, medicalRecordIds)),
      ])

      // Group fetched data by medical record ID for O(1) lookup
      const diagnosesMap = groupBy(allDiagnoses, (d) => d.medicalRecordId)
      const proceduresMap = groupBy(allProcedures, (p) => p.medicalRecordId as string)
      const prescriptionsMap = groupBy(
        allPrescriptionsWithDrugs,
        (p) => p.prescription.medicalRecordId as string
      )

      // Build history with details (no more database queries)
      const historyWithDetails: MedicalRecordHistory[] = medicalRecordsList.map((record) => {
        const medicalRecordId = record.medicalRecord.id
        return {
          medicalRecord: record.medicalRecord as MedicalRecord,
          visit: record.visit,
          diagnoses: (diagnosesMap.get(medicalRecordId) || []) as Diagnosis[],
          procedures: (proceduresMap.get(medicalRecordId) || []) as unknown as Procedure[],
          prescriptions: (prescriptionsMap.get(medicalRecordId) ||
            []) as MedicalRecordPrescription[],
        }
      })

      const response: ResponseApi<MedicalRecordHistoryData> = {
        message: "Medical record history fetch successfully",
        data: {
          patient: {
            ...patient,
            createdAt: patient.createdAt?.toISOString() || "",
            updatedAt: patient.updatedAt?.toISOString() || "",
            dateOfBirth: patient.dateOfBirth?.toISOString() || "",
          },
          history: historyWithDetails,
          totalRecords: historyWithDetails.length,
        },
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Medical record history fetch error:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to fetch medical record history",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["medical_records:read"] }
)
