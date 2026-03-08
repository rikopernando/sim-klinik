/**
 * Outpatient API Service Layer
 * Handles database operations for Outpatient module transfers
 */

import { db } from "@/db"
import { visits } from "@/db/schema"
import { bedAssignments, rooms } from "@/db/schema/inpatient"
import { eq, and, isNull, sql } from "drizzle-orm"
import { getInitialVisitStatus } from "@/types/visit-status"
import { TransferToInpatientInput } from "./validation"

/**
 * Transfer Outpatient to Inpatient Service
 * Changes visit type, creates bed assignment, updates room availability
 */
export async function performTransferToInpatient(data: TransferToInpatientInput, userId: string) {
  // Execute in transaction for atomicity
  return await db.transaction(async (tx) => {
    // 1. Verify visit exists and is outpatient type
    const [existingVisit] = await tx
      .select()
      .from(visits)
      .where(eq(visits.id, data.visitId))
      .limit(1)

    if (!existingVisit) {
      throw new Error("Kunjungan tidak ditemukan")
    }

    if (existingVisit.visitType !== "outpatient") {
      throw new Error("Hanya kunjungan rawat jalan yang dapat ditransfer ke rawat inap")
    }

    // Validate status - cannot transfer cancelled or completed visits
    const invalidStatuses = ["cancelled", "completed"]
    if (invalidStatuses.includes(existingVisit.status)) {
      throw new Error("Kunjungan dengan status ini tidak dapat ditransfer")
    }

    // 2. Verify room exists and has available beds
    const [room] = await tx.select().from(rooms).where(eq(rooms.id, data.roomId)).limit(1)

    if (!room) {
      throw new Error("Kamar tidak ditemukan")
    }

    if (room.availableBeds <= 0) {
      throw new Error("Kamar tidak memiliki bed tersedia")
    }

    // 3. Validate bed number
    const bedNum = parseInt(data.bedNumber)
    if (isNaN(bedNum) || bedNum < 1 || bedNum > room.bedCount) {
      throw new Error(`Nomor bed harus antara 1 dan ${room.bedCount}`)
    }

    // 4. Check if bed is already occupied
    const [occupiedBed] = await tx
      .select()
      .from(bedAssignments)
      .where(
        and(
          eq(bedAssignments.roomId, data.roomId),
          eq(bedAssignments.bedNumber, data.bedNumber),
          isNull(bedAssignments.dischargedAt)
        )
      )
      .limit(1)

    if (occupiedBed) {
      throw new Error(`Bed ${data.bedNumber} sudah terisi`)
    }

    // 5. Get initial status for inpatient
    const newStatus = getInitialVisitStatus("inpatient")

    // 6. Prepare transfer notes
    const transferTimestamp = new Date().toLocaleString("id-ID")
    const existingNotes = existingVisit.notes || ""
    const transferNotes = data.notes
      ? existingNotes
        ? `${existingNotes}\n\n[TRANSFER RJ→RI - ${transferTimestamp}] ${data.notes}`
        : `[TRANSFER RJ→RI - ${transferTimestamp}] ${data.notes}`
      : existingNotes
        ? `${existingNotes}\n\n[TRANSFER RJ→RI - ${transferTimestamp}] Pasien ditransfer dari rawat jalan ke rawat inap`
        : `[TRANSFER RJ→RI - ${transferTimestamp}] Pasien ditransfer dari rawat jalan ke rawat inap`

    // 7. Update visit record
    const [updatedVisit] = await tx
      .update(visits)
      .set({
        visitType: "inpatient",
        status: newStatus,
        poliId: null, // Clear outpatient field
        queueNumber: null, // Clear outpatient field
        roomId: data.roomId, // Set inpatient field
        admissionDate: sql`CURRENT_TIMESTAMP`,
        notes: transferNotes,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(visits.id, data.visitId))
      .returning()

    // 8. Create bed assignment
    await tx.insert(bedAssignments).values({
      visitId: data.visitId,
      roomId: data.roomId,
      bedNumber: data.bedNumber,
      assignedBy: userId,
      notes: `Transfer dari Rawat Jalan`,
      assignedAt: sql`CURRENT_TIMESTAMP`,
    })

    // 9. Update room available beds (decrement)
    await tx
      .update(rooms)
      .set({
        availableBeds: sql`${rooms.availableBeds} - 1`,
      })
      .where(eq(rooms.id, data.roomId))

    return updatedVisit
  })
}
