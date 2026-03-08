/**
 * Transaction Detail API Endpoint
 * GET /api/billing/transactions/[paymentId] - Get single transaction detail
 * Requires: billing:read permission
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { payments, billings, billingItems } from "@/db/schema/billing"
import { visits } from "@/db/schema/visits"
import { patients } from "@/db/schema/patients"
import { user } from "@/db/schema/auth"
import { eq } from "drizzle-orm"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi } from "@/types/api"
import { withRBAC } from "@/lib/rbac/middleware"
import type { TransactionHistoryItem } from "@/types/transaction"

export const GET = withRBAC<{ paymentId: string }>(
  async (request: NextRequest, context) => {
    try {
      const { paymentId } = context.params

      // Fetch transaction with related data
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
          subtotal: billings.subtotal,
          discount: billings.discount,
          tax: billings.tax,
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
        .where(eq(payments.id, paymentId))
        .limit(1)

      if (results.length === 0) {
        return NextResponse.json(
          {
            status: HTTP_STATUS_CODES.NOT_FOUND,
            message: "Transaction not found",
          },
          { status: HTTP_STATUS_CODES.NOT_FOUND }
        )
      }

      const result = results[0]

      // Fetch billing items
      const items = await db
        .select({
          id: billingItems.id,
          itemType: billingItems.itemType,
          itemName: billingItems.itemName,
          itemCode: billingItems.itemCode,
          quantity: billingItems.quantity,
          unitPrice: billingItems.unitPrice,
          subtotal: billingItems.subtotal,
          discount: billingItems.discount,
          totalPrice: billingItems.totalPrice,
        })
        .from(billingItems)
        .where(eq(billingItems.billingId, result.billingId))

      // Map to response format
      const transaction: TransactionHistoryItem = {
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
          items: items.map((item) => ({
            id: item.id,
            itemType: item.itemType,
            itemName: item.itemName,
            itemCode: item.itemCode,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            subtotal: parseFloat(item.subtotal),
            discount: item.discount ? parseFloat(item.discount) : 0,
            totalPrice: parseFloat(item.totalPrice),
          })),
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
      }

      const response: ResponseApi<TransactionHistoryItem> = {
        status: HTTP_STATUS_CODES.OK,
        message: "Transaction fetched successfully",
        data: transaction,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error fetching transaction:", error)
      return NextResponse.json(
        {
          status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Failed to fetch transaction",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
      )
    }
  },
  { permissions: ["billing:read"] }
)
