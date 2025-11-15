"use client";

import { useState, useCallback, useMemo } from "react";
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

import { addDiagnosis, deleteDiagnosis } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { type Diagnosis, DIAGNOSIS_TYPES } from "@/types/medical-record";
import { formatIcdCode, formatDiagnosisType, getDiagnosisTypeBadgeVariant, canEditMedicalRecord } from "@/lib/utils/medical-record";
import { SectionCard } from "./section-card";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";

interface DiagnosisTabProps {
    medicalRecordId: number;
    diagnoses: Diagnosis[];
    onUpdate: () => void;
    isLocked: boolean;
}

const INITIAL_FORM_STATE = {
    icd10Code: "",
    description: "",
    diagnosisType: "primary" as "primary" | "secondary",
};

export function DiagnosisTab({ medicalRecordId, diagnoses, onUpdate, isLocked }: DiagnosisTabProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked]);

    const resetForm = useCallback(() => {
        setFormData(INITIAL_FORM_STATE);
        setIsAdding(false);
    }, []);

    const handleAdd = useCallback(async () => {
        if (!formData.icd10Code || !formData.description) {
            setError("Kode ICD-10 dan deskripsi wajib diisi");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            await addDiagnosis({
                medicalRecordId,
                icd10Code: formatIcdCode(formData.icd10Code),
                description: formData.description,
                diagnosisType: formData.diagnosisType,
            });

            resetForm();
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }, [formData, medicalRecordId, onUpdate, resetForm]);

    const handleDelete = useCallback(async (id: number) => {
        const confirmed = window.confirm("Hapus diagnosis ini?");
        if (!confirmed) return;

        try {
            setError(null);
            await deleteDiagnosis(id);
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, [onUpdate]);

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Existing Diagnoses */}
            {diagnoses.length > 0 && (
                <SectionCard
                    title="Daftar Diagnosis"
                    description="Diagnosis yang telah dicatat untuk pasien ini"
                >
                    <div className="space-y-3">
                        {diagnoses.map((diagnosis) => (
                            <ListItem
                                key={diagnosis.id}
                                onDelete={() => handleDelete(diagnosis.id)}
                                showDelete={canEdit}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getDiagnosisTypeBadgeVariant(diagnosis.diagnosisType)}>
                                            {formatDiagnosisType(diagnosis.diagnosisType)}
                                        </Badge>
                                        <span className="font-mono text-sm font-medium">
                                            {diagnosis.icd10Code}
                                        </span>
                                    </div>
                                    <p className="text-sm">{diagnosis.description}</p>
                                </div>
                            </ListItem>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Add New Diagnosis */}
            {canEdit && (
                <SectionCard
                    title="Tambah Diagnosis"
                    description="Tambahkan diagnosis baru berdasarkan kode ICD-10"
                >
                    {!isAdding ? (
                        <Button onClick={() => setIsAdding(true)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Diagnosis
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* ICD-10 Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="icd10Code">
                                        Kode ICD-10 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="icd10Code"
                                        value={formData.icd10Code}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                icd10Code: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        placeholder="Contoh: J00"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Masukkan kode ICD-10 (contoh: J00 untuk Common Cold)
                                    </p>
                                </div>

                                {/* Diagnosis Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosisType">Jenis Diagnosis</Label>
                                    <Select
                                        value={formData.diagnosisType}
                                        onValueChange={(value: "primary" | "secondary") =>
                                            setFormData((prev) => ({ ...prev, diagnosisType: value }))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIAGNOSIS_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Deskripsi Diagnosis <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                                    }
                                    placeholder="Contoh: Acute nasopharyngitis (Common cold)"
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
                                            Simpan Diagnosis
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

            {diagnoses.length === 0 && !isAdding && (
                <EmptyState message="Belum ada diagnosis yang ditambahkan" />
            )}
        </div>
    );
}
