import { db } from "@/db"
import { billings, billingItems, payments } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { and, eq, gte, lte, ne, sql, sum, count } from "drizzle-orm"
import type {
  ReportSummary,
  DailyTrendItem,
  ServiceTypeItem,
  PaymentMethodItem,
  VisitTypeItem,
} from "@/types/reports"

function toDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z")
}

function toDateEnd(dateStr: string): Date {
  return new Date(dateStr + "T23:59:59.999Z")
}

async function getSummary(dateFrom: string, dateTo: string): Promise<ReportSummary> {
  const from = toDate(dateFrom)
  const to = toDateEnd(dateTo)

  const [billedResult, collectedResult, outstandingResult, visitResult] = await Promise.all([
    // Total billed in period (billings created in range)
    db
      .select({ total: sum(billings.totalAmount) })
      .from(billings)
      .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to))),

    // Total collected in period (payments received in range)
    db
      .select({ total: sum(payments.amount), txCount: count(payments.id) })
      .from(payments)
      .where(and(gte(payments.receivedAt, from), lte(payments.receivedAt, to))),

    // Outstanding: billings not fully paid, created in period
    db
      .select({ total: sum(billings.remainingAmount) })
      .from(billings)
      .where(
        and(
          ne(billings.paymentStatus, "paid"),
          gte(billings.createdAt, from),
          lte(billings.createdAt, to)
        )
      ),

    // Visit count + unique patient count — both keyed on billings.createdAt
    db
      .select({
        visitCount: count(visits.id),
        patientCount: sql<number>`count(distinct ${visits.patientId})`,
      })
      .from(visits)
      .innerJoin(billings, eq(billings.visitId, visits.id))
      .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to))),
  ])

  // Total discount in period
  const [discountResult] = await db
    .select({ total: sum(billings.discount) })
    .from(billings)
    .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))

  const totalBilled = parseFloat(billedResult[0]?.total ?? "0")
  const totalCollected = parseFloat(collectedResult[0]?.total ?? "0")
  const outstanding = parseFloat(outstandingResult[0]?.total ?? "0")
  const visitCount = visitResult[0]?.visitCount ?? 0
  const patientCount = Number(visitResult[0]?.patientCount ?? 0)
  const totalDiscount = parseFloat(discountResult?.total ?? "0")
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

  return {
    totalBilled,
    totalCollected,
    outstanding,
    collectionRate,
    visitCount,
    patientCount,
    totalDiscount,
  }
}

async function getDailyTrend(dateFrom: string, dateTo: string): Promise<DailyTrendItem[]> {
  const from = toDate(dateFrom)
  const to = toDateEnd(dateTo)

  const rows = await db
    .select({
      date: sql<string>`DATE(${payments.receivedAt} AT TIME ZONE 'UTC')`.as("date"),
      revenue: sum(payments.amount),
      transactions: count(payments.id),
    })
    .from(payments)
    .where(and(gte(payments.receivedAt, from), lte(payments.receivedAt, to)))
    .groupBy(sql`DATE(${payments.receivedAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE(${payments.receivedAt} AT TIME ZONE 'UTC')`)

  return rows.map((r) => ({
    date: r.date,
    revenue: parseFloat(r.revenue ?? "0"),
    transactions: r.transactions,
  }))
}

async function getByServiceType(dateFrom: string, dateTo: string): Promise<ServiceTypeItem[]> {
  const from = toDate(dateFrom)
  const to = toDateEnd(dateTo)

  const rows = await db
    .select({
      serviceType: billingItems.itemType,
      revenue: sum(billingItems.totalPrice),
      count: count(billingItems.id),
    })
    .from(billingItems)
    .innerJoin(billings, eq(billingItems.billingId, billings.id))
    .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
    .groupBy(billingItems.itemType)
    .orderBy(sql`SUM(${billingItems.totalPrice}) DESC`)

  return rows.map((r) => ({
    serviceType: r.serviceType,
    revenue: parseFloat(r.revenue ?? "0"),
    count: r.count,
  }))
}

async function getByPaymentMethod(dateFrom: string, dateTo: string): Promise<PaymentMethodItem[]> {
  const from = toDate(dateFrom)
  const to = toDateEnd(dateTo)

  const rows = await db
    .select({
      paymentMethod: payments.paymentMethod,
      amount: sum(payments.amount),
      count: count(payments.id),
    })
    .from(payments)
    .where(and(gte(payments.receivedAt, from), lte(payments.receivedAt, to)))
    .groupBy(payments.paymentMethod)
    .orderBy(sql`SUM(${payments.amount}) DESC`)

  return rows.map((r) => ({
    paymentMethod: r.paymentMethod,
    amount: parseFloat(r.amount ?? "0"),
    count: r.count,
  }))
}

async function getByVisitType(dateFrom: string, dateTo: string): Promise<VisitTypeItem[]> {
  const from = toDate(dateFrom)
  const to = toDateEnd(dateTo)

  const rows = await db
    .select({
      visitType: visits.visitType,
      revenue: sum(billings.totalAmount),
      count: count(visits.id),
    })
    .from(billings)
    .innerJoin(visits, eq(billings.visitId, visits.id))
    .where(and(gte(billings.createdAt, from), lte(billings.createdAt, to)))
    .groupBy(visits.visitType)
    .orderBy(sql`SUM(${billings.totalAmount}) DESC`)

  return rows.map((r) => ({
    visitType: r.visitType,
    revenue: parseFloat(r.revenue ?? "0"),
    count: r.count,
  }))
}

export async function getFinancialReport(
  dateFrom: string,
  dateTo: string,
  prevDateFrom?: string,
  prevDateTo?: string
) {
  const [summary, dailyTrend, byServiceType, byPaymentMethod, byVisitType, previousSummary] =
    await Promise.all([
      getSummary(dateFrom, dateTo),
      getDailyTrend(dateFrom, dateTo),
      getByServiceType(dateFrom, dateTo),
      getByPaymentMethod(dateFrom, dateTo),
      getByVisitType(dateFrom, dateTo),
      prevDateFrom && prevDateTo
        ? getSummary(prevDateFrom, prevDateTo)
        : Promise.resolve(undefined),
    ])

  return { summary, previousSummary, dailyTrend, byServiceType, byPaymentMethod, byVisitType }
}
