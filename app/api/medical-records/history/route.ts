import { NextRequest, NextResponse } from "next/server"
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
import { eq, desc } from "drizzle-orm"
import { withRBAC } from "@/lib/rbac/middleware"

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
        return NextResponse.json({ error: "patientId parameter is required" }, { status: 400 })
      }

      const patientIdNum = parseInt(patientId, 10)

      // Get patient information
      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientIdNum))
        .limit(1)

      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }

      // Get all medical records for the patient with visit information
      const medicalRecordsList = await db
        .select({
          medicalRecord: medicalRecords,
          visit: visits,
        })
        .from(medicalRecords)
        .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
        .where(eq(visits.patientId, patientIdNum))
        .orderBy(desc(medicalRecords.createdAt))

      // For each medical record, fetch related data
      const historyWithDetails = await Promise.all(
        medicalRecordsList.map(async (record) => {
          const medicalRecordId = record.medicalRecord.id

          // Get diagnoses
          const diagnosisList = await db
            .select()
            .from(diagnoses)
            .where(eq(diagnoses.medicalRecordId, medicalRecordId))

          // Get procedures
          const proceduresList = await db
            .select()
            .from(procedures)
            .where(eq(procedures.medicalRecordId, medicalRecordId))

          // Get prescriptions with drug information
          const prescriptionsList = await db
            .select({
              prescription: prescriptions,
              drug: drugs,
            })
            .from(prescriptions)
            .leftJoin(drugs, eq(prescriptions.drugId, drugs.id))
            .where(eq(prescriptions.medicalRecordId, medicalRecordId))

          return {
            medicalRecord: record.medicalRecord,
            visit: record.visit,
            diagnoses: diagnosisList,
            procedures: proceduresList,
            prescriptions: prescriptionsList,
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: {
          patient: {
            id: patient.id,
            mrNumber: patient.mrNumber,
            name: patient.name,
            nik: patient.nik,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            allergies: patient.allergies,
          },
          history: historyWithDetails,
          totalRecords: historyWithDetails.length,
        },
      })
    } catch (error) {
      console.error("Medical record history fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch medical record history" }, { status: 500 })
    }
  },
  { permissions: ["medical_records:read"] }
)
