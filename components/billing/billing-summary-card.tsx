/**
 * Billing Summary Card Component
 * Displays itemized billing details with subtotal, discounts, and total
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/billing/billing-utils";
import { Receipt } from "lucide-react";

interface BillingItem {
    itemName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
}

interface BillingSummary {
    subtotal: string;
    discount: string;
    insuranceCoverage: string;
    totalAmount: string;
    paidAmount: string;
    remainingAmount: string;
}

interface BillingSummaryCardProps {
    items: BillingItem[];
    summary: BillingSummary;
}

export function BillingSummaryCard({ items, summary }: BillingSummaryCardProps) {
    const hasDiscount = parseFloat(summary.discount) > 0;
    const hasInsurance = parseFloat(summary.insuranceCoverage) > 0;
    const hasPaidAmount = parseFloat(summary.paidAmount) > 0;

    return (
        <Card className="py-4 gap-4">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Rincian Tagihan
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Billing Items */}
                <div>
                    {items.map((item, index) => (
                        <BillingItemRow key={index} item={item} isLast={index === items.length - 1} />
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Billing Summary */}
                <div className="space-y-2 text-sm">
                    <SummaryRow label="Subtotal" value={summary.subtotal} />

                    {hasDiscount && (
                        <SummaryRow
                            label="Diskon"
                            value={summary.discount}
                            className="text-red-600"
                            isNegative
                        />
                    )}

                    {hasInsurance && (
                        <SummaryRow
                            label="Ditanggung Asuransi"
                            value={summary.insuranceCoverage}
                            className="text-blue-600"
                            isNegative
                        />
                    )}

                    <Separator />

                    <SummaryRow
                        label="Total"
                        value={summary.totalAmount}
                        className="font-bold text-lg"
                    />

                    {hasPaidAmount && (
                        <>
                            <SummaryRow
                                label="Terbayar"
                                value={summary.paidAmount}
                                className="text-green-600"
                            />
                            <SummaryRow
                                label="Sisa Tagihan"
                                value={summary.remainingAmount}
                                className="font-bold text-lg text-primary"
                            />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface BillingItemRowProps {
    item: BillingItem;
    isLast: boolean;
}

function BillingItemRow({ item, isLast }: BillingItemRowProps) {
    return (
        <div className={`flex justify-between items-start py-2 ${!isLast ? "border-b" : ""}`}>
            <div className="flex-1">
                <p className="font-medium text-sm">{item.itemName}</p>
                <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
            </div>
            <p className="font-semibold text-sm">{formatCurrency(item.totalPrice)}</p>
        </div>
    );
}

interface SummaryRowProps {
    label: string;
    value: string;
    className?: string;
    isNegative?: boolean;
}

function SummaryRow({ label, value, className = "", isNegative = false }: SummaryRowProps) {
    const formattedValue = isNegative ? `- ${formatCurrency(value)}` : formatCurrency(value);

    return (
        <div className={`flex justify-between ${className}`}>
            <span className={className.includes("font-bold") ? "" : "text-muted-foreground"}>
                {label}
            </span>
            <span>{formattedValue}</span>
        </div>
    );
}
