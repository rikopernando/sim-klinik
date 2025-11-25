"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, X } from "lucide-react";
import { z } from "zod";

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
import { Separator } from "@/components/ui/separator";

import { addDiagnosis, updateDiagnosis } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { DIAGNOSIS_TYPES, type Diagnosis } from "@/types/medical-record";
import { formatIcdCode } from "@/lib/utils/medical-record";
import { ICD10Search } from "./icd10-search";

interface AddDiagnosisDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecordId: number;
    onSuccess: () => void;
    diagnosis?: Diagnosis | null; // If provided, it's edit mode
}

// Validation schema for a single diagnosis item
const diagnosisItemSchema = z.object({
    icd10Code: z.string().min(1, "Kode ICD-10 wajib diisi"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    diagnosisType: z.enum(["primary", "secondary"]),
});

// Schema for the entire form with array of diagnoses
const diagnosisFormSchema = z.object({
    diagnoses: z.array(diagnosisItemSchema).min(1, "Minimal 1 diagnosis harus ditambahkan"),
});

type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>;

export function AddDiagnosisDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
    diagnosis,
}: AddDiagnosisDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditMode = !!diagnosis;

    const form = useForm<DiagnosisFormData>({
        resolver: zodResolver(diagnosisFormSchema),
        defaultValues: {
            diagnoses: [
                {
                    icd10Code: "",
                    description: "",
                    diagnosisType: "primary",
                },
            ],
        },
    });

    // Reset form when dialog opens or diagnosis changes
    useEffect(() => {
        if (open) {
            if (isEditMode && diagnosis) {
                form.reset({
                    diagnoses: [
                        {
                            icd10Code: diagnosis.icd10Code,
                            description: diagnosis.description,
                            diagnosisType: diagnosis.diagnosisType,
                        },
                    ],
                });
            } else {
                form.reset({
                    diagnoses: [
                        {
                            icd10Code: "",
                            description: "",
                            diagnosisType: "primary",
                        },
                    ],
                });
            }
        }
    }, [open, diagnosis, isEditMode, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "diagnoses",
    });

    const resetForm = () => {
        form.reset();
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleAddItem = () => {
        append({
            icd10Code: "",
            description: "",
            diagnosisType: "secondary", // Auto set to secondary for additional diagnoses
        });
    };

    const handleRemoveItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const onSubmit = async (data: DiagnosisFormData) => {
        try {
            setIsSaving(true);
            setError(null);

            if (isEditMode && diagnosis) {
                // Edit mode: update single diagnosis
                await updateDiagnosis(diagnosis.id, {
                    icd10Code: formatIcdCode(data.diagnoses[0].icd10Code),
                    description: data.diagnoses[0].description,
                    diagnosisType: data.diagnoses[0].diagnosisType,
                });
            } else {
                // Add mode: save all diagnoses sequentially
                for (const diagnosisItem of data.diagnoses) {
                    await addDiagnosis({
                        medicalRecordId,
                        icd10Code: formatIcdCode(diagnosisItem.icd10Code),
                        description: diagnosisItem.description,
                        diagnosisType: diagnosisItem.diagnosisType,
                    });
                }
            }

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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Diagnosis" : "Tambah Diagnosis"}</DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? "Perbarui diagnosis berdasarkan kode ICD-10"
                                : "Tambahkan satu atau lebih diagnosis berdasarkan kode ICD-10"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Diagnosis Items */}
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4">
                                {index > 0 && <Separator />}

                                {/* Item Header (only show counter in add mode) */}
                                {!isEditMode && (
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Diagnosis #{index + 1}</h4>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-destructive text-destructive"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                )}

                                    {/* ICD-10 Code Search */}
                                    <div className="space-y-2">
                                        <ICD10Search
                                            value={form.watch(`diagnoses.${index}.icd10Code`) || ""}
                                            onChange={(value) => {
                                                form.setValue(`diagnoses.${index}.icd10Code`, value);
                                            }}
                                            onSelect={(code, description) => {
                                                form.setValue(`diagnoses.${index}.icd10Code`, code);
                                                form.setValue(`diagnoses.${index}.description`, description);
                                            }}
                                            label="Kode ICD-10"
                                            placeholder="Ketik kode atau nama penyakit..."
                                            required
                                        />
                                        {form.formState.errors.diagnoses?.[index]?.icd10Code && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.diagnoses[index]?.icd10Code?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${index}`}>
                                            Deskripsi Diagnosis <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`description-${index}`}
                                            {...form.register(`diagnoses.${index}.description`)}
                                            placeholder="Contoh: Acute nasopharyngitis (Common cold)"
                                        />
                                        {form.formState.errors.diagnoses?.[index]?.description && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.diagnoses[index]?.description?.message}
                                            </p>
                                        )}
                                    </div>

                                {/* Diagnosis Type */}
                                <div className="space-y-2">
                                        <Label htmlFor={`diagnosisType-${index}`}>Jenis Diagnosis</Label>
                                        <Select
                                            value={form.watch(`diagnoses.${index}.diagnosisType`)}
                                            onValueChange={(value: "primary" | "secondary") =>
                                                form.setValue(`diagnoses.${index}.diagnosisType`, value)
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
                        ))}

                        {/* Add More Button (only in add mode) */}
                        {!isEditMode && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddItem}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Diagnosis Lain
                            </Button>
                        )}
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
                                    {isEditMode ? "Menyimpan..." : `Menyimpan ${fields.length} Diagnosis...`}
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {isEditMode ? "Simpan" : `Simpan ${fields.length} Diagnosis`}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
