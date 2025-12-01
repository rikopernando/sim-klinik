/**
 * Payment History Card Component
 * Displays a list of payment transactions with details
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPaymentMethodLabel } from "@/lib/billing/billing-utils";
import { Calendar } from "lucide-react";

interface Payment {
    id: number;
    amount: string;
    paymentMethod: string;
    paymentReference: string | null;
    changeGiven: string | null;
    receivedAt: Date | string;
}

interface PaymentHistoryCardProps {
    payments: Payment[];
}

export function PaymentHistoryCard({ payments }: PaymentHistoryCardProps) {
    if (payments.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Riwayat Pembayaran
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <PaymentHistoryItem key={payment.id} payment={payment} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface PaymentHistoryItemProps {
    payment: Payment;
}

function PaymentHistoryItem({ payment }: PaymentHistoryItemProps) {
    const hasChange = payment.changeGiven && parseFloat(payment.changeGiven) > 0;
    const receivedDate = new Date(payment.receivedAt);

    return (
        <div className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
                <p className="font-medium text-sm">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                    {payment.paymentReference && ` • ${payment.paymentReference}`}
                </p>
                <p className="text-xs text-muted-foreground">
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
                <Badge variant="secondary" className="text-xs">
                    Kembalian: {formatCurrency(payment.changeGiven!)}
                </Badge>
            )}
        </div>
    );
}
