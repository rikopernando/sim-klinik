/**
 * Inpatient Patient Detail API Endpoint
 * GET /api/inpatient/patients/[visitId] - Get detailed patient information
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { bedAssignments, vitalsHistory, rooms } from "@/db/schema/inpatient"
import { cppt } from "@/db/schema/medical-records"
import { materialUsage } from "@/db/schema/inpatient"
import { eq, desc, and, isNull } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { ResponseApi, ResponseError } from "@/types/api"
import { calculateDaysInHospital } from "@/lib/inpatient/api-service"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ visitId: string }> }
) {
  try {
    const { visitId } = await context.params

    // Get patient and visit information
    const visitResult = await db
      .select()
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .where(eq(visits.id, visitId))
      .limit(1)

    if (visitResult.length === 0) {
      const response: ResponseError<unknown> = {
        error: null,
        status: HTTP_STATUS_CODES.NOT_FOUND,
        message: "Patient visit not found",
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.NOT_FOUND })
    }

    const visitData = {
      visitId: visitResult[0].visits.id,
      visitNumber: visitResult[0].visits.visitNumber,
      visitType: visitResult[0].visits.visitType,
      admissionDate: visitResult[0].visits.admissionDate,
      dischargeDate: visitResult[0].visits.dischargeDate,
      patientId: visitResult[0].patients.id,
      mrNumber: visitResult[0].patients.mrNumber,
      patientName: visitResult[0].patients.name,
      nik: visitResult[0].patients.nik,
      dateOfBirth: visitResult[0].patients.dateOfBirth,
      gender: visitResult[0].patients.gender,
      address: visitResult[0].patients.address,
      phone: visitResult[0].patients.phone,
      insurance: visitResult[0].patients.insuranceType,
    }

    // Get current bed assignment
    const bedAssignmentResult = await db
      .select({
        assignmentId: bedAssignments.id,
        roomId: rooms.id,
        roomNumber: rooms.roomNumber,
        roomType: rooms.roomType,
        bedNumber: bedAssignments.bedNumber,
        assignedAt: bedAssignments.assignedAt,
        dischargedAt: bedAssignments.dischargedAt,
        notes: bedAssignments.notes,
        dailyRate: rooms.dailyRate,
      })
      .from(bedAssignments)
      .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
      .where(and(eq(bedAssignments.visitId, visitId), isNull(bedAssignments.dischargedAt)))
      .orderBy(desc(bedAssignments.assignedAt))
      .limit(1)

    const currentBedAssignment = bedAssignmentResult.length > 0 ? bedAssignmentResult[0] : null

    // Get vital signs history
    const vitals = await db
      .select()
      .from(vitalsHistory)
      .where(eq(vitalsHistory.visitId, visitId))
      .orderBy(desc(vitalsHistory.recordedAt))

    // Get CPPT entries
    const cpptEntries = await db
      .select()
      .from(cppt)
      .where(eq(cppt.visitId, visitId))
      .orderBy(desc(cppt.createdAt))

    // Get material usage
    const materials = await db
      .select()
      .from(materialUsage)
      .where(eq(materialUsage.visitId, visitId))
      .orderBy(desc(materialUsage.usedAt))

    // Calculate total material cost
    const totalMaterialCost = materials.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice || "0")
    }, 0)

    // Calculate days in hospital
    const daysInHospital = visitData.admissionDate
      ? calculateDaysInHospital(new Date(visitData.admissionDate))
      : 0

    // Calculate total room cost
    const totalRoomCost = currentBedAssignment
      ? parseFloat(currentBedAssignment.dailyRate) * daysInHospital
      : 0

    const responseData = {
      patient: visitData,
      bedAssignment: currentBedAssignment,
      daysInHospital,
      totalRoomCost: totalRoomCost.toFixed(2),
      vitals,
      cpptEntries,
      materials,
      totalMaterialCost: totalMaterialCost.toFixed(2),
    }

    const response: ResponseApi<typeof responseData> = {
      status: HTTP_STATUS_CODES.OK,
      message: "Patient detail fetched successfully",
      data: responseData,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching patient detail:", error)
    return NextResponse.json(
      {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch patient detail",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}
