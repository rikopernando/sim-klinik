/**
 * Transaction History Table Component
 * Displays list of payment transactions
 */

import { memo } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { TransactionHistoryItem } from "@/types/transaction"
import Loader from "@/components/loader"
import { formatCurrency } from "@/lib/billing/billing-utils"

interface TransactionHistoryTableProps {
  transactions: TransactionHistoryItem[]
  isLoading: boolean
}

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; className: string }> = {
  cash: { label: "Tunai", className: "bg-green-100 text-green-700" },
  transfer: { label: "Transfer", className: "bg-blue-100 text-blue-700" },
  card: { label: "Kartu", className: "bg-purple-100 text-purple-700" },
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

function TransactionHistoryTableComponent({
  transactions,
  isLoading,
}: TransactionHistoryTableProps) {
  if (isLoading) {
    return <Loader message="Memuat riwayat transaksi..." />
  }

  if (transactions.length === 0) {
    return (
      <div className="border-border flex h-64 items-center justify-center rounded-md border">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Tidak ada data transaksi</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>No. Kunjungan</TableHead>
          <TableHead>Pasien</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead className="text-right">Jumlah</TableHead>
          <TableHead>Metode</TableHead>
          <TableHead>Kasir</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((item) => {
          const methodConfig = PAYMENT_METHOD_CONFIG[item.payment.paymentMethod] || {
            label: item.payment.paymentMethod,
            className: "bg-gray-100 text-gray-700",
          }

          return (
            <TableRow key={item.payment.id}>
              <TableCell>
                {format(new Date(item.payment.receivedAt), "dd MMM yyyy, HH:mm", { locale: id })}
              </TableCell>
              <TableCell className="font-medium">{item.visit.visitNumber}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.patient.name}</div>
                  <div className="text-muted-foreground text-sm">{item.patient.mrNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {VISIT_TYPE_LABELS[item.visit.visitType] || item.visit.visitType}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.payment.amount)}
              </TableCell>
              <TableCell>
                <Badge className={`border-0 ${methodConfig.className}`}>{methodConfig.label}</Badge>
              </TableCell>
              <TableCell>{item.cashier.name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild title="Lihat Detail">
                  <Link href={`/dashboard/cashier/transactions/${item.payment.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export const TransactionHistoryTable = memo(TransactionHistoryTableComponent)
