/**
 * Payment Dialog Component
 * Payment processing form with automatic change calculation
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, calculateChange } from "@/lib/billing/billing-utils";
import type { PaymentMethod } from "@/types/billing";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    remainingAmount: number;
    onSubmit: (data: {
        paymentMethod: PaymentMethod;
        amountReceived?: string;
        notes?: string;
    }) => void;
    isSubmitting?: boolean;
}

export function PaymentDialog({
    open,
    onOpenChange,
    remainingAmount,
    onSubmit,
    isSubmitting = false,
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [amountReceived, setAmountReceived] = useState("");
    const [notes, setNotes] = useState("");

    const changeAmount = useMemo(() => {
        if (paymentMethod === "cash" && amountReceived) {
            return calculateChange(amountReceived, remainingAmount.toString());
        }
        return "0";
    }, [paymentMethod, amountReceived, remainingAmount]);

    const isValidPayment = useMemo(() => {
        if (paymentMethod === "cash") {
            return (
                amountReceived &&
                parseFloat(amountReceived) > 0 &&
                parseFloat(changeAmount) >= 0
            );
        }
        return true;
    }, [paymentMethod, amountReceived, changeAmount]);

    const handleSubmit = () => {
        onSubmit({
            paymentMethod,
            amountReceived: paymentMethod === "cash" ? amountReceived : undefined,
            notes: notes || undefined,
        });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setPaymentMethod("cash");
            setAmountReceived("");
            setNotes("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Proses Pembayaran</DialogTitle>
                    <DialogDescription>Masukkan detail pembayaran</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Remaining Amount */}
                    <div>
                        <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
                        <p className="text-2xl font-bold">{formatCurrency(remainingAmount)}</p>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                            disabled={isSubmitting}
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

                    {/* Amount Received (Cash only) */}
                    {paymentMethod === "cash" && (
                        <>
                            <div>
                                <Label htmlFor="amountReceived">Uang Diterima</Label>
                                <Input
                                    id="amountReceived"
                                    type="number"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    placeholder="Masukkan jumlah uang yang diterima"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Change Display */}
                            {amountReceived && (
                                <div
                                    className={`p-4 rounded-lg ${
                                        parseFloat(changeAmount) >= 0
                                            ? "bg-green-50"
                                            : "bg-red-50"
                                    }`}
                                >
                                    <p className="text-sm text-muted-foreground">Kembalian</p>
                                    <p
                                        className={`text-xl font-bold ${
                                            parseFloat(changeAmount) >= 0
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {formatCurrency(changeAmount)}
                                    </p>
                                    {parseFloat(changeAmount) < 0 && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Uang yang diterima kurang!
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambahkan catatan jika diperlukan"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !isValidPayment}
                            className="flex-1"
                        >
                            {isSubmitting ? "Memproses..." : "Bayar"}
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
