import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import { db } from "@/db"
import { billings, payments } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { and, count, desc, eq, gte, lte, ne, sql, sum } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import type { ResponseApi, ResponseError } from "@/types/api"
import type { KpiDetailData, KpiKey } from "@/types/reports"
import { startOfDayWIB, endOfDayWIB } from "@/lib/utils/date"

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}
const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  partial: "Sebagian",
  paid: "Lunas",
}
const METHOD_LABELS: Record<string, string> = {
  cash: "Tunai",
  transfer: "Transfer",
  card: "Kartu",
  insurance: "Asuransi",
}

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const kpi = searchParams.get("kpi") as KpiKey | null
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")

      if (!kpi || !dateFrom || !dateTo) {
        const err: ResponseError<unknown> = {
          error: "Missing parameters",
          message: "kpi, dateFrom and dateTo are required",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(err, { status: HTTP_STATUS_CODES.BAD_REQUEST })
      }

      const from = startOfDayWIB(dateFrom)
      const to = endOfDayWIB(dateTo)

      let items: KpiDetailData["items"] = []
      let total = 0

      if (kpi === "terkumpul") {
        const rows = await db
          .select({
            id: payments.id,
            date: payments.receivedAt,
            patientName: patients.name,
            mrNumber: patients.mrNumber,
            visitNumber: visits.visitNumber,
            visitType: visits.visitType,
            amount: payments.amount,
            paymentMethod: payments.paymentMethod,
          })
          .from(payments)
          .innerJoin(billings, eq(payments.billingId, billings.id))
          .innerJoin(visits, eq(billings.visitId, visits.id))
          .innerJoin(patients, eq(visits.patientId, patients.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
          .orderBy(desc(payments.receivedAt))
          .limit(100)

        const [ct] = await db
          .select({ c: count(payments.id) })
          .from(payments)
          .innerJoin(billings, eq(payments.billingId, billings.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
        total = ct?.c ?? 0

        items = rows.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          patientName: r.patientName,
          mrNumber: r.mrNumber,
          visitNumber: r.visitNumber,
          visitType: VISIT_TYPE_LABELS[r.visitType] ?? r.visitType,
          amount: parseFloat(r.amount),
          paymentMethod: METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod,
        }))
      } else if (kpi === "total-tagihan") {
        const rows = await db
          .select({
            id: billings.id,
            date: billings.createdAt,
            patientName: patients.name,
            mrNumber: patients.mrNumber,
            visitNumber: visits.visitNumber,
            visitType: visits.visitType,
            totalAmount: billings.totalAmount,
            paymentStatus: billings.paymentStatus,
          })
          .from(billings)
          .innerJoin(visits, eq(billings.visitId, visits.id))
          .innerJoin(patients, eq(visits.patientId, patients.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
          .orderBy(desc(billings.createdAt))
          .limit(100)

        const [ct] = await db
          .select({ c: count(billings.id) })
          .from(billings)
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
        total = ct?.c ?? 0

        items = rows.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          patientName: r.patientName,
          mrNumber: r.mrNumber,
          visitNumber: r.visitNumber,
          visitType: VISIT_TYPE_LABELS[r.visitType] ?? r.visitType,
          totalAmount: parseFloat(r.totalAmount),
          paymentStatus: STATUS_LABELS[r.paymentStatus] ?? r.paymentStatus,
        }))
      } else if (kpi === "belum-lunas") {
        const rows = await db
          .select({
            id: billings.id,
            date: billings.createdAt,
            patientName: patients.name,
            mrNumber: patients.mrNumber,
            visitNumber: visits.visitNumber,
            visitType: visits.visitType,
            totalAmount: billings.totalAmount,
            paymentStatus: billings.paymentStatus,
          })
          .from(billings)
          .innerJoin(visits, eq(billings.visitId, visits.id))
          .innerJoin(patients, eq(visits.patientId, patients.id))
          .where(
            and(
              ne(billings.paymentStatus, "paid"),
              gte(billings.createdAt, from),
              lte(billings.createdAt, to)
            )
          )
          .orderBy(desc(billings.createdAt))
          .limit(100)

        const [ct] = await db
          .select({ c: count(billings.id) })
          .from(billings)
          .where(
            and(
              ne(billings.paymentStatus, "paid"),
              gte(billings.createdAt, from),
              lte(billings.createdAt, to)
            )
          )
        total = ct?.c ?? 0

        items = rows.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          patientName: r.patientName,
          mrNumber: r.mrNumber,
          visitNumber: r.visitNumber,
          visitType: VISIT_TYPE_LABELS[r.visitType] ?? r.visitType,
          totalAmount: parseFloat(r.totalAmount),
          paymentStatus: STATUS_LABELS[r.paymentStatus] ?? r.paymentStatus,
        }))
      } else if (kpi === "kunjungan") {
        const rows = await db
          .select({
            id: visits.id,
            date: visits.arrivalTime,
            visitNumber: visits.visitNumber,
            patientName: patients.name,
            mrNumber: patients.mrNumber,
            visitType: visits.visitType,
            status: visits.status,
            totalAmount: billings.totalAmount,
          })
          .from(visits)
          .innerJoin(patients, eq(visits.patientId, patients.id))
          .innerJoin(billings, eq(billings.visitId, visits.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
          .orderBy(desc(visits.arrivalTime))
          .limit(100)

        const [ct] = await db
          .select({ c: count(visits.id) })
          .from(visits)
          .innerJoin(billings, eq(billings.visitId, visits.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
        total = ct?.c ?? 0

        items = rows.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          visitNumber: r.visitNumber,
          patientName: r.patientName,
          mrNumber: r.mrNumber,
          visitType: VISIT_TYPE_LABELS[r.visitType] ?? r.visitType,
          status: r.status,
          totalAmount: r.totalAmount ? parseFloat(r.totalAmount) : null,
        }))
      } else if (kpi === "pasien") {
        const rows = await db
          .select({
            id: patients.id,
            mrNumber: patients.mrNumber,
            name: patients.name,
            visitCount: count(visits.id),
            totalSpent: sum(billings.totalAmount),
            lastVisit: sql<string>`MAX(${visits.arrivalTime})`,
          })
          .from(patients)
          .innerJoin(visits, eq(visits.patientId, patients.id))
          .innerJoin(billings, eq(billings.visitId, visits.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
          .groupBy(patients.id, patients.mrNumber, patients.name)
          .orderBy(desc(sum(billings.totalAmount)))
          .limit(100)

        const [ct] = await db
          .select({ c: sql<number>`count(distinct ${patients.id})` })
          .from(patients)
          .innerJoin(visits, eq(visits.patientId, patients.id))
          .innerJoin(billings, eq(billings.visitId, visits.id))
          .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
        total = Number(ct?.c ?? 0)

        items = rows.map((r) => ({
          id: r.id,
          mrNumber: r.mrNumber,
          name: r.name,
          visitCount: r.visitCount,
          totalSpent: parseFloat(r.totalSpent ?? "0"),
          lastVisit: r.lastVisit,
        }))
      }
      // collection-rate: no table rows needed, handled client-side

      const response: ResponseApi<KpiDetailData> = {
        data: { kpi, items, total, pageTotal: items.length },
        message: "KPI detail fetched successfully",
        status: HTTP_STATUS_CODES.OK,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("KPI detail error:", error)
      const err: ResponseError<unknown> = {
        error: error,
        message: "Failed to fetch KPI detail",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(err, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }
  },
  { permissions: ["system:reports"] }
)
