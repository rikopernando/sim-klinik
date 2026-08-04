/**
 * Bed Assignment API Endpoint
 * POST /api/inpatient/assign-bed
 * Assigns a patient to a specific bed in a room
 * Requires: inpatient:manage_beds permission
 */

import { NextRequest, NextResponse } from "next/server"
import { eq, and, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { bedAssignments, rooms } from "@/db/schema/inpatient"
import { bedAssignmentSchema } from "@/lib/inpatient/validation"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { withRBAC } from "@/lib/rbac/middleware"
import z from "zod"

export const POST = withRBAC(
  async (request: NextRequest, { user }) => {
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
          throw new Error("Visit tidak ditemukan")
        }

        if (visit.visitType !== "inpatient") {
          throw new Error("Hanya visit rawat inap yang dapat dialokasikan bed")
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
          throw new Error(
            "Pasien sudah memiliki alokasi bed aktif, mohon pulangkan terlebih dahulu."
          )
        }

        // 3. Verify room exists and has available beds
        const [room] = await tx
          .select()
          .from(rooms)
          .where(eq(rooms.id, validatedData.roomId))
          .limit(1)

        if (!room) {
          throw new Error("Kamar tidak ditemukan")
        }

        if (room.availableBeds <= 0) {
          throw new Error("Kamar tidak memiliki bed yang tersedia")
        }

        // 4. Validate bed number
        const bedNum = parseInt(validatedData.bedNumber)
        if (isNaN(bedNum) || bedNum < 1 || bedNum > room.bedCount) {
          throw new Error("Nomor bed tidak valid")
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
          throw new Error(`Bed ${validatedData.bedNumber} sudah terisi`)
        }

        // 6. Create bed assignment
        const [assignment] = await tx
          .insert(bedAssignments)
          .values({
            visitId: validatedData.visitId,
            roomId: validatedData.roomId,
            bedNumber: validatedData.bedNumber,
            assignedBy: user.id,
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
            status: "in_examination",
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
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      // Handle business logic errors
      const errorMessage = error instanceof Error ? error.message : "Gagal mengalokasikan bed"
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
