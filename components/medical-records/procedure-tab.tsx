"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { addProcedure, deleteProcedure } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { formatDate } from "@/lib/utils/date";
import { type Procedure } from "@/types/medical-record";
import { formatIcdCode, canEditMedicalRecord } from "@/lib/utils/medical-record";

import { SectionCard } from "./section-card";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";

interface ProcedureTabProps {
    medicalRecordId: number;
    procedures: Procedure[];
    onUpdate: () => void;
    isLocked: boolean;
}

const INITIAL_FORM_STATE = {
    icd9Code: "",
    description: "",
    performedBy: "",
    notes: "",
};

export function ProcedureTab({ medicalRecordId, procedures, onUpdate, isLocked }: ProcedureTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const canEdit = canEditMedicalRecord(isLocked);

    const handleAdd = async () => {
        if (!formData.icd9Code || !formData.description) {
            setError("Kode ICD-9 dan deskripsi wajib diisi");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await addProcedure({
                medicalRecordId,
                icd9Code: formatIcdCode(formData.icd9Code),
                description: formData.description,
                performedBy: formData.performedBy || undefined,
                notes: formData.notes || undefined,
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
        const confirmed = window.confirm("Hapus tindakan ini?");
        if (!confirmed) return;

        try {
            setError(null);
            await deleteProcedure(id);
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
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

            {/* Existing Procedures */}
            {procedures.length > 0 && (
                <SectionCard
                    title="Daftar Tindakan"
                    description="Tindakan medis yang telah dilakukan pada pasien ini"
                >
                    <div className="space-y-3">
                        {procedures.map((procedure) => (
                            <ListItem
                                key={procedure.id}
                                onDelete={() => handleDelete(procedure.id)}
                                showDelete={canEdit}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium">
                                            {procedure.icd9Code}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium">{procedure.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        {procedure.performedBy && (
                                            <div>
                                                <span className="font-medium">Dilakukan oleh:</span>{" "}
                                                {procedure.performedBy}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Waktu:</span>{" "}
                                            {formatDate(procedure.performedAt)}
                                        </div>
                                    </div>
                                    {procedure.notes && (
                                        <p className="text-sm italic text-muted-foreground">
                                            {procedure.notes}
                                        </p>
                                    )}
                                </div>
                            </ListItem>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Add New Procedure */}
            {canEdit && (
                <SectionCard
                    title="Tambah Tindakan"
                    description="Tambahkan tindakan medis yang dilakukan berdasarkan kode ICD-9"
                >
                    {!isAdding ? (
                        <Button onClick={() => setIsAdding(true)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Tindakan
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* ICD-9 Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="icd9Code">
                                        Kode ICD-9 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="icd9Code"
                                        value={formData.icd9Code}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                icd9Code: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        placeholder="Contoh: 99.21"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Masukkan kode ICD-9-CM procedure
                                    </p>
                                </div>

                                {/* Performed By */}
                                <div className="space-y-2">
                                    <Label htmlFor="performedBy">Dilakukan Oleh</Label>
                                    <Input
                                        id="performedBy"
                                        value={formData.performedBy}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, performedBy: e.target.value }))
                                        }
                                        placeholder="Nama dokter/perawat"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Deskripsi Tindakan <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    placeholder="Contoh: Injection of antibiotic"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                                    }
                                    placeholder="Catatan tambahan mengenai tindakan"
                                    rows={3}
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
                                            Simpan Tindakan
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

            {procedures.length === 0 && !isAdding && (
                <EmptyState message="Belum ada tindakan yang ditambahkan" />
            )}
        </div>
    );
}
