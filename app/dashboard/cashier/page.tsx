"use client";

/**
 * Cashier Dashboard
 * Billing and payment processing with sticky total box
 */

import { useState, useEffect } from "react";
import { useBilling } from "@/hooks/use-billing";
import { usePayment } from "@/hooks/use-payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    formatCurrency,
    getPaymentStatusConfig,
    getPaymentMethodLabel,
    calculateChange,
    groupItemsByType,
    calculateTotalByType,
} from "@/lib/billing/billing-utils";

export default function CashierDashboard() {
    const [visitId, setVisitId] = useState("");
    const [selectedBilling, setSelectedBilling] = useState<any | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        paymentMethod: "cash" as any,
        amountReceived: "",
        notes: "",
    });

    const { fetchBilling, billing, isLoading } = useBilling();
    const { processPayment, isSubmitting, success } = usePayment();

    // Load billing when visitId changes
    useEffect(() => {
        if (visitId && !isNaN(parseInt(visitId))) {
            fetchBilling(parseInt(visitId));
        }
    }, [visitId, fetchBilling]);

    useEffect(() => {
        if (billing) {
            setSelectedBilling(billing);
        }
    }, [billing]);

    // Refresh billing after successful payment
    useEffect(() => {
        if (success && visitId) {
            fetchBilling(parseInt(visitId));
            setPaymentDialogOpen(false);
            setPaymentData({
                paymentMethod: "cash",
                amountReceived: "",
                notes: "",
            });
        }
    }, [success, visitId, fetchBilling]);

    const handleProcessPayment = async () => {
        if (!selectedBilling) return;

        const success = await processPayment({
            billingId: selectedBilling.id,
            amount: selectedBilling.remainingAmount || selectedBilling.patientPayable,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: undefined,
            amountReceived: paymentData.paymentMethod === "cash" ? paymentData.amountReceived : undefined,
            receivedBy: "cashier-001", // TODO: Get from auth
            notes: paymentData.notes || undefined,
        });

        if (!success) {
            alert("Gagal memproses pembayaran");
        }
    };

    const statusConfig = selectedBilling
        ? getPaymentStatusConfig(selectedBilling.paymentStatus)
        : null;

    const groupedItems = selectedBilling
        ? groupItemsByType(selectedBilling.items)
        : { services: [], drugs: [], materials: [], rooms: [] };

    const remainingAmount = selectedBilling
        ? parseFloat(selectedBilling.remainingAmount || selectedBilling.patientPayable)
        : 0;

    const changeAmount =
        paymentData.paymentMethod === "cash" && paymentData.amountReceived
            ? calculateChange(
                  paymentData.amountReceived,
                  selectedBilling?.remainingAmount || selectedBilling?.patientPayable || "0"
              )
            : "0";

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Kasir</h1>
                <p className="text-muted-foreground">Proses pembayaran dan tagihan pasien</p>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Cari Tagihan</CardTitle>
                    <CardDescription>Masukkan Visit ID untuk melihat tagihan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Masukkan Visit ID"
                                value={visitId}
                                onChange={(e) => setVisitId(e.target.value)}
                                type="number"
                            />
                        </div>
                        <Button
                            onClick={() => visitId && fetchBilling(parseInt(visitId))}
                            disabled={!visitId || isLoading}
                        >
                            {isLoading ? "Loading..." : "Cari"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {selectedBilling && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Billing Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient Info */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>
                                            {selectedBilling.patient?.name || "N/A"}
                                        </CardTitle>
                                        <CardDescription>
                                            RM: {selectedBilling.patient?.mrNumber || "N/A"} |
                                            Visit: {selectedBilling.visit?.visitNumber || "N/A"}
                                        </CardDescription>
                                    </div>
                                    {statusConfig && (
                                        <Badge className={statusConfig.badge}>
                                            {statusConfig.label}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Billing Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rincian Tagihan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="all">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="all">
                                            Semua ({selectedBilling.items.length})
                                        </TabsTrigger>
                                        {groupedItems.services.length > 0 && (
                                            <TabsTrigger value="services">
                                                Layanan ({groupedItems.services.length})
                                            </TabsTrigger>
                                        )}
                                        {groupedItems.drugs.length > 0 && (
                                            <TabsTrigger value="drugs">
                                                Obat ({groupedItems.drugs.length})
                                            </TabsTrigger>
                                        )}
                                        {groupedItems.materials.length > 0 && (
                                            <TabsTrigger value="materials">
                                                Material ({groupedItems.materials.length})
                                            </TabsTrigger>
                                        )}
                                        {groupedItems.rooms.length > 0 && (
                                            <TabsTrigger value="rooms">
                                                Kamar ({groupedItems.rooms.length})
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    <TabsContent value="all" className="space-y-2">
                                        {selectedBilling.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{item.itemName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.quantity} x {formatCurrency(item.unitPrice)}
                                                        {item.description && ` - ${item.description}`}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    {formatCurrency(item.totalPrice)}
                                                </p>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    {Object.entries(groupedItems).map(([type, items]: [string, any[]]) => (
                                        items.length > 0 && (
                                            <TabsContent key={type} value={type} className="space-y-2">
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{item.itemName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.quantity} x{" "}
                                                                {formatCurrency(item.unitPrice)}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold">
                                                            {formatCurrency(item.totalPrice)}
                                                        </p>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="flex justify-between font-semibold">
                                                        <span>Subtotal {type}</span>
                                                        <span>
                                                            {formatCurrency(
                                                                calculateTotalByType(
                                                                    selectedBilling.items,
                                                                    type.slice(0, -1)
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        )
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        {selectedBilling.payments && selectedBilling.payments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {selectedBilling.payments.map((payment: any) => (
                                            <div
                                                key={payment.id}
                                                className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {getPaymentMethodLabel(payment.paymentMethod)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(payment.receivedAt).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="font-semibold">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right: Sticky Total Box */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <Card className={`border-2 ${statusConfig?.borderColor} ${statusConfig?.bgColor}`}>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Total Tagihan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">
                                                {formatCurrency(selectedBilling.subtotal)}
                                            </span>
                                        </div>
                                        {parseFloat(selectedBilling.discount) > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Diskon</span>
                                                <span>-{formatCurrency(selectedBilling.discount)}</span>
                                            </div>
                                        )}
                                        {selectedBilling.insuranceCoverage &&
                                            parseFloat(selectedBilling.insuranceCoverage) > 0 && (
                                                <div className="flex justify-between text-blue-600">
                                                    <span>Asuransi</span>
                                                    <span>
                                                        -{formatCurrency(selectedBilling.insuranceCoverage)}
                                                    </span>
                                                </div>
                                            )}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span>{formatCurrency(selectedBilling.totalAmount)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dibayar</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(selectedBilling.paidAmount)}
                                            </span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between text-xl font-bold">
                                                <span>Sisa</span>
                                                <span className={statusConfig?.color}>
                                                    {formatCurrency(
                                                        selectedBilling.remainingAmount ||
                                                            selectedBilling.patientPayable
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBilling.paymentStatus !== "paid" && (
                                        <Button
                                            onClick={() => setPaymentDialogOpen(true)}
                                            className="w-full"
                                            size="lg"
                                        >
                                            Proses Pembayaran
                                        </Button>
                                    )}

                                    {selectedBilling.paymentStatus === "paid" && (
                                        <div className="text-center p-4 bg-green-100 rounded-lg">
                                            <p className="text-green-700 font-semibold text-lg">
                                                ✓ LUNAS
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Proses Pembayaran</DialogTitle>
                        <DialogDescription>Masukkan detail pembayaran</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(remainingAmount)}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                            <Select
                                value={paymentData.paymentMethod}
                                onValueChange={(value) =>
                                    setPaymentData({ ...paymentData, paymentMethod: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                                    <SelectItem value="card">Kartu Debit/Kredit</SelectItem>
                                    <SelectItem value="insurance">Asuransi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {paymentData.paymentMethod === "cash" && (
                            <>
                                <div>
                                    <Label htmlFor="amountReceived">Uang Diterima</Label>
                                    <Input
                                        id="amountReceived"
                                        type="number"
                                        value={paymentData.amountReceived}
                                        onChange={(e) =>
                                            setPaymentData({
                                                ...paymentData,
                                                amountReceived: e.target.value,
                                            })
                                        }
                                        placeholder="Masukkan jumlah uang yang diterima"
                                    />
                                </div>

                                {paymentData.amountReceived && (
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Kembalian</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {formatCurrency(changeAmount)}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleProcessPayment}
                                disabled={
                                    isSubmitting ||
                                    (paymentData.paymentMethod === "cash" &&
                                        (!paymentData.amountReceived ||
                                            parseFloat(changeAmount) < 0))
                                }
                                className="flex-1"
                            >
                                {isSubmitting ? "Memproses..." : "Bayar"}
                            </Button>
                            <Button
                                onClick={() => setPaymentDialogOpen(false)}
                                variant="outline"
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
