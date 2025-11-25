/**
 * Prescription Fulfillment Dialog Component
 */

import { useState } from "react";
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

interface Drug {
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
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Proses Resep</DialogTitle>
                    <DialogDescription>
                        Isi informasi pengambilan obat
                    </DialogDescription>
                </DialogHeader>

                {selectedPrescription && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium">Obat</p>
                            <p className="text-lg">{selectedPrescription.drug.name}</p>
                            {selectedPrescription.drug.genericName && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedPrescription.drug.genericName}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="inventoryId">
                                Inventory ID <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="inventoryId"
                                type="number"
                                value={formData.inventoryId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        inventoryId: e.target.value,
                                    })
                                }
                                placeholder="Masukkan inventory ID"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <Label htmlFor="dispensedQuantity">
                                Jumlah yang Diberikan <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="dispensedQuantity"
                                type="number"
                                value={formData.dispensedQuantity}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dispensedQuantity: e.target.value,
                                    })
                                }
                                placeholder={`Max: ${selectedPrescription.prescription.quantity}`}
                                disabled={isSubmitting}
                            />
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

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? "Memproses..." : "Proses"}
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
