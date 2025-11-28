/**
 * Add Inventory Dialog Component (Refactored)
 * Form for adding new drug inventory (stock incoming)
 */

import { useState, useCallback } from "react";
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
import { type Drug } from "@/hooks/use-drug-search";

import { BatchDuplicateWarning } from "./inventory/batch-duplicate-warning";
import { InventoryFormFields } from "./inventory/inventory-form-fields";
import { DrugInventoryInputValues } from "@/types/inventory";

interface AddInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const initialFormData: DrugInventoryInputValues = {
    drugId: 0,
    drugName: "",
    drugUnit: "",
    batchNumber: "",
    expiryDate: undefined,
    stockQuantity: '',
    purchasePrice: "",
    supplier: "",
    receivedDate: undefined,
};

export function AddInventoryDialog({
    open,
    onOpenChange,
    onSuccess,
}: AddInventoryDialogProps) {
    const [drugSearch, setDrugSearch] = useState('');
    const { addNewInventory, isSubmitting, error } = useAddInventory();
    const [formData, setFormData] = useState<DrugInventoryInputValues>(initialFormData);

    // Batch duplicate check
    const { duplicateCheck, isChecking, isDuplicate, reset: resetDuplicateCheck } =
        useBatchDuplicateCheck({
            drugId: formData.drugId,
            batchNumber: formData.batchNumber,
        });

    // Handle drug selection
    const handleDrugSelect = useCallback(
        (drug: Drug) => {
            setFormData((prev) => ({
                ...prev,
                drugId: drug.id,
                drugName: drug.name,
                drugUnit: drug.unit || "",
            }));
            setDrugSearch(drug.name)
            resetDuplicateCheck();
        },
        [resetDuplicateCheck]
    );

    // Handle form field changes
    const handleFieldChange = useCallback((field: string, value: string | Date) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await addNewInventory({
            drugId: formData.drugId,
            batchNumber: formData.batchNumber,
            expiryDate: formData.expiryDate?.toISOString() || '',
            stockQuantity: parseInt(formData.stockQuantity),
            purchasePrice: formData.purchasePrice || undefined,
            supplier: formData.supplier || undefined,
            receivedDate: formData.receivedDate?.toISOString() || '',
        });

        if (success) {
            onSuccess();
            onOpenChange(false);
            setFormData({ ...initialFormData})
            setDrugSearch('')
            resetDuplicateCheck();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-[700px] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Stok Obat</DialogTitle>
                    <DialogDescription>
                        Catat pemasukan stok obat baru dengan batch number dan tanggal kadaluarsa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Drug Selection */}
                    <DrugSearch
                        value={drugSearch}
                        onChange={(name) => setDrugSearch(name)}
                        onSelect={handleDrugSelect}
                        label="Nama Obat"
                        required
                    />

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
