import { db } from "@/db"
import { visits } from "@/db/schema/visits"
import { billings, payments } from "@/db/schema/billing"
import { inventoryBatches, prescriptions } from "@/db/schema/inventory"
import { medicalRecords } from "@/db/schema/medical-records"
import { rooms } from "@/db/schema/inpatient"
import { patients } from "@/db/schema/patients"
import { and, count, eq, gte, lt, lte, ne, notInArray, or, sum } from "drizzle-orm"

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function toNumber(val: string | null | undefined): number {
  return parseFloat(val ?? "0") || 0
}

export interface AdminDashboardStats {
  todayVisits: number
  todayRevenue: number
  pendingBillings: number
  activeInpatients: number
}

export async function getAdminStats(): Promise<AdminDashboardStats> {
  const { start, end } = todayRange()

  const [visitRes, revenueRes, pendingRes, inpatientRes] = await Promise.all([
    db.select({ count: count() }).from(visits).where(gte(visits.arrivalTime, start)),

    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(gte(payments.receivedAt, start), lte(payments.receivedAt, end))),

    db
      .select({ count: count() })
      .from(billings)
      .where(or(eq(billings.paymentStatus, "pending"), eq(billings.paymentStatus, "partial"))),

    db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          eq(visits.visitType, "inpatient"),
          notInArray(visits.status, ["completed", "cancelled"])
        )
      ),
  ])

  return {
    todayVisits: visitRes[0]?.count ?? 0,
    todayRevenue: toNumber(revenueRes[0]?.total),
    pendingBillings: pendingRes[0]?.count ?? 0,
    activeInpatients: inpatientRes[0]?.count ?? 0,
  }
}

export interface DoctorDashboardStats {
  todayWaiting: number
  todayCompleted: number
  unlockedRecords: number
}

export async function getDoctorStats(doctorId: string): Promise<DoctorDashboardStats> {
  const { start } = todayRange()

  const [todayVisits, unlockedRes] = await Promise.all([
    db
      .select({ status: visits.status })
      .from(visits)
      .where(and(eq(visits.doctorId, doctorId), gte(visits.arrivalTime, start))),

    db
      .select({ count: count() })
      .from(medicalRecords)
      .where(and(eq(medicalRecords.authorId, doctorId), eq(medicalRecords.isLocked, false))),
  ])

  const waiting = todayVisits.filter((v) =>
    ["registered", "waiting", "in_examination"].includes(v.status)
  ).length
  const completed = todayVisits.filter((v) =>
    ["examined", "ready_for_billing", "billed", "paid", "completed"].includes(v.status)
  ).length

  return {
    todayWaiting: waiting,
    todayCompleted: completed,
    unlockedRecords: unlockedRes[0]?.count ?? 0,
  }
}

export interface NurseDashboardStats {
  activeInpatients: number
  availableRooms: number
  todayVitals: number
}

export async function getNurseStats(): Promise<NurseDashboardStats> {
  const { start } = todayRange()

  const [inpatientRes, roomRes, vitalsRes] = await Promise.all([
    db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          eq(visits.visitType, "inpatient"),
          notInArray(visits.status, ["completed", "cancelled"])
        )
      ),

    db
      .select({ count: count() })
      .from(rooms)
      .where(and(eq(rooms.status, "available"), eq(rooms.isActive, "active"))),

    db
      .select({ count: count() })
      .from(visits)
      .where(and(eq(visits.visitType, "inpatient"), gte(visits.arrivalTime, start))),
  ])

  return {
    activeInpatients: inpatientRes[0]?.count ?? 0,
    availableRooms: roomRes[0]?.count ?? 0,
    todayVitals: vitalsRes[0]?.count ?? 0,
  }
}

export interface PharmacistDashboardStats {
  pendingPrescriptions: number
  lowStockItems: number
  expiringItems: number
}

export async function getPharmacistStats(): Promise<PharmacistDashboardStats> {
  const now = new Date()
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  const [prescRes, lowStockRes, expiringRes] = await Promise.all([
    db.select({ count: count() }).from(prescriptions).where(eq(prescriptions.isFulfilled, false)),

    db
      .select({ count: count() })
      .from(inventoryBatches)
      .where(and(lt(inventoryBatches.stockQuantity, 10), ne(inventoryBatches.stockQuantity, 0))),

    db
      .select({ count: count() })
      .from(inventoryBatches)
      .where(
        and(
          gte(inventoryBatches.expiryDate, now),
          lte(inventoryBatches.expiryDate, in30Days),
          ne(inventoryBatches.stockQuantity, 0)
        )
      ),
  ])

  return {
    pendingPrescriptions: prescRes[0]?.count ?? 0,
    lowStockItems: lowStockRes[0]?.count ?? 0,
    expiringItems: expiringRes[0]?.count ?? 0,
  }
}

export interface CashierDashboardStats {
  pendingBillings: number
  todayRevenue: number
  todayCash: number
}

export async function getCashierStats(): Promise<CashierDashboardStats> {
  const { start, end } = todayRange()

  const [pendingRes, revenueRes, cashRes] = await Promise.all([
    db
      .select({ count: count() })
      .from(billings)
      .where(or(eq(billings.paymentStatus, "pending"), eq(billings.paymentStatus, "partial"))),

    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(gte(payments.receivedAt, start), lte(payments.receivedAt, end))),

    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          eq(payments.paymentMethod, "cash"),
          gte(payments.receivedAt, start),
          lte(payments.receivedAt, end)
        )
      ),
  ])

  return {
    pendingBillings: pendingRes[0]?.count ?? 0,
    todayRevenue: toNumber(revenueRes[0]?.total),
    todayCash: toNumber(cashRes[0]?.total),
  }
}

export interface ReceptionistDashboardStats {
  todayVisits: number
  newPatients: number
  activeQueue: number
}

export async function getReceptionistStats(): Promise<ReceptionistDashboardStats> {
  const { start } = todayRange()

  const [visitRes, patientRes, queueRes] = await Promise.all([
    db.select({ count: count() }).from(visits).where(gte(visits.arrivalTime, start)),

    db.select({ count: count() }).from(patients).where(gte(patients.createdAt, start)),

    db
      .select({ count: count() })
      .from(visits)
      .where(
        and(
          gte(visits.arrivalTime, start),
          notInArray(visits.status, [
            "examined",
            "ready_for_billing",
            "billed",
            "paid",
            "completed",
            "cancelled",
          ])
        )
      ),
  ])

  return {
    todayVisits: visitRes[0]?.count ?? 0,
    newPatients: patientRes[0]?.count ?? 0,
    activeQueue: queueRes[0]?.count ?? 0,
  }
}
