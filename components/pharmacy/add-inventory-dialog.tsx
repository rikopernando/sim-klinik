/**
 * Add Inventory Dialog Component (Refactored)
 * Form for adding new drug inventory (stock incoming)
 */

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DrugSearch } from "@/components/medical-records/drug-search";
import { useAddInventory } from "@/hooks/use-add-inventory";
import { useBatchDuplicateCheck } from "@/hooks/use-batch-duplicate-check";
import { DrugUnitDisplay } from "./inventory/drug-unit-display";
import { BatchDuplicateWarning } from "./inventory/batch-duplicate-warning";
import { InventoryFormFields } from "./inventory/inventory-form-fields";

interface AddInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface FormData {
    drugId: number;
    drugName: string;
    drugUnit: string;
    batchNumber: string;
    expiryDate: string;
    stockQuantity: string;
    purchasePrice: string;
    supplier: string;
    receivedDate: string;
}

const initialFormData: FormData = {
    drugId: 0,
    drugName: "",
    drugUnit: "",
    batchNumber: "",
    expiryDate: "",
    stockQuantity: "",
    purchasePrice: "",
    supplier: "",
    receivedDate: new Date().toISOString().split("T")[0],
};

export function AddInventoryDialog({
    open,
    onOpenChange,
    onSuccess,
}: AddInventoryDialogProps) {
    const { addNewInventory, isSubmitting, error } = useAddInventory();
    const [formData, setFormData] = useState<FormData>(initialFormData);

    // Batch duplicate check
    const { duplicateCheck, isChecking, isDuplicate, reset: resetDuplicateCheck } =
        useBatchDuplicateCheck({
            drugId: formData.drugId,
            batchNumber: formData.batchNumber,
        });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            resetDuplicateCheck();
        }
    }, [open, resetDuplicateCheck]);

    // Handle drug selection
    const handleDrugSelect = useCallback(
        (drugId: number, drugName: string, drugUnit?: string) => {
            setFormData((prev) => ({
                ...prev,
                drugId,
                drugName,
                drugUnit: drugUnit || "",
            }));
            resetDuplicateCheck();
        },
        [resetDuplicateCheck]
    );

    // Handle form field changes
    const handleFieldChange = useCallback((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.drugId) {
            alert("Pilih obat terlebih dahulu");
            return;
        }

        const success = await addNewInventory({
            drugId: formData.drugId,
            batchNumber: formData.batchNumber,
            expiryDate: new Date(formData.expiryDate).toISOString(),
            stockQuantity: parseInt(formData.stockQuantity),
            purchasePrice: formData.purchasePrice || undefined,
            supplier: formData.supplier || undefined,
            receivedDate: formData.receivedDate
                ? new Date(formData.receivedDate).toISOString()
                : undefined,
        });

        if (success) {
            onSuccess();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Stok Obat</DialogTitle>
                    <DialogDescription>
                        Catat pemasukan stok obat baru dengan batch number dan tanggal kadaluarsa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Drug Selection */}
                    <DrugSearch
                        value={formData.drugName}
                        onChange={(name) => handleFieldChange("drugName", name)}
                        onSelect={handleDrugSelect}
                        label="Nama Obat"
                        required
                    />

                    {/* Display Unit */}
                    <DrugUnitDisplay unit={formData.drugUnit} />

                    {/* Form Fields */}
                    <InventoryFormFields
                        formData={formData}
                        onChange={handleFieldChange}
                        disabled={isSubmitting}
                        isCheckingDuplicate={isChecking}
                    />

                    {/* Duplicate Warning */}
                    {isDuplicate && duplicateCheck && (
                        <BatchDuplicateWarning duplicateCheck={duplicateCheck} />
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
