/**
 * Discount Dialog Component
 * Allows cashier to apply discounts and insurance coverage to billing
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/billing/billing-utils";

type DiscountType = "none" | "fixed" | "percentage";

interface DiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentSubtotal: number;
    currentDiscount?: number;
    currentDiscountPercentage?: number;
    currentInsuranceCoverage?: number;
    onSubmit: (data: {
        discount?: number;
        discountPercentage?: number;
        insuranceCoverage?: number;
    }) => void;
    isSubmitting?: boolean;
}

export function DiscountDialog({
    open,
    onOpenChange,
    currentSubtotal,
    currentDiscount = 0,
    currentDiscountPercentage = 0,
    currentInsuranceCoverage = 0,
    onSubmit,
    isSubmitting = false,
}: DiscountDialogProps) {
    // Determine initial discount type
    const initialDiscountType: DiscountType =
        currentDiscountPercentage > 0 ? "percentage" :
        currentDiscount > 0 ? "fixed" : "none";

    const [discountType, setDiscountType] = useState<DiscountType>(initialDiscountType);
    const [discountFixed, setDiscountFixed] = useState(currentDiscount.toString());
    const [discountPercentage, setDiscountPercentage] = useState(currentDiscountPercentage.toString());
    const [insuranceCoverage, setInsuranceCoverage] = useState(currentInsuranceCoverage.toString());

    // Calculate discount amount based on type
    const calculatedDiscount = useMemo(() => {
        if (discountType === "fixed") {
            return parseFloat(discountFixed) || 0;
        } else if (discountType === "percentage") {
            const percent = parseFloat(discountPercentage) || 0;
            return (currentSubtotal * percent) / 100;
        }
        return 0;
    }, [discountType, discountFixed, discountPercentage, currentSubtotal]);

    // Calculate final amount
    const insurance = parseFloat(insuranceCoverage) || 0;
    const totalAfterDiscount = currentSubtotal - calculatedDiscount;
    const patientPayable = totalAfterDiscount - insurance;

    // Validation
    const isValidDiscount = calculatedDiscount >= 0 && calculatedDiscount <= currentSubtotal;
    const isValidInsurance = insurance >= 0 && insurance <= totalAfterDiscount;
    const isValidTotal = patientPayable >= 0;

    const isValid = isValidDiscount && isValidInsurance && isValidTotal;

    const handleSubmit = () => {
        if (!isValid) return;

        onSubmit({
            discount: discountType === "fixed" ? calculatedDiscount : undefined,
            discountPercentage: discountType === "percentage" ? parseFloat(discountPercentage) : undefined,
            insuranceCoverage: insurance > 0 ? insurance : undefined,
        });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Terapkan Diskon & Jaminan</DialogTitle>
                    <DialogDescription>
                        Masukkan diskon dan/atau potongan asuransi/jaminan untuk pasien ini
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Subtotal */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Subtotal Tagihan</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentSubtotal)}</p>
                    </div>

                    <FieldGroup>
                        <FieldSet>
                            <FieldGroup>
                                {/* Discount Section */}
                                <Field>
                                    <FieldLabel>Tipe Diskon</FieldLabel>
                                    <RadioGroup
                                        value={discountType}
                                        onValueChange={(value) => setDiscountType(value as DiscountType)}
                                        disabled={isSubmitting}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="none" id="discount-none" />
                                            <Label htmlFor="discount-none">Tanpa Diskon</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="fixed" id="discount-fixed" />
                                            <Label htmlFor="discount-fixed">Diskon Nominal (Rp)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="percentage" id="discount-percentage" />
                                            <Label htmlFor="discount-percentage">Diskon Persentase (%)</Label>
                                        </div>
                                    </RadioGroup>
                                </Field>

                                {/* Fixed Discount Input */}
                                {discountType === "fixed" && (
                                    <Field>
                                        <FieldLabel htmlFor="discount-fixed-amount">
                                            Nominal Diskon (Rp)
                                        </FieldLabel>
                                        <Input
                                            id="discount-fixed-amount"
                                            type="number"
                                            value={discountFixed}
                                            onChange={(e) => setDiscountFixed(e.target.value)}
                                            placeholder="0"
                                            disabled={isSubmitting}
                                            min="0"
                                            max={currentSubtotal}
                                        />
                                        {!isValidDiscount && (
                                            <FieldDescription className="text-red-600">
                                                Diskon tidak boleh melebihi subtotal
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}

                                {/* Percentage Discount Input */}
                                {discountType === "percentage" && (
                                    <Field>
                                        <FieldLabel htmlFor="discount-percentage-amount">
                                            Persentase Diskon (%)
                                        </FieldLabel>
                                        <Input
                                            id="discount-percentage-amount"
                                            type="number"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(e.target.value)}
                                            placeholder="0"
                                            disabled={isSubmitting}
                                            min="0"
                                            max="100"
                                        />
                                        {discountType === "percentage" && parseFloat(discountPercentage) > 0 && (
                                            <FieldDescription>
                                                Diskon: {formatCurrency(calculatedDiscount)}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}

                                {/* Insurance Coverage */}
                                <Field>
                                    <FieldLabel htmlFor="insurance-coverage">
                                        Ditanggung Asuransi/Jaminan (Rp)
                                    </FieldLabel>
                                    <Input
                                        id="insurance-coverage"
                                        type="number"
                                        value={insuranceCoverage}
                                        onChange={(e) => setInsuranceCoverage(e.target.value)}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                        min="0"
                                        max={totalAfterDiscount}
                                    />
                                    {!isValidInsurance && (
                                        <FieldDescription className="text-red-600">
                                            Jaminan tidak boleh melebihi total setelah diskon
                                        </FieldDescription>
                                    )}
                                </Field>

                                {/* Summary */}
                                <div className="p-4 bg-primary/5 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(currentSubtotal)}</span>
                                    </div>
                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Diskon</span>
                                            <span>- {formatCurrency(calculatedDiscount)}</span>
                                        </div>
                                    )}
                                    {insurance > 0 && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>Ditanggung Asuransi</span>
                                            <span>- {formatCurrency(insurance)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                        <span>Total Dibayar Pasien</span>
                                        <span className={patientPayable < 0 ? "text-red-600" : "text-primary"}>
                                            {formatCurrency(patientPayable)}
                                        </span>
                                    </div>
                                    {!isValidTotal && (
                                        <p className="text-xs text-red-600">
                                            Total tidak valid, periksa kembali input
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <Field orientation="horizontal">
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !isValid}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? "Memproses..." : "Terapkan"}
                                        </Button>
                                        <Button
                                            onClick={handleClose}
                                            variant="outline"
                                            disabled={isSubmitting}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
}
