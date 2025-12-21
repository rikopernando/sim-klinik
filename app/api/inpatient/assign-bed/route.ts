/**
 * Bed Assignment API Endpoint
 * POST /api/inpatient/assign-bed
 * Assigns a patient to a specific bed in a room
 */

import { NextRequest, NextResponse } from "next/server"
import { eq, and, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { bedAssignments, rooms } from "@/db/schema/inpatient"
import { bedAssignmentSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constans/http"
import { getSession } from "@/lib/rbac"
import z from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = bedAssignmentSchema.parse(body)

    // Execute bed assignment in a transaction
    await db.transaction(async (tx) => {
      // 1. Verify visit exists and is inpatient type
      const [visit] = await tx
        .select()
        .from(visits)
        .where(eq(visits.id, validatedData.visitId))
        .limit(1)

      if (!visit) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Visit not found",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      if (visit.visitType !== "inpatient") {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Only inpatient visits can be assigned a bed",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // 2. Check if visit already has an active bed assignment
      const [existingAssignment] = await tx
        .select()
        .from(bedAssignments)
        .where(
          and(
            eq(bedAssignments.visitId, validatedData.visitId),
            isNull(bedAssignments.dischargedAt)
          )
        )
        .limit(1)

      if (existingAssignment) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Patient already has an active bed assignment, please discharge it first.",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // 3. Verify room exists and has available beds
      const [room] = await tx
        .select()
        .from(rooms)
        .where(eq(rooms.id, validatedData.roomId))
        .limit(1)

      if (!room) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Room not found",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      if (room.availableBeds <= 0) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Room has no available beds",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // 4. Validate bed number
      const bedNum = parseInt(validatedData.bedNumber)
      if (isNaN(bedNum) || bedNum < 1 || bedNum > room.bedCount) {
        const response: ResponseError<unknown> = {
          error: {},
          message: "Bed number is invalid",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // 5. Check if bed is already occupied
      const [occupiedBed] = await tx
        .select()
        .from(bedAssignments)
        .where(
          and(
            eq(bedAssignments.roomId, validatedData.roomId),
            eq(bedAssignments.bedNumber, validatedData.bedNumber),
            isNull(bedAssignments.dischargedAt)
          )
        )
        .limit(1)

      if (occupiedBed) {
        // throw new Error(`Bed ${validatedData.bedNumber} sudah ditempati`)
        const response: ResponseError<unknown> = {
          error: {},
          message: `Bed ${validatedData.bedNumber} already filled`,
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // 6. Create bed assignment
      const session = await getSession()
      const [assignment] = await tx
        .insert(bedAssignments)
        .values({
          visitId: validatedData.visitId,
          roomId: validatedData.roomId,
          bedNumber: validatedData.bedNumber,
          assignedBy: session?.user.id,
          notes: validatedData.notes || null,
          assignedAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning()

      // 7. Update room available beds (decrement)
      await tx
        .update(rooms)
        .set({
          availableBeds: sql`${rooms.availableBeds} - 1`,
        })
        .where(eq(rooms.id, validatedData.roomId))

      // 8. Update visit with roomId and admissionDate
      await tx
        .update(visits)
        .set({
          roomId: validatedData.roomId,
          admissionDate: sql`COALESCE(${visits.admissionDate}, CURRENT_TIMESTAMP)`,
        })
        .where(eq(visits.id, validatedData.visitId))

      return assignment
    })

    const response: ResponseApi = {
      message: "Bed assigned successfully",
      status: HTTP_STATUS_CODES.CREATED,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ResponseError<unknown> = {
        error: error.issues,
        message: "Validation error",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }

    // Handle business logic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to assign bed"
    const response: ResponseError<unknown> = {
      error: errorMessage,
      message: errorMessage,
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
