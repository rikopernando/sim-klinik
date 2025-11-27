/**
 * Prescription Fulfillment Dialog Component
 * Enhanced with batch selection
 */

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Package } from "lucide-react";
import { getAvailableBatches, type DrugInventoryWithDetails } from "@/lib/services/inventory.service";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";

interface Drug {
    id: number;
    name: string;
    genericName?: string | null;
    unit: string;
}

interface Prescription {
    id: number;
    quantity: number;
}

interface SelectedPrescription {
    prescription: Prescription;
    drug: Drug;
}

interface FulfillmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedPrescription: SelectedPrescription | null;
    isSubmitting: boolean;
    onSubmit: (data: {
        inventoryId: number;
        dispensedQuantity: number;
        fulfilledBy: string;
        notes?: string;
    }) => void;
}

export function FulfillmentDialog({
    open,
    onOpenChange,
    selectedPrescription,
    isSubmitting,
    onSubmit,
}: FulfillmentDialogProps) {
    const [formData, setFormData] = useState({
        inventoryId: "",
        dispensedQuantity: "",
        fulfilledBy: "",
        notes: "",
    });

    const [availableBatches, setAvailableBatches] = useState<DrugInventoryWithDetails[]>([]);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<DrugInventoryWithDetails | null>(null);

    // Fetch available batches when prescription is selected
    useEffect(() => {
        if (open && selectedPrescription?.drug.id) {
            setIsLoadingBatches(true);
            getAvailableBatches(selectedPrescription.drug.id)
                .then((batches) => {
                    setAvailableBatches(batches);
                    // Auto-select first batch (FEFO - First Expired, First Out)
                    if (batches.length > 0) {
                        handleBatchSelect(batches[0]);
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch batches:", error);
                    setAvailableBatches([]);
                })
                .finally(() => {
                    setIsLoadingBatches(false);
                });
        }
    }, [open, selectedPrescription?.drug.id]);

    const handleBatchSelect = (batch: DrugInventoryWithDetails) => {
        setSelectedBatch(batch);
        setFormData((prev) => ({
            ...prev,
            inventoryId: batch.id.toString(),
            dispensedQuantity: prev.dispensedQuantity || selectedPrescription?.prescription.quantity.toString() || "",
        }));
    };

    const handleSubmit = () => {
        onSubmit({
            inventoryId: parseInt(formData.inventoryId),
            dispensedQuantity: parseInt(formData.dispensedQuantity),
            fulfilledBy: formData.fulfilledBy,
            notes: formData.notes || undefined,
        });
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                inventoryId: "",
                dispensedQuantity: "",
                fulfilledBy: "",
                notes: "",
            });
            setSelectedBatch(null);
            setAvailableBatches([]);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Proses Resep</DialogTitle>
                    <DialogDescription>
                        Pilih batch dan isi informasi pengambilan obat
                    </DialogDescription>
                </DialogHeader>

                {selectedPrescription && (
                    <div className="space-y-4">
                        {/* Drug Info */}
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium text-muted-foreground">Obat</p>
                            <p className="text-lg font-semibold">{selectedPrescription.drug.name}</p>
                            {selectedPrescription.drug.genericName && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedPrescription.drug.genericName}
                                </p>
                            )}
                            <p className="text-sm mt-1">
                                Jumlah resep:{" "}
                                <span className="font-semibold">
                                    {selectedPrescription.prescription.quantity} {selectedPrescription.drug.unit}
                                </span>
                            </p>
                        </div>

                        {/* Available Batches */}
                        <div>
                            <Label>
                                Pilih Batch <span className="text-destructive">*</span>
                            </Label>
                            {isLoadingBatches ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    Loading batches...
                                </div>
                            ) : availableBatches.length === 0 ? (
                                <div className="p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-destructive">
                                            Tidak ada stok tersedia
                                        </p>
                                        <p className="text-xs text-destructive/80 mt-1">
                                            Obat ini tidak memiliki batch dengan stok yang tersedia.
                                            Silakan tambah stok terlebih dahulu.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                    {availableBatches.map((batch) => {
                                        const colors = getExpiryAlertColor(batch.expiryAlertLevel);
                                        const isSelected = selectedBatch?.id === batch.id;

                                        return (
                                            <Card
                                                key={batch.id}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "border-primary ring-2 ring-primary"
                                                        : "hover:border-primary/50"
                                                }`}
                                                onClick={() => handleBatchSelect(batch)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                                <p className="font-mono text-sm font-medium">
                                                                    {batch.batchNumber}
                                                                </p>
                                                                {isSelected && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        Dipilih
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span>
                                                                    Stok:{" "}
                                                                    <span className="font-semibold text-foreground">
                                                                        {batch.stockQuantity} {batch.drug.unit}
                                                                    </span>
                                                                </span>
                                                                <span className={colors.text}>
                                                                    Exp:{" "}
                                                                    {formatExpiryDate(
                                                                        batch.expiryDate,
                                                                        batch.daysUntilExpiry
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Badge className={colors.badge}>
                                                            {batch.expiryAlertLevel === "expiring_soon"
                                                                ? "Segera Exp"
                                                                : batch.expiryAlertLevel === "warning"
                                                                ? "Perhatian"
                                                                : "Aman"}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quantity and Pharmacist */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dispensedQuantity">
                                    Jumlah yang Diberikan <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="dispensedQuantity"
                                    type="number"
                                    min="1"
                                    max={selectedBatch?.stockQuantity || selectedPrescription.prescription.quantity}
                                    value={formData.dispensedQuantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dispensedQuantity: e.target.value,
                                        })
                                    }
                                    placeholder={`Max: ${selectedBatch?.stockQuantity || selectedPrescription.prescription.quantity}`}
                                    disabled={isSubmitting || !selectedBatch}
                                />
                                {selectedBatch && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Stok tersedia: {selectedBatch.stockQuantity} {selectedBatch.drug.unit}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="fulfilledBy">
                                    Diproses Oleh <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="fulfilledBy"
                                    value={formData.fulfilledBy}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fulfilledBy: e.target.value,
                                        })
                                    }
                                    placeholder="Nama petugas"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                                placeholder="Tambahkan catatan jika diperlukan"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedBatch || !formData.dispensedQuantity || !formData.fulfilledBy}
                                className="flex-1"
                            >
                                {isSubmitting ? "Memproses..." : "Proses Resep"}
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
                )}
            </DialogContent>
        </Dialog>
    );
}
