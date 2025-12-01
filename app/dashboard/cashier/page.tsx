"use client";

/**
 * Cashier Dashboard - Refactored
 * Compact, efficient layout for fast patient processing
 * Layout: Queue sidebar (left) + Patient details (right)
 */

import { useState, useEffect, useCallback } from "react";
import { useBillingQueue } from "@/hooks/use-billing-queue";
import { useBillingDetails } from "@/hooks/use-billing-details";
import { usePayment } from "@/hooks/use-payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Clock, User, Calendar, CreditCard, Receipt } from "lucide-react";
import { PaymentDialog } from "@/components/billing/payment-dialog";

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
    const { processPayment, isSubmitting, success } = usePayment();

    // Refresh after successful payment
    useEffect(() => {
        if (success && selectedVisitId) {
            refreshDetails();
            refreshQueue();
            setPaymentDialogOpen(false);
        }
    }, [success, selectedVisitId, refreshDetails, refreshQueue]);

    // Handle payment submission
    const handlePaymentSubmit = useCallback(
        async (data: {
            paymentMethod: string;
            amountReceived?: string;
            notes?: string;
        }) => {
            if (!billingDetails || !selectedVisitId) return;

            await processPayment({
                visitId: selectedVisitId,
                amount: parseFloat(billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable),
                paymentMethod: data.paymentMethod,
                paymentReference: undefined,
                amountReceived: data.amountReceived ? parseFloat(data.amountReceived) : undefined,
                notes: data.notes,
            });
        },
        [billingDetails, selectedVisitId, processPayment]
    );

    const remainingAmount = billingDetails
        ? parseFloat(billingDetails.billing.remainingAmount || billingDetails.billing.patientPayable)
        : 0;

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
            case "partial":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
            default:
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case "paid":
                return "Lunas";
            case "partial":
                return "Sebagian";
            default:
                return "Belum Bayar";
        }
    };

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
                <div className="w-96 border-r bg-muted/30 flex flex-col">
                    <div className="p-4 border-b bg-background">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Antrian Pembayaran</h2>
                            <Button variant="ghost" size="sm" onClick={refreshQueue} disabled={queueLoading}>
                                <RefreshCw className={`h-4 w-4 ${queueLoading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {queue.length} pasien menunggu pembayaran
                        </p>
                    </div>

                    <ScrollArea className="h-72 flex-1">
                        {queueLoading && queue.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Memuat antrian...
                            </div>
                        ) : queue.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Tidak ada pasien dalam antrian
                            </div>
                        ) : (
                            <div className="p-4 space-y-2">
                                {queue.map((item) => (
                                    <Card
                                        key={item.visit.id}
                                        className={`py-0 cursor-pointer transition-all hover:shadow-md ${
                                            selectedVisitId === item.visit.id
                                                ? "ring-2 ring-primary bg-primary/5"
                                                : ""
                                        }`}
                                        onClick={() => setSelectedVisitId(item.visit.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-sm">{item.patient.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.patient.mrNumber}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.visit.visitType}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">No. Kunjungan</span>
                                                    <span className="font-mono">{item.visit.visitNumber}</span>
                                                </div>

                                                {item.billing && (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Total</span>
                                                            <span className="font-semibold">
                                                                Rp {parseFloat(item.billing.totalAmount).toLocaleString("id-ID")}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs ${getPaymentStatusColor(item.billing.paymentStatus)}`}
                                                            >
                                                                {getPaymentStatusText(item.billing.paymentStatus)}
                                                            </Badge>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* RIGHT: Patient Details & Billing */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {!selectedVisitId ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Pilih pasien dari antrian</p>
                                <p className="text-sm">untuk melihat detail pembayaran</p>
                            </div>
                        </div>
                    ) : detailsLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                                <p>Memuat detail pembayaran...</p>
                            </div>
                        </div>
                    ) : billingDetails ? (
                        <ScrollArea className="h-72 flex-1">
                            <div className="p-4 space-y-4">
                                {/* Billing Items */}
                                <Card className="py-4 gap-4">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Receipt className="h-5 w-5" />
                                            Rincian Tagihan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            {billingDetails.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{item.itemName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.quantity} × Rp{" "}
                                                            {parseFloat(item.unitPrice).toLocaleString("id-ID")}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-sm">
                                                        Rp {parseFloat(item.totalPrice).toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Billing Summary */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>
                                                    Rp {parseFloat(billingDetails.billing.subtotal).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            {parseFloat(billingDetails.billing.discount) > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Diskon</span>
                                                    <span>
                                                        - Rp {parseFloat(billingDetails.billing.discount).toLocaleString("id-ID")}
                                                    </span>
                                                </div>
                                            )}
                                            {parseFloat(billingDetails.billing.insuranceCoverage) > 0 && (
                                                <div className="flex justify-between text-blue-600">
                                                    <span>Ditanggung Asuransi</span>
                                                    <span>
                                                        - Rp{" "}
                                                        {parseFloat(billingDetails.billing.insuranceCoverage).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>
                                                    Rp {parseFloat(billingDetails.billing.totalAmount).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            {parseFloat(billingDetails.billing.paidAmount) > 0 && (
                                                <>
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Terbayar</span>
                                                        <span>
                                                            Rp{" "}
                                                            {parseFloat(billingDetails.billing.paidAmount).toLocaleString("id-ID")}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-lg text-primary">
                                                        <span>Sisa Tagihan</span>
                                                        <span>
                                                            Rp{" "}
                                                            {parseFloat(billingDetails.billing.remainingAmount).toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment History */}
                                {billingDetails.payments && billingDetails.payments.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Riwayat Pembayaran
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {billingDetails.payments.map((payment) => (
                                                    <div
                                                        key={payment.id}
                                                        className="flex justify-between items-start p-3 bg-muted/50 rounded-lg"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-sm">
                                                                Rp {parseFloat(payment.amount).toLocaleString("id-ID")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground capitalize">
                                                                {payment.paymentMethod}
                                                                {payment.paymentReference && ` • ${payment.paymentReference}`}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(payment.receivedAt).toLocaleString("id-ID")}
                                                            </p>
                                                        </div>
                                                        {payment.changeGiven && parseFloat(payment.changeGiven) > 0 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Kembalian: Rp{" "}
                                                                {parseFloat(payment.changeGiven).toLocaleString("id-ID")}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Payment Action */}
                                {billingDetails.billing.paymentStatus !== "paid" && (
                                    <Card className="border-primary">
                                        <CardContent>
                                            <Button
                                                onClick={() => setPaymentDialogOpen(true)}
                                                className="w-full"
                                                size="lg"
                                                disabled={isSubmitting}
                                            >
                                                <CreditCard className="h-5 w-5 mr-2" />
                                                Proses Pembayaran
                                                <span className="ml-2 font-bold">
                                                    Rp {remainingAmount.toLocaleString("id-ID")}
                                                </span>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="text-lg">Gagal memuat detail pembayaran</p>
                                <Button variant="outline" className="mt-4" onClick={() => refreshDetails()}>
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
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
