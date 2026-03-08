/**
 * Transaction History API Endpoint
 * GET /api/billing/transactions - Get payment transaction history
 * Requires: billing:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { payments, billings } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { and, count, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"
import type { TransactionHistoryItem } from "@/types/transaction"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export const GET = withRBAC(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)

      // Extract and parse query parameters
      const filters = {
        search: searchParams.get("search") || undefined,
        paymentMethod: searchParams.get("paymentMethod") || undefined,
        visitType: searchParams.get("visitType") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
      }

      const page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE))
      const limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT))
      const offset = (page - 1) * limit

      // Build WHERE conditions
      const conditions: SQL[] = []

      // Search by patient name, MR number, or visit number
      if (filters.search) {
        conditions.push(
          or(
            ilike(patients.name, `%${filters.search}%`),
            ilike(patients.mrNumber, `%${filters.search}%`),
            ilike(visits.visitNumber, `%${filters.search}%`)
          )!
        )
      }

      // Filter by payment method
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        conditions.push(eq(payments.paymentMethod, filters.paymentMethod))
      }

      // Filter by visit type
      if (filters.visitType && filters.visitType !== "all") {
        conditions.push(eq(visits.visitType, filters.visitType))
      }

      // Filter by date range (using payments.receivedAt)
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        dateFrom.setHours(0, 0, 0, 0)
        conditions.push(gte(payments.receivedAt, dateFrom))
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59, 999)
        conditions.push(lte(payments.receivedAt, dateTo))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // Get total count for pagination
      const [{ total }] = await db
        .select({ total: count() })
        .from(payments)
        .innerJoin(billings, eq(payments.billingId, billings.id))
        .innerJoin(visits, eq(billings.visitId, visits.id))
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .innerJoin(user, eq(payments.receivedBy, user.id))
        .where(whereClause)

      // Early return if no results
      if (total === 0) {
        const response: ResponseApi<TransactionHistoryItem[]> = {
          status: HTTP_STATUS_CODES.OK,
          message: "Transaction history fetched successfully",
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        }
        return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
      }

      // Fetch transactions with related data
      const results = await db
        .select({
          // Payment fields
          paymentId: payments.id,
          paymentAmount: payments.amount,
          paymentMethod: payments.paymentMethod,
          paymentReference: payments.paymentReference,
          amountReceived: payments.amountReceived,
          changeGiven: payments.changeGiven,
          receivedAt: payments.receivedAt,
          paymentNotes: payments.notes,
          // Billing fields
          billingId: billings.id,
          totalAmount: billings.totalAmount,
          paymentStatus: billings.paymentStatus,
          // Visit fields
          visitId: visits.id,
          visitNumber: visits.visitNumber,
          visitType: visits.visitType,
          // Patient fields
          patientId: patients.id,
          patientName: patients.name,
          mrNumber: patients.mrNumber,
          // Cashier fields
          cashierId: user.id,
          cashierName: user.name,
        })
        .from(payments)
        .innerJoin(billings, eq(payments.billingId, billings.id))
        .innerJoin(visits, eq(billings.visitId, visits.id))
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .innerJoin(user, eq(payments.receivedBy, user.id))
        .where(whereClause)
        .orderBy(desc(payments.receivedAt))
        .limit(limit)
        .offset(offset)

      // Map results to response format
      const transactions: TransactionHistoryItem[] = results.map((result) => ({
        payment: {
          id: result.paymentId,
          amount: parseFloat(result.paymentAmount),
          paymentMethod: result.paymentMethod,
          paymentReference: result.paymentReference,
          amountReceived: result.amountReceived ? parseFloat(result.amountReceived) : null,
          changeGiven: result.changeGiven ? parseFloat(result.changeGiven) : null,
          receivedAt: result.receivedAt.toISOString(),
          notes: result.paymentNotes,
        },
        billing: {
          id: result.billingId,
          totalAmount: parseFloat(result.totalAmount),
          paymentStatus: result.paymentStatus,
          items: [],
        },
        visit: {
          id: result.visitId,
          visitNumber: result.visitNumber,
          visitType: result.visitType,
        },
        patient: {
          id: result.patientId,
          mrNumber: result.mrNumber,
          name: result.patientName,
        },
        cashier: {
          id: result.cashierId,
          name: result.cashierName,
        },
      }))

      const response: ResponseApi<TransactionHistoryItem[]> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Transaction history fetched successfully",
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching transaction history:", error)
      return NextResponse.json(
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Failed to fetch transaction history",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
      )
    }
  },
  { permissions: ["billing:read"] }
)
