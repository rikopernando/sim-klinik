import { formatCurrency, getPaymentMethodLabel } from "@/lib/billing/billing-utils"

interface Payment {
  id: string
  amount: string
  paymentMethod: string
  paymentReference: string | null
  changeGiven: string | null
  receivedAt: Date | string
}

interface PaymentHistoryCardProps {
  payments: Payment[]
}

export function PaymentHistoryCard({ payments }: PaymentHistoryCardProps) {
  if (payments.length === 0) return null

  return (
    <div className="px-5 py-4">
      <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
        Riwayat Pembayaran
      </p>
      <div className="space-y-2">
        {payments.map((payment) => (
          <PaymentHistoryItem key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  )
}

interface PaymentHistoryItemProps {
  payment: Payment
}

function PaymentHistoryItem({ payment }: PaymentHistoryItemProps) {
  const hasChange = payment.changeGiven && parseFloat(payment.changeGiven) > 0
  const receivedDate = new Date(payment.receivedAt)

  return (
    <div className="bg-muted/40 flex items-start justify-between rounded-lg px-3 py-2.5">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold tabular-nums">{formatCurrency(payment.amount)}</p>
        <p className="text-muted-foreground text-xs capitalize">
          {getPaymentMethodLabel(payment.paymentMethod)}
          {payment.paymentReference && ` · ${payment.paymentReference}`}
        </p>
        <p className="text-muted-foreground text-xs">
          {receivedDate.toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {hasChange && (
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
          Kembalian: {formatCurrency(payment.changeGiven!)}
        </span>
      )}
    </div>
  )
}
