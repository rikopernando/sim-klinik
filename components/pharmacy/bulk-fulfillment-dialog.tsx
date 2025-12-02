/**
 * Bulk Prescription Fulfillment Dialog
 * Allows processing multiple prescriptions at once
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { getAvailableBatches, type DrugInventoryWithDetails } from "@/lib/services/inventory.service";
import { BatchSelector } from "./fulfillment/batch-selector";
import { getPharmacists, type Pharmacist } from "@/lib/services/pharmacist.service";
import { Label } from "../ui/label";

interface Drug {
    id: number;
    name: string;
    genericName?: string | null;
    unit: string;
    price: string;
}

interface Prescription {
    id: number;
    dosage: string;
    frequency: string;
    quantity: number;
    duration?: string | null;
    instructions?: string | null;
}

interface PrescriptionItem {
    prescription: Prescription;
    drug: Drug;
}

interface Patient {
    id: number;
    name: string;
    mrNumber: string;
}

interface Visit {
    id: number;
    visitNumber: string;
}

interface GroupedQueueItem {
    visit: Visit;
    patient: Patient;
    doctor: { id: string; name: string } | null;
    prescriptions: PrescriptionItem[];
}

interface FulfillmentFormData {
    inventoryId: number;
    dispensedQuantity: number;
    availableBatches: DrugInventoryWithDetails[];
    selectedBatch: DrugInventoryWithDetails | null;
    isLoading: boolean;
    error: string | null;
}

interface BulkFulfillmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedGroup: GroupedQueueItem | null;
    isSubmitting: boolean;
    onSubmit: (data: {
        prescriptionId: number;
        inventoryId: number;
        dispensedQuantity: number;
        fulfilledBy: string;
        notes?: string;
    }[]) => Promise<void>;
}

export function BulkFulfillmentDialog({
    open,
    onOpenChange,
    selectedGroup,
    isSubmitting,
    onSubmit,
}: BulkFulfillmentDialogProps) {
    const [fulfillmentData, setFulfillmentData] = useState<Record<number, FulfillmentFormData>>({});
    const [fulfilledBy, setFulfilledBy] = useState("");
    const [notes, setNotes] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [isLoadingPharmacists, setIsLoadingPharmacists] = useState(false);

    // Load pharmacists when dialog opens
    useEffect(() => {
        if (open) {
            const loadPharmacists = async () => {
                setIsLoadingPharmacists(true);
                try {
                    const pharmacistsList = await getPharmacists();
                    setPharmacists(pharmacistsList);
                } catch (error) {
                    console.error("Error fetching pharmacists:", error);
                } finally {
                    setIsLoadingPharmacists(false);
                }
            };

            loadPharmacists();
        }
    }, [open]);

    // Load batches for all prescriptions when dialog opens
    useEffect(() => {
        if (open && selectedGroup) {
            const loadBatches = async () => {
                const newData: Record<number, FulfillmentFormData> = {};

                for (const item of selectedGroup.prescriptions) {
                    newData[item.prescription.id] = {
                        inventoryId: 0,
                        dispensedQuantity: item.prescription.quantity,
                        availableBatches: [],
                        selectedBatch: null,
                        isLoading: true,
                        error: null,
                    };
                }

                setFulfillmentData(newData);

                // Load batches for each drug
                for (const item of selectedGroup.prescriptions) {
                    try {
                        const batches = await getAvailableBatches(item.drug.id);
                        const firstBatch = batches.length > 0 ? batches[0] : null;
                        setFulfillmentData((prev) => ({
                            ...prev,
                            [item.prescription.id]: {
                                ...prev[item.prescription.id],
                                availableBatches: batches,
                                selectedBatch: firstBatch,
                                inventoryId: firstBatch ? firstBatch.id : 0,
                                isLoading: false,
                            },
                        }));
                    } catch {
                        setFulfillmentData((prev) => ({
                            ...prev,
                            [item.prescription.id]: {
                                ...prev[item.prescription.id],
                                isLoading: false,
                                error: "Gagal memuat batch",
                            },
                        }));
                    }
                }
            };

            loadBatches();
        }
    }, [open, selectedGroup]);

    const handleBatchSelect = (prescriptionId: number, batch: DrugInventoryWithDetails) => {
        setFulfillmentData((prev) => ({
            ...prev,
            [prescriptionId]: {
                ...prev[prescriptionId],
                selectedBatch: batch,
                inventoryId: batch.id,
            },
        }));
    };

    const handleSubmit = async () => {
        setValidationError(null);

        // Validate all fields are filled
        if (!fulfilledBy.trim()) {
            setValidationError("Nama petugas wajib diisi");
            return;
        }

        const prescriptionData: Array<{
            prescriptionId: number;
            inventoryId: number;
            dispensedQuantity: number;
            fulfilledBy: string;
            notes?: string;
        }> = [];

        for (const item of selectedGroup?.prescriptions || []) {
            const data = fulfillmentData[item.prescription.id];

            if (!data || data.inventoryId === 0) {
                setValidationError(`Batch untuk ${item.drug.name} belum dipilih`);
                return;
            }

            if (!data.dispensedQuantity || data.dispensedQuantity <= 0) {
                setValidationError(`Jumlah untuk ${item.drug.name} tidak valid`);
                return;
            }

            prescriptionData.push({
                prescriptionId: item.prescription.id,
                inventoryId: data.inventoryId,
                dispensedQuantity: data.dispensedQuantity,
                fulfilledBy: fulfilledBy.trim(),
                notes: notes.trim() || undefined,
            });
        }

        await onSubmit(prescriptionData);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFulfillmentData({});
            setFulfilledBy("");
            setNotes("");
            setValidationError(null);
            onOpenChange(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Proses Resep - Bulk</DialogTitle>
                    <DialogDescription>
                        {selectedGroup && (
                            <div>
                                <p className="font-medium text-foreground">
                                    Pasien: {selectedGroup.patient.name} ({selectedGroup.patient.mrNumber})
                                </p>
                                <p className="text-sm">Kunjungan: {selectedGroup.visit.visitNumber}</p>
                                <p className="text-sm">
                                    Total Resep: {selectedGroup.prescriptions.length}
                                </p>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {validationError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    {/* Prescription Items */}
                    {selectedGroup?.prescriptions.map((item, idx) => {
                        const data = fulfillmentData[item.prescription.id];

                        return (
                            <div key={item.prescription.id} className="space-y-3">
                                {idx > 0 && <Separator />}

                                {/* Drug Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge>{idx + 1}</Badge>
                                            <h4 className="font-semibold">{item.drug.name}</h4>
                                        </div>
                                        {item.drug.genericName && (
                                            <p className="text-sm text-muted-foreground ml-8">
                                                {item.drug.genericName}
                                            </p>
                                        )}
                                        <div className="flex gap-4 text-sm text-muted-foreground ml-8 mt-1">
                                            <span>Dosis: {item.prescription.dosage}</span>
                                            <span>Frekuensi: {item.prescription.frequency}</span>
                                            <span>
                                                Jumlah Resep: {item.prescription.quantity} {item.drug.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Selector */}
                                <div className="ml-8">
                                    <BatchSelector
                                        isLoading={data?.isLoading || false}
                                        batches={data?.availableBatches || []}
                                        selectedBatch={data?.selectedBatch || null}
                                        onBatchSelect={(batch) =>
                                            handleBatchSelect(item.prescription.id, batch)
                                        }
                                        drugId={item.drug.id}
                                        drugName={item.drug.name}
                                    />
                                </div>

                                {/* Display Prescription Quantity (Read-only) */}
                                {!data?.isLoading && !data?.error && data?.selectedBatch && (
                                    <div className="ml-8">
                                        <p className="text-sm text-muted-foreground">
                                            Jumlah Diberikan: <span className="font-medium text-foreground">{item.prescription.quantity} {item.drug.unit}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <Separator />

                    {/* Common Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fulfilledBy">
                                Petugas Farmasi <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={fulfilledBy}
                                onValueChange={(value) => setFulfilledBy(value)}
                                disabled={isLoadingPharmacists}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            isLoadingPharmacists
                                                ? "Memuat farmasi..."
                                                : pharmacists.length === 0
                                                ? "Tidak ada farmasi tersedia"
                                                : "Pilih petugas farmasi"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {pharmacists.map((pharmacist) => (
                                        <SelectItem key={pharmacist.id} value={pharmacist.id}>
                                            {pharmacist.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Catatan tambahan untuk semua resep..."
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                isSubmitting ||
                                !fulfilledBy.trim() ||
                                Object.values(fulfillmentData).some(
                                    (d) => d.isLoading || d.inventoryId === 0
                                )
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                `Proses ${selectedGroup?.prescriptions.length || 0} Resep`
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
