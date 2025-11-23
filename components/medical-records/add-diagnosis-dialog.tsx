"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { addDiagnosis } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { DIAGNOSIS_TYPES } from "@/types/medical-record";
import { formatIcdCode } from "@/lib/utils/medical-record";

interface AddDiagnosisDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecordId: number;
    onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
    icd10Code: "",
    description: "",
    diagnosisType: "primary" as "primary" | "secondary",
};

export function AddDiagnosisDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
}: AddDiagnosisDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Diagnosis</DialogTitle>
                        <DialogDescription>
                            Tambahkan diagnosis baru berdasarkan kode ICD-10
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

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
                                    Simpan Diagnosis
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
