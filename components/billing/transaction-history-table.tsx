"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { TransactionHistoryItem } from "@/types/transaction"
import { formatCurrency } from "@/lib/billing/billing-utils"

interface TransactionHistoryTableProps {
  transactions: TransactionHistoryItem[]
}

const PAYMENT_METHOD_CONFIG: Record<string, { label: string; className: string }> = {
  cash: {
    label: "Tunai",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  transfer: {
    label: "Transfer",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  card: {
    label: "Kartu",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
}

const VISIT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  outpatient: {
    label: "Rawat Jalan",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  inpatient: {
    label: "Rawat Inap",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  emergency: {
    label: "UGD",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Tanggal
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              No. Kunjungan
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Pasien</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Tipe</TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
              Jumlah
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Metode</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Kasir</TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((item) => {
            const methodConfig = PAYMENT_METHOD_CONFIG[item.payment.paymentMethod] ?? {
              label: item.payment.paymentMethod,
              className: "bg-muted text-muted-foreground",
            }
            const visitConfig = VISIT_TYPE_CONFIG[item.visit.visitType] ?? {
              label: item.visit.visitType,
              className: "bg-muted text-muted-foreground",
            }

            return (
              <TableRow key={item.payment.id} className="group transition-colors">
                <TableCell className="text-muted-foreground py-3 text-sm">
                  {format(new Date(item.payment.receivedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                </TableCell>
                <TableCell className="py-3">
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
                    {item.visit.visitNumber}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="font-medium">{item.patient.name}</div>
                  <div className="text-muted-foreground text-xs">{item.patient.mrNumber}</div>
                </TableCell>
                <TableCell className="py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      visitConfig.className
                    )}
                  >
                    {visitConfig.label}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {formatCurrency(item.payment.amount)}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      methodConfig.className
                    )}
                  >
                    {methodConfig.label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground py-3 text-sm">
                  {item.cashier.name}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                          <Link href={`/dashboard/cashier/transactions/${item.payment.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
