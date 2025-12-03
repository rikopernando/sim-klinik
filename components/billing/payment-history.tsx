/**
 * Payment History Component
 * Display payment transaction history
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getPaymentMethodLabel } from "@/lib/billing/billing-utils"
import type { Payment } from "@/types/billing"

interface PaymentHistoryProps {
  payments: Payment[]
}

function PaymentCard({ payment }: { payment: Payment }) {
  return (
    <div className="bg-muted flex items-center justify-between rounded-lg p-3">
      <div>
        <p className="font-medium">{getPaymentMethodLabel(payment.paymentMethod)}</p>
        <p className="text-muted-foreground text-sm">
          {new Date(payment.receivedAt).toLocaleString("id-ID")}
        </p>
        {payment.notes && <p className="text-muted-foreground mt-1 text-xs">{payment.notes}</p>}
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
        {payment.changeGiven && parseFloat(payment.changeGiven) > 0 && (
          <p className="text-muted-foreground text-xs">
            Kembalian: {formatCurrency(payment.changeGiven)}
          </p>
        )}
      </div>
    </div>
  )
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (!payments || payments.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
