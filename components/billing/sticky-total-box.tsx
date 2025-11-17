/**
 * Sticky Total Box Component
 * Prominent display of billing totals (sticky on scroll)
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getPaymentStatusConfig } from "@/lib/billing/billing-utils";
import type { BillingWithDetails } from "@/types/billing";

interface StickyTotalBoxProps {
    billing: BillingWithDetails;
    onProcessPayment: () => void;
}

export function StickyTotalBox({ billing, onProcessPayment }: StickyTotalBoxProps) {
    const statusConfig = useMemo(
        () => getPaymentStatusConfig(billing.paymentStatus),
        [billing.paymentStatus]
    );

    const hasDiscount = useMemo(() => parseFloat(billing.discount) > 0, [billing.discount]);
    const hasInsurance = useMemo(
        () => billing.insuranceCoverage && parseFloat(billing.insuranceCoverage) > 0,
        [billing.insuranceCoverage]
    );
    const isPaid = billing.paymentStatus === "paid";

    return (
        <div className="sticky top-6">
            <Card className={`border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                <CardHeader>
                    <CardTitle className="text-2xl">Total Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {/* Subtotal */}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">
                                {formatCurrency(billing.subtotal)}
                            </span>
                        </div>

                        {/* Discount */}
                        {hasDiscount && (
                            <div className="flex justify-between text-red-600">
                                <span>Diskon</span>
                                <span>-{formatCurrency(billing.discount)}</span>
                            </div>
                        )}

                        {/* Insurance */}
                        {hasInsurance && (
                            <div className="flex justify-between text-blue-600">
                                <span>Asuransi</span>
                                <span>-{formatCurrency(billing.insuranceCoverage!)}</span>
                            </div>
                        )}

                        {/* Total */}
                        <div className="border-t pt-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(billing.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Paid Amount */}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dibayar</span>
                            <span className="font-medium text-green-600">
                                {formatCurrency(billing.paidAmount)}
                            </span>
                        </div>

                        {/* Remaining Amount */}
                        <div className="border-t pt-2">
                            <div className="flex justify-between text-xl font-bold">
                                <span>Sisa</span>
                                <span className={statusConfig.color}>
                                    {formatCurrency(
                                        billing.remainingAmount || billing.patientPayable
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isPaid && (
                        <Button onClick={onProcessPayment} className="w-full" size="lg">
                            Proses Pembayaran
                        </Button>
                    )}

                    {/* Paid Indicator */}
                    {isPaid && (
                        <div className="text-center p-4 bg-green-100 rounded-lg">
                            <p className="text-green-700 font-semibold text-lg">✓ LUNAS</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
