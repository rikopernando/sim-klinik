"use client";

/**
 * Cashier Dashboard (Refactored)
 * Modular, clean, and performant billing interface with queue-based approach
 */

import { useState, useEffect, useCallback } from "react";
import { useBilling } from "@/hooks/use-billing";
import { usePayment } from "@/hooks/use-payment";
import { useBillingQueue } from "@/hooks/use-billing-queue";
import { BillingSearch } from "@/components/billing/billing-search";
import { BillingPatientInfo } from "@/components/billing/billing-patient-info";
import { BillingItemsList } from "@/components/billing/billing-items-list";
import { PaymentHistory } from "@/components/billing/payment-history";
import { StickyTotalBox } from "@/components/billing/sticky-total-box";
import { PaymentDialog } from "@/components/billing/payment-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

interface BillingData {
    billing: {
        id: number;
        visitId: number;
        totalAmount: string;
        patientPayable: string;
        remainingAmount: string;
        paymentStatus: string;
    };
    items: unknown[];
    payments: unknown[];
}

export default function CashierDashboard() {
    const [selectedBilling, setSelectedBilling] = useState<BillingData | null>(null);
    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    // Use billing queue with auto-refresh every 30 seconds
    const { queue, isLoading: queueLoading, lastRefresh, refresh: refreshQueue } = useBillingQueue({
        autoRefresh: true,
        refreshInterval: 30000,
    });

    const { fetchBilling, billing, isLoading } = useBilling();
    const { processPayment, isSubmitting, success } = usePayment();

    // Handle billing fetch from search or queue click
    const handleSelectVisit = useCallback(
        (visitId: number) => {
            setSelectedVisitId(visitId);
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

    // Refresh billing and queue after successful payment
    useEffect(() => {
        if (success && selectedVisitId) {
            fetchBilling(selectedVisitId);
            refreshQueue();
            setPaymentDialogOpen(false);
        }
    }, [success, selectedVisitId, fetchBilling, refreshQueue]);

    // Handle payment submission
    const handlePaymentSubmit = useCallback(
        async (data: {
            paymentMethod: string;
            amountReceived?: string;
            notes?: string;
        }) => {
            if (!selectedBilling || !selectedVisitId) return;

            await processPayment({
                visitId: selectedVisitId,
                amount: parseFloat(selectedBilling.billing.remainingAmount || selectedBilling.billing.patientPayable),
                paymentMethod: data.paymentMethod,
                paymentReference: undefined,
                amountReceived: data.amountReceived ? parseFloat(data.amountReceived) : undefined,
                notes: data.notes,
            });
        },
        [selectedBilling, selectedVisitId, processPayment]
    );

    const remainingAmount = selectedBilling
        ? parseFloat(selectedBilling.billing.remainingAmount || selectedBilling.billing.patientPayable)
        : 0;

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kasir</h1>
                    <p className="text-muted-foreground">Proses pembayaran dan tagihan pasien</p>
                </div>
                {lastRefresh && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Terakhir diperbarui: {new Date(lastRefresh).toLocaleTimeString("id-ID")}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <BillingSearch onSearch={handleSelectVisit} isLoading={isLoading} />
            </div>

            {/* Billing Queue */}
            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Antrian Pembayaran</CardTitle>
                                <CardDescription>
                                    Daftar pasien yang siap untuk diproses pembayaran (RME terkunci)
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshQueue}
                                disabled={queueLoading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${queueLoading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {queueLoading && queue.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
                        ) : queue.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Tidak ada pasien dalam antrian pembayaran
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">No. Kunjungan</th>
                                            <th className="text-left p-2">No. RM</th>
                                            <th className="text-left p-2">Nama Pasien</th>
                                            <th className="text-left p-2">Tipe Kunjungan</th>
                                            <th className="text-left p-2">Total Tagihan</th>
                                            <th className="text-left p-2">Status Pembayaran</th>
                                            <th className="text-left p-2">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {queue.map((item) => (
                                            <tr
                                                key={item.visit.id}
                                                className={`border-b hover:bg-muted/50 ${
                                                    selectedVisitId === item.visit.id ? "bg-muted" : ""
                                                }`}
                                            >
                                                <td className="p-2">{item.visit.visitNumber}</td>
                                                <td className="p-2">{item.patient.mrNumber}</td>
                                                <td className="p-2">{item.patient.name}</td>
                                                <td className="p-2">
                                                    <span className="capitalize">{item.visit.visitType}</span>
                                                </td>
                                                <td className="p-2">
                                                    {item.billing
                                                        ? `Rp ${parseFloat(item.billing.totalAmount).toLocaleString("id-ID")}`
                                                        : "-"}
                                                </td>
                                                <td className="p-2">
                                                    {item.billing ? (
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded ${
                                                                item.billing.paymentStatus === "paid"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : item.billing.paymentStatus === "partial"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {item.billing.paymentStatus === "paid"
                                                                ? "Lunas"
                                                                : item.billing.paymentStatus === "partial"
                                                                ? "Sebagian"
                                                                : "Belum Bayar"}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                                                            Belum Dihitung
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        size="sm"
                                                        variant={selectedVisitId === item.visit.id ? "default" : "outline"}
                                                        onClick={() => handleSelectVisit(item.visit.id)}
                                                        disabled={isLoading}
                                                    >
                                                        {selectedVisitId === item.visit.id ? "Terpilih" : "Pilih"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
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
