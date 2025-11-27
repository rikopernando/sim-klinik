/**
 * Add Inventory Dialog Component
 * Form for adding new drug inventory (stock incoming)
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";
import { DrugSearch } from "@/components/medical-records/drug-search";
import { useAddInventory } from "@/hooks/use-add-inventory";
import { checkDuplicateBatch, type DuplicateBatchCheck } from "@/lib/services/inventory.service";

interface AddInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddInventoryDialog({
    open,
    onOpenChange,
    onSuccess,
}: AddInventoryDialogProps) {
    const { addNewInventory, isSubmitting, error } = useAddInventory();

    const [formData, setFormData] = useState({
        drugId: 0,
        drugName: "",
        drugUnit: "",
        batchNumber: "",
        expiryDate: "",
        stockQuantity: "",
        purchasePrice: "",
        supplier: "",
        receivedDate: "",
    });

    const [duplicateCheck, setDuplicateCheck] = useState<DuplicateBatchCheck | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                drugId: 0,
                drugName: "",
                drugUnit: "",
                batchNumber: "",
                expiryDate: "",
                stockQuantity: "",
                purchasePrice: "",
                supplier: "",
                receivedDate: new Date().toISOString().split("T")[0], // Today's date
            });
            setDuplicateCheck(null);
            setShowDuplicateWarning(false);
        }
    }, [open]);

    const handleDrugSelect = (drugId: number, drugName: string, drugUnit?: string) => {
        setFormData((prev) => ({
            ...prev,
            drugId,
            drugName,
            drugUnit: drugUnit || "",
        }));
        setDuplicateCheck(null);
        setShowDuplicateWarning(false);
    };

    // Check for duplicate batch when batch number changes
    useEffect(() => {
        const checkBatch = async () => {
            if (formData.drugId && formData.batchNumber.trim()) {
                setIsCheckingDuplicate(true);
                const result = await checkDuplicateBatch(formData.drugId, formData.batchNumber);
                setDuplicateCheck(result);
                setShowDuplicateWarning(result.exists);
                setIsCheckingDuplicate(false);
            } else {
                setDuplicateCheck(null);
                setShowDuplicateWarning(false);
            }
        };

        const timeoutId = setTimeout(checkBatch, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.drugId, formData.batchNumber]);

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
                        Catat pemasukan stok obat baru dengan batch number dan tanggal
                        kadaluarsa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Drug Selection */}
                    <DrugSearch
                        value={formData.drugName}
                        onChange={(name) =>
                            setFormData((prev) => ({ ...prev, drugName: name }))
                        }
                        onSelect={handleDrugSelect}
                        label="Nama Obat"
                        required
                    />

                    {/* Display Unit (Read-only) */}
                    {formData.drugUnit && (
                        <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Satuan</p>
                                <p className="font-medium">{formData.drugUnit}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Batch Number */}
                        <div>
                            <Label htmlFor="batchNumber">
                                Nomor Batch <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="batchNumber"
                                value={formData.batchNumber}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        batchNumber: e.target.value,
                                    }))
                                }
                                placeholder="Masukkan nomor batch dari kemasan"
                                required
                                disabled={isSubmitting}
                            />
                            {isCheckingDuplicate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Memeriksa duplikasi...
                                </p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <Label htmlFor="expiryDate">
                                Tanggal Kadaluarsa <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        expiryDate: e.target.value,
                                    }))
                                }
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stock Quantity */}
                        <div>
                            <Label htmlFor="stockQuantity">
                                Jumlah Stok <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="stockQuantity"
                                type="number"
                                min="1"
                                value={formData.stockQuantity}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        stockQuantity: e.target.value,
                                    }))
                                }
                                placeholder="Masukkan jumlah"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Purchase Price */}
                        <div>
                            <Label htmlFor="purchasePrice">Harga Beli (Opsional)</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                step="0.01"
                                value={formData.purchasePrice}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        purchasePrice: e.target.value,
                                    }))
                                }
                                placeholder="0.00"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Supplier */}
                        <div>
                            <Label htmlFor="supplier">Supplier (Opsional)</Label>
                            <Input
                                id="supplier"
                                value={formData.supplier}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        supplier: e.target.value,
                                    }))
                                }
                                placeholder="Nama supplier"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Received Date */}
                        <div>
                            <Label htmlFor="receivedDate">Tanggal Terima</Label>
                            <Input
                                id="receivedDate"
                                type="date"
                                value={formData.receivedDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        receivedDate: e.target.value,
                                    }))
                                }
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Duplicate Batch Warning */}
                    {showDuplicateWarning && duplicateCheck?.batch && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium">Batch sudah ada!</p>
                                <p className="text-sm mt-1">
                                    Batch <strong>{duplicateCheck.batch.batchNumber}</strong> untuk obat ini
                                    sudah ada dengan stok{" "}
                                    <strong>{duplicateCheck.batch.stockQuantity} {duplicateCheck.batch.drug.unit}</strong>.
                                </p>
                                <p className="text-xs mt-2">
                                    Jika ini adalah penambahan stok untuk batch yang sama, pastikan nomor batch
                                    benar. Atau gunakan nomor batch berbeda jika ini batch baru.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                            {error}
                        </div>
                    )}

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
