/**
 * Bed Transfer API Endpoint
 * POST /api/inpatient/transfer-bed
 * Transfers a patient from one bed to another
 * Requires: inpatient:manage_beds permission
 */

import z from "zod"
import { NextRequest, NextResponse } from "next/server"
import { eq, and, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { bedAssignments, rooms } from "@/db/schema/inpatient"
import { bedTransferSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"

export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()

      // Validate input
      const validatedData = bedTransferSchema.parse(body)

      // Execute bed transfer in a transaction
      await db.transaction(async (tx) => {
        // 1. Verify visit exists and is inpatient type
        const [visit] = await tx
          .select()
          .from(visits)
          .where(eq(visits.id, validatedData.visitId))
          .limit(1)

        if (!visit) {
          throw new Error("Visit not found")
        }

        if (visit.visitType !== "inpatient") {
          throw new Error("Only inpatient visits can be transferred")
        }

        // 2. Find current active bed assignment
        const [currentAssignment] = await tx
          .select({
            roomNumber: rooms.roomNumber,
            id: bedAssignments.id,
            roomId: bedAssignments.roomId,
            bedNumber: bedAssignments.bedNumber,
          })
          .from(bedAssignments)
          .leftJoin(rooms, eq(bedAssignments.roomId, rooms.id))
          .where(
            and(
              eq(bedAssignments.visitId, validatedData.visitId),
              isNull(bedAssignments.dischargedAt)
            )
          )
          .limit(1)

        if (!currentAssignment) {
          throw new Error("Patient does not have an active bed assignment")
        }

        // 3. Verify new room exists and has available beds
        const [newRoom] = await tx
          .select()
          .from(rooms)
          .where(eq(rooms.id, validatedData.newRoomId))
          .limit(1)

        if (!newRoom) {
          throw new Error("New room not found")
        }

        if (newRoom.availableBeds <= 0) {
          throw new Error("New room has no available beds")
        }

        // 4. Validate new bed number
        const newBedNum = parseInt(validatedData.newBedNumber)
        if (isNaN(newBedNum) || newBedNum < 1 || newBedNum > newRoom.bedCount) {
          throw new Error("New bed number is invalid")
        }

        // 5. Check if new bed is already occupied
        const [occupiedBed] = await tx
          .select()
          .from(bedAssignments)
          .where(
            and(
              eq(bedAssignments.roomId, validatedData.newRoomId),
              eq(bedAssignments.bedNumber, validatedData.newBedNumber),
              isNull(bedAssignments.dischargedAt)
            )
          )
          .limit(1)

        if (occupiedBed) {
          throw new Error(`Bed ${validatedData.newBedNumber} in the new room is already occupied`)
        }

        // 6. Close current bed assignment (set dischargedAt)
        await tx
          .update(bedAssignments)
          .set({
            dischargedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(bedAssignments.id, currentAssignment.id))

        // 7. Increment available beds in old room
        await tx
          .update(rooms)
          .set({
            availableBeds: sql`${rooms.availableBeds} + 1`,
          })
          .where(eq(rooms.id, currentAssignment.roomId))

        // 8. Create new bed assignment
        await tx.insert(bedAssignments).values({
          visitId: validatedData.visitId,
          roomId: validatedData.newRoomId,
          bedNumber: validatedData.newBedNumber,
          assignedBy: user.id,
          notes: `Transfer dari Kamar ${currentAssignment.roomNumber} Bed ${currentAssignment.bedNumber}. Alasan: ${validatedData.transferReason}`,
          assignedAt: sql`CURRENT_TIMESTAMP`,
        })

        // 9. Decrement available beds in new room
        await tx
          .update(rooms)
          .set({
            availableBeds: sql`${rooms.availableBeds} - 1`,
          })
          .where(eq(rooms.id, validatedData.newRoomId))

        // 10. Update visit with new roomId
        await tx
          .update(visits)
          .set({
            roomId: validatedData.newRoomId,
          })
          .where(eq(visits.id, validatedData.visitId))
      })

      const response: ResponseApi = {
        message: "Bed transferred successfully",
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }

        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Handle business logic errors
      const errorMessage = error instanceof Error ? error.message : "Failed to transfer bed"
      const response: ResponseError<unknown> = {
        error: errorMessage,
        message: errorMessage,
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["inpatient:manage_beds"] }
)
