"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { addPrescription } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { MEDICATION_ROUTES } from "@/types/medical-record";
import { type Drug } from "@/hooks/use-drug-search";
import { DrugSearch } from "./drug-search";

interface AddPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecordId: number;
    onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
    drugId: 0,
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 1,
    instructions: "",
    route: "oral",
};

export function AddPrescriptionDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
}: AddPrescriptionDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [drugSearch, setDrugSearch] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setDrugSearch("");
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleDrugSelect = (drug: Drug) => {
        setFormData((prev) => ({
            ...prev,
            drugId: drug.id,
            drugName: drug.name,
        }));
        setDrugSearch(drug.name);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.drugId || !formData.dosage || !formData.frequency || !formData.quantity) {
            setError("Obat, dosis, frekuensi, dan jumlah wajib diisi");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await addPrescription({
                medicalRecordId,
                drugId: formData.drugId,
                dosage: formData.dosage,
                frequency: formData.frequency,
                duration: formData.duration || undefined,
                quantity: formData.quantity,
                instructions: formData.instructions || undefined,
                route: formData.route || undefined,
            });

            handleClose();
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Resep</DialogTitle>
                        <DialogDescription>
                            Tambahkan resep obat baru untuk pasien
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Drug Search */}
                        <DrugSearch
                            value={drugSearch}
                            onChange={setDrugSearch}
                            onSelect={handleDrugSelect}
                            required
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Dosage */}
                            <div className="space-y-2">
                                <Label htmlFor="dosage">
                                    Dosis <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="dosage"
                                    value={formData.dosage}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, dosage: e.target.value }))
                                    }
                                    placeholder="Contoh: 500mg, 1 tablet"
                                />
                            </div>

                            {/* Frequency */}
                            <div className="space-y-2">
                                <Label htmlFor="frequency">
                                    Frekuensi <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="frequency"
                                    value={formData.frequency}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                                    }
                                    placeholder="Contoh: 3x sehari"
                                />
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Durasi</Label>
                                <Input
                                    id="duration"
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, duration: e.target.value }))
                                    }
                                    placeholder="Contoh: 7 hari"
                                />
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label htmlFor="quantity">
                                    Jumlah <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            quantity: parseInt(e.target.value, 10) || 1,
                                        }))
                                    }
                                />
                            </div>

                            {/* Route */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="route">Rute Pemberian</Label>
                                <Select
                                    value={formData.route}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, route: value }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEDICATION_ROUTES.map((route) => (
                                            <SelectItem key={route.value} value={route.value}>
                                                {route.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instruksi Tambahan</Label>
                            <Textarea
                                id="instructions"
                                value={formData.instructions}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                                }
                                placeholder="Contoh: Diminum setelah makan"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSaving}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Simpan Resep
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
