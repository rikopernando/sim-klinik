/**
 * Billing Details Panel Component
 * Main panel displaying billing summary, payment history, and payment action
 */

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { User, RefreshCw, CreditCard } from "lucide-react";
import { BillingSummaryCard } from "./billing-summary-card";
import { PaymentHistoryCard } from "./payment-history-card";
import type { PaymentStatus } from "@/types/billing";
import { useMemo } from "react";

interface BillingItem {
    itemName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
}

interface Payment {
    id: number;
    amount: string;
    paymentMethod: string;
    paymentReference: string | null;
    changeGiven: string | null;
    receivedAt: Date | string;
}

interface Billing {
    subtotal: string;
    discount: string;
    insuranceCoverage: string;
    totalAmount: string;
    paidAmount: string;
    remainingAmount: string;
    patientPayable: string;
    paymentStatus: PaymentStatus;
}

interface BillingDetails {
    billing: Billing;
    items: BillingItem[];
    payments: Payment[];
}

interface BillingDetailsPanelProps {
    selectedVisitId: number | null;
    billingDetails: BillingDetails | null;
    isLoading: boolean;
    onRefresh: () => void;
    onProcessPayment: () => void;
    isSubmitting?: boolean;
}

export function BillingDetailsPanel({
    selectedVisitId,
    billingDetails,
    isLoading,
    onRefresh,
    onProcessPayment,
    isSubmitting = false,
}: BillingDetailsPanelProps) {
    // Calculate remaining amount
    const remainingAmount = useMemo(() => {
        if (!billingDetails) return 0;
        return parseFloat(
            billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable
        );
    }, [billingDetails]);

    // No visit selected
    if (!selectedVisitId) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Pilih pasien dari antrian</p>
                    <p className="text-sm">untuk melihat detail pembayaran</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p>Memuat detail pembayaran...</p>
                </div>
            </div>
        );
    }

    // Error state (no billing details found)
    if (!billingDetails) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <p className="text-lg">Gagal memuat detail pembayaran</p>
                    <Button variant="outline" className="mt-4" onClick={onRefresh}>
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    // Success state with billing details
    const isPaid = billingDetails.billing.paymentStatus === "paid";

    return (
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
                {/* Billing Summary */}
                <BillingSummaryCard items={billingDetails.items} summary={billingDetails.billing} />

                {/* Payment History */}
                <PaymentHistoryCard payments={billingDetails.payments} />

                {/* Payment Action Button */}
                {!isPaid && (
                    <Card className="border-primary">
                        <CardContent>
                            <Button
                                onClick={onProcessPayment}
                                className="w-full"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                <CreditCard className="h-5 w-5 mr-2" />
                                {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
                                <span className="ml-2 font-bold">
                                    Rp {remainingAmount.toLocaleString("id-ID")}
                                </span>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ScrollArea>
    );
}
