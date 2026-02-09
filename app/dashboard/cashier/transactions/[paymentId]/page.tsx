/**
 * Transaction Detail Page
 * Displays detailed information about a payment transaction
 */

"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { PageGuard } from "@/components/auth/page-guard"
import { ArrowLeft, Printer } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import Loader from "@/components/loader"
import { ReceiptPrint } from "@/components/billing/receipt-print"
import { fetchTransactionDetail } from "@/lib/services/billing.service"
import { formatCurrency, transactionToBillingDetails } from "@/lib/billing/billing-utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { TransactionHistoryItem } from "@/types/transaction"

interface TransactionDetailPageProps {
  params: Promise<{ paymentId: string }>
}

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; className: string }> = {
  cash: { label: "Tunai", className: "bg-green-100 text-green-700" },
  transfer: { label: "Transfer", className: "bg-blue-100 text-blue-700" },
  card: { label: "Kartu", className: "bg-purple-100 text-purple-700" },
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Belum Lunas", className: "bg-yellow-100 text-yellow-700" },
  partial: { label: "Sebagian", className: "bg-orange-100 text-orange-700" },
  paid: { label: "Lunas", className: "bg-green-100 text-green-700" },
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  service: "Layanan",
  drug: "Obat",
  material: "Material",
  room: "Kamar",
  laboratory: "Laboratorium",
  radiology: "Radiologi",
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  return (
    <PageGuard permissions={["billing:read"]}>
      <TransactionDetailContent params={params} />
    </PageGuard>
  )
}

function TransactionDetailContent({ params }: TransactionDetailPageProps) {
  const router = useRouter()
  const { paymentId } = use(params)

  const [transaction, setTransaction] = useState<TransactionHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTransaction() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTransactionDetail(paymentId)
        setTransaction(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data transaksi")
      } finally {
        setIsLoading(false)
      }
    }

    loadTransaction()
  }, [paymentId])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return <Loader className="py-6" message="Memuat detail transaksi..." />
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">{error || "Transaksi tidak ditemukan"}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const methodConfig = PAYMENT_METHOD_CONFIG[transaction.payment.paymentMethod] || {
    label: transaction.payment.paymentMethod,
    className: "bg-gray-100 text-gray-700",
  }

  const statusConfig = PAYMENT_STATUS_CONFIG[transaction.billing.paymentStatus] || {
    label: transaction.billing.paymentStatus,
    className: "bg-gray-100 text-gray-700",
  }

  const hasBillingItems = transaction.billing.items && transaction.billing.items.length > 0

  return (
    <>
      {/* Print Receipt */}
      <ReceiptPrint data={transactionToBillingDetails(transaction)} />

      {/* Screen Content */}
      <div className="container mx-auto p-6 print:hidden">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Detail Transaksi</h1>
                <p className="text-muted-foreground">
                  {format(new Date(transaction.payment.receivedAt), "dd MMMM yyyy, HH:mm", {
                    locale: id,
                  })}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Patient & Visit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pasien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Nama Pasien</span>
                  <span className="font-medium">{transaction.patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">No. Rekam Medis</span>
                  <span className="font-medium">{transaction.patient.mrNumber}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">No. Kunjungan</span>
                  <span className="font-medium">{transaction.visit.visitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Tipe Kunjungan</span>
                  <Badge variant="outline">
                    {VISIT_TYPE_LABELS[transaction.visit.visitType] || transaction.visit.visitType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Total Tagihan</span>
                  <span className="font-medium">
                    {formatCurrency(transaction.billing.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Jumlah Dibayar</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(transaction.payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Metode Pembayaran</span>
                  <Badge className={`border-0 ${methodConfig.className}`}>
                    {methodConfig.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge className={`border-0 ${statusConfig.className}`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Cash-specific fields */}
                {transaction.payment.paymentMethod === "cash" &&
                  transaction.payment.amountReceived && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Uang Diterima</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.payment.amountReceived)}
                        </span>
                      </div>
                      {!!transaction.payment.changeGiven && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Kembalian</span>
                          <span className="font-medium">
                            {formatCurrency(transaction.payment.changeGiven)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                {/* Payment reference */}
                {transaction.payment.paymentReference && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Referensi</span>
                      <span className="font-medium">{transaction.payment.paymentReference}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing Items */}
          {hasBillingItems && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rincian Tagihan</CardTitle>
                <CardDescription>Daftar item yang ditagihkan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.billing.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-muted-foreground text-xs">
                              {ITEM_TYPE_LABELS[item.itemType] || item.itemType}
                              {item.itemCode && ` • ${item.itemCode}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(transaction.billing.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Notes */}
            {transaction.payment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{transaction.payment.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
