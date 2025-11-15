"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

import { addPrescription, deletePrescription } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { type Prescription, MEDICATION_ROUTES } from "@/types/medical-record";
import { canEditMedicalRecord, canDeletePrescription } from "@/lib/utils/medical-record";
import { type Drug } from "@/hooks/use-drug-search";

import { SectionCard } from "./section-card";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";
import { DrugSearch } from "./drug-search";

interface PrescriptionTabProps {
    medicalRecordId: number;
    prescriptions: Prescription[];
    onUpdate: () => void;
    isLocked: boolean;
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

export function PrescriptionTab({ medicalRecordId, prescriptions, onUpdate, isLocked }: PrescriptionTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [drugSearch, setDrugSearch] = useState("");
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const canEdit = canEditMedicalRecord(isLocked);

    const handleDrugSelect = (drug: Drug) => {
        setFormData((prev) => ({
            ...prev,
            drugId: drug.id,
            drugName: drug.name,
        }));
    };

    const handleAdd = async () => {
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

            resetForm();
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Hapus resep ini?");
        if (!confirmed) return;

        try {
            setError(null);
            await deletePrescription(id);
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setDrugSearch("");
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Existing Prescriptions */}
            {prescriptions.length > 0 && (
                <SectionCard
                    title="Daftar Resep"
                    description="Resep obat yang telah diresepkan untuk pasien ini"
                >
                    <div className="space-y-3">
                        {prescriptions.map((prescription) => (
                            <ListItem
                                key={prescription.id}
                                onDelete={() => handleDelete(prescription.id)}
                                showDelete={canDeletePrescription(isLocked, prescription.isFulfilled)}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Drug ID: {prescription.drugId}</span>
                                        {prescription.isFulfilled && (
                                            <Badge variant="secondary">Sudah Diambil</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-medium">Dosis:</span> {prescription.dosage}
                                        </div>
                                        <div>
                                            <span className="font-medium">Frekuensi:</span> {prescription.frequency}
                                        </div>
                                        {prescription.duration && (
                                            <div>
                                                <span className="font-medium">Durasi:</span> {prescription.duration}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Jumlah:</span> {prescription.quantity}
                                        </div>
                                        {prescription.route && (
                                            <div>
                                                <span className="font-medium">Rute:</span> {prescription.route}
                                            </div>
                                        )}
                                    </div>
                                    {prescription.instructions && (
                                        <p className="text-sm italic">{prescription.instructions}</p>
                                    )}
                                </div>
                            </ListItem>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Add New Prescription */}
            {canEdit && (
                <SectionCard
                    title="Tambah Resep"
                    description="Tambahkan resep obat baru untuk pasien"
                >
                    {!isAdding ? (
                        <Button onClick={() => setIsAdding(true)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Resep
                        </Button>
                    ) : (
                        <div className="space-y-4">
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
                                <div className="space-y-2">
                                    <Label htmlFor="route">Rute Pemberian</Label>
                                    <Select
                                        value={formData.route}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, route: value }))
                                        }
                                    >
                                        <SelectTrigger>
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

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button onClick={handleAdd} disabled={isSaving} className="flex-1">
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
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        setError(null);
                                    }}
                                    disabled={isSaving}
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    )}
                </SectionCard>
            )}

            {prescriptions.length === 0 && !isAdding && (
                <EmptyState message="Belum ada resep yang ditambahkan" />
            )}
        </div>
    );
}
