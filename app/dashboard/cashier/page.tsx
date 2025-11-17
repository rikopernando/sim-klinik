"use client";

/**
 * Cashier Dashboard (Refactored)
 * Modular, clean, and performant billing interface
 */

import { useState, useEffect, useCallback } from "react";
import { useBilling } from "@/hooks/use-billing";
import { usePayment } from "@/hooks/use-payment";
import { BillingSearch } from "@/components/billing/billing-search";
import { BillingPatientInfo } from "@/components/billing/billing-patient-info";
import { BillingItemsList } from "@/components/billing/billing-items-list";
import { PaymentHistory } from "@/components/billing/payment-history";
import { StickyTotalBox } from "@/components/billing/sticky-total-box";
import { PaymentDialog } from "@/components/billing/payment-dialog";

export default function CashierDashboard() {
    const [selectedBilling, setSelectedBilling] = useState<any | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    const { fetchBilling, billing, isLoading } = useBilling();
    const { processPayment, isSubmitting, success } = usePayment();

    // Handle billing fetch
    const handleSearch = useCallback(
        (visitId: number) => {
            fetchBilling(visitId);
        },
        [fetchBilling]
    );

    // Update selected billing when data changes
    useEffect(() => {
        if (billing) {
            setSelectedBilling(billing);
        }
    }, [billing]);

    // Refresh billing after successful payment
    useEffect(() => {
        if (success && selectedBilling) {
            fetchBilling(selectedBilling.visitId);
            setPaymentDialogOpen(false);
        }
    }, [success, selectedBilling, fetchBilling]);

    // Handle payment submission
    const handlePaymentSubmit = useCallback(
        async (data: {
            paymentMethod: any;
            amountReceived?: string;
            notes?: string;
        }) => {
            if (!selectedBilling) return;

            await processPayment({
                billingId: selectedBilling.id,
                amount: selectedBilling.remainingAmount || selectedBilling.patientPayable,
                paymentMethod: data.paymentMethod,
                paymentReference: undefined,
                amountReceived: data.amountReceived,
                receivedBy: "cashier-001", // TODO: Get from auth
                notes: data.notes,
            });
        },
        [selectedBilling, processPayment]
    );

    const remainingAmount = selectedBilling
        ? parseFloat(selectedBilling.remainingAmount || selectedBilling.patientPayable)
        : 0;

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Kasir</h1>
                <p className="text-muted-foreground">Proses pembayaran dan tagihan pasien</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <BillingSearch onSearch={handleSearch} isLoading={isLoading} />
            </div>

            {/* Billing Details */}
            {selectedBilling && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Billing Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Info */}
                        <BillingPatientInfo billing={selectedBilling} />

                        {/* Billing Items */}
                        <BillingItemsList items={selectedBilling.items} />

                        {/* Payment History */}
                        <PaymentHistory payments={selectedBilling.payments} />
                    </div>

                    {/* Right: Sticky Total Box */}
                    <div className="lg:col-span-1">
                        <StickyTotalBox
                            billing={selectedBilling}
                            onProcessPayment={() => setPaymentDialogOpen(true)}
                        />
                    </div>
                </div>
            )}

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
