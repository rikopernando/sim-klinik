import { desc, like, and, eq, gte, lt } from "drizzle-orm"

import { db } from "@/db"
import { patients, visits } from "@/db/schema"

/**
 * Generate unique Medical Record (MR) Number
 * Format: MR-YYYYMMDD-NNNN
 * Example: MR-20251113-0001
 */
export async function generateMRNumber(): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const datePrefix = `${year}${month}${day}`

  // Get the last MR number for today
  const lastPatient = await db
    .select({ mrNumber: patients.mrNumber })
    .from(patients)
    .where(like(patients.mrNumber, `MR-${datePrefix}-%`))
    .orderBy(desc(patients.mrNumber))
    .limit(1)

  let sequence = 1
  if (lastPatient.length > 0 && lastPatient[0].mrNumber) {
    // Extract sequence number from last MR number
    const parts = lastPatient[0].mrNumber.split("-")
    if (parts.length === 3) {
      sequence = parseInt(parts[2], 10) + 1
    }
  }

  const sequenceStr = String(sequence).padStart(4, "0")
  return `MR-${datePrefix}-${sequenceStr}`
}

/**
 * Generate unique Visit Number
 * Format: V-YYYYMMDD-NNNN
 * Example: V-20251113-0001
 */
export async function generateVisitNumber(): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const datePrefix = `${year}${month}${day}`

  // Get the last visit number for today
  const lastVisit = await db
    .select({ visitNumber: visits.visitNumber })
    .from(visits)
    .where(like(visits.visitNumber, `V-${datePrefix}-%`))
    .orderBy(desc(visits.visitNumber))
    .limit(1)

  let sequence = 1
  if (lastVisit.length > 0 && lastVisit[0].visitNumber) {
    const parts = lastVisit[0].visitNumber.split("-")
    if (parts.length === 3) {
      sequence = parseInt(parts[2], 10) + 1
    }
  }

  const sequenceStr = String(sequence).padStart(4, "0")
  return `V-${datePrefix}-${sequenceStr}`
}

/**
 * Generate Queue Number for outpatient visits
 * Format: A001, A002, etc. per poli per day
 */
export async function generateQueueNumber(poliId: string): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Count visits for this poli today
  const todayVisits = await db
    .select({ queueNumber: visits.queueNumber })
    .from(visits)
    .where(
      and(
        eq(visits.poliId, poliId),
        gte(visits.arrivalTime, today),
        lt(visits.arrivalTime, tomorrow)
      )
    )
    .orderBy(desc(visits.queueNumber))
    .limit(1)

  let sequence = 1
  if (todayVisits.length > 0 && todayVisits[0].queueNumber) {
    // Extract number from queue (e.g., "A001" -> 1)
    const match = todayVisits[0].queueNumber.match(/\d+/)
    if (match) {
      sequence = parseInt(match[0], 10) + 1
    }
  }

  const sequenceStr = String(sequence).padStart(3, "0")
  return `A${sequenceStr}`
}
