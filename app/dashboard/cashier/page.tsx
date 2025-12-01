"use client";

/**
 * Cashier Dashboard - Refactored
 * Modular, maintainable cashier interface with improved performance
 * Layout: Queue sidebar (left) + Patient details (right)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBillingQueue } from "@/hooks/use-billing-queue";
import { useBillingDetails } from "@/hooks/use-billing-details";
import { usePayment, type PaymentInput } from "@/hooks/use-payment";
import { Clock } from "lucide-react";
import { PaymentDialog } from "@/components/billing/payment-dialog";
import { QueueSidebar } from "@/components/billing/queue-sidebar";
import { BillingDetailsPanel } from "@/components/billing/billing-details-panel";
import type { PaymentMethod } from "@/types/billing";

export default function CashierDashboard() {
    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    // Billing queue with auto-refresh
    const { queue, isLoading: queueLoading, lastRefresh, refresh: refreshQueue } = useBillingQueue({
        autoRefresh: true,
        refreshInterval: 30000,
    });

    // Billing details for selected visit
    const { billingDetails, isLoading: detailsLoading, refresh: refreshDetails } = useBillingDetails(selectedVisitId);

    // Payment processing
    const { processPayment, isSubmitting, success, resetPayment } = usePayment();

    // Calculate remaining amount using useMemo for performance
    const remainingAmount = useMemo(() => {
        if (!billingDetails) return 0;
        return parseFloat(
            billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable
        );
    }, [billingDetails]);

    // Refresh after successful payment
    useEffect(() => {
        if (success && selectedVisitId) {
            refreshDetails();
            refreshQueue();
            setPaymentDialogOpen(false);
            resetPayment();
        }
    }, [success, selectedVisitId, refreshDetails, refreshQueue, resetPayment]);

    // Handle payment submission
    const handlePaymentSubmit = useCallback(
        async (data: {
            paymentMethod: PaymentMethod;
            amountReceived?: string;
            notes?: string;
        }) => {
            if (!billingDetails || !selectedVisitId) return;

            const paymentData: PaymentInput = {
                visitId: selectedVisitId,
                amount: remainingAmount,
                paymentMethod: data.paymentMethod,
                paymentReference: undefined,
                amountReceived: data.amountReceived ? parseFloat(data.amountReceived) : undefined,
                notes: data.notes,
            };

            await processPayment(paymentData);
        },
        [billingDetails, selectedVisitId, remainingAmount, processPayment]
    );

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Kasir & Pembayaran</h1>
                        <p className="text-sm text-muted-foreground">
                            Proses pembayaran pasien dengan cepat dan efisien
                        </p>
                    </div>
                    {lastRefresh && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Update: {new Date(lastRefresh).toLocaleTimeString("id-ID")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: 2-Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Queue Sidebar */}
                <QueueSidebar
                    queue={queue}
                    isLoading={queueLoading}
                    selectedVisitId={selectedVisitId}
                    onSelectVisit={setSelectedVisitId}
                    onRefresh={refreshQueue}
                />

                {/* RIGHT: Billing Details Panel */}
                <BillingDetailsPanel
                    selectedVisitId={selectedVisitId}
                    billingDetails={billingDetails}
                    isLoading={detailsLoading}
                    onRefresh={refreshDetails}
                    onProcessPayment={() => setPaymentDialogOpen(true)}
                    isSubmitting={isSubmitting}
                />
            </div>

            {/* Payment Dialog */}
            <PaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                remainingAmount={remainingAmount}
                onSubmit={handlePaymentSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
