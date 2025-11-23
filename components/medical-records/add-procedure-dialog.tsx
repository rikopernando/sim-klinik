"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, X } from "lucide-react";
import { z } from "zod";

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
import { Separator } from "@/components/ui/separator";

import { addProcedure } from "@/lib/services/medical-record.service";
import { getMedicalStaff, formatMedicalStaffName, type MedicalStaff } from "@/lib/services/medical-staff.service";
import { getErrorMessage } from "@/lib/utils/error";
import { formatIcdCode } from "@/lib/utils/medical-record";

interface AddProcedureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecordId: number;
    onSuccess: () => void;
}

// Validation schema for a single procedure item
const procedureItemSchema = z.object({
    icd9Code: z.string().min(1, "Kode ICD-9 wajib diisi"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    performedBy: z.string().optional(),
    notes: z.string().optional(),
});

// Schema for the entire form with array of procedures
const procedureFormSchema = z.object({
    procedures: z.array(procedureItemSchema).min(1, "Minimal 1 tindakan harus ditambahkan"),
});

type ProcedureFormData = z.infer<typeof procedureFormSchema>;

export function AddProcedureDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
}: AddProcedureDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    const form = useForm<ProcedureFormData>({
        resolver: zodResolver(procedureFormSchema),
        defaultValues: {
            procedures: [
                {
                    icd9Code: "",
                    description: "",
                    performedBy: "",
                    notes: "",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "procedures",
    });

    // Fetch medical staff when dialog opens
    useEffect(() => {
        if (open) {
            const fetchMedicalStaff = async () => {
                setLoadingStaff(true);
                try {
                    const staff = await getMedicalStaff();
                    setMedicalStaff(staff);
                } catch (err) {
                    console.error("Error fetching medical staff:", err);
                    setError("Gagal memuat daftar tenaga medis");
                } finally {
                    setLoadingStaff(false);
                }
            };

            fetchMedicalStaff();
        }
    }, [open]);

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
            icd9Code: "",
            description: "",
            performedBy: "",
            notes: "",
        });
    };

    const handleRemoveItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const onSubmit = async (data: ProcedureFormData) => {
        try {
            setIsSaving(true);
            setError(null);

            // Save all procedures sequentially
            for (const procedure of data.procedures) {
                await addProcedure({
                    medicalRecordId,
                    icd9Code: formatIcdCode(procedure.icd9Code),
                    description: procedure.description,
                    performedBy: procedure.performedBy || undefined,
                    notes: procedure.notes || undefined,
                });
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
                        <DialogTitle>Tambah Tindakan</DialogTitle>
                        <DialogDescription>
                            Tambahkan satu atau lebih tindakan medis berdasarkan kode ICD-9
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Procedure Items */}
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4">
                                {index > 0 && <Separator />}

                                {/* Item Header */}
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Tindakan #{index + 1}</h4>
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* ICD-9 Code */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`icd9Code-${index}`}>
                                            Kode ICD-9 <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`icd9Code-${index}`}
                                            {...form.register(`procedures.${index}.icd9Code`, {
                                                onChange: (e) => {
                                                    e.target.value = e.target.value.toUpperCase();
                                                },
                                            })}
                                            placeholder="Contoh: 99.21"
                                            className="font-mono"
                                        />
                                        {form.formState.errors.procedures?.[index]?.icd9Code && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.procedures[index]?.icd9Code?.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Masukkan kode ICD-9-CM procedure
                                        </p>
                                    </div>

                                    {/* Performed By */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`performedBy-${index}`}>Dilakukan Oleh</Label>
                                        <Select
                                            value={form.watch(`procedures.${index}.performedBy`)}
                                            onValueChange={(value) =>
                                                form.setValue(`procedures.${index}.performedBy`, value)
                                            }
                                            disabled={loadingStaff}
                                        >
                                            <SelectTrigger className="w-full" id={`performedBy-${index}`}>
                                                {loadingStaff ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder="Pilih dokter/perawat" />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicalStaff.map((staff) => (
                                                    <SelectItem key={staff.id} value={staff.id}>
                                                        {formatMedicalStaffName(staff)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor={`description-${index}`}>
                                        Deskripsi Tindakan <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`description-${index}`}
                                        {...form.register(`procedures.${index}.description`)}
                                        placeholder="Contoh: Injection of antibiotic"
                                    />
                                    {form.formState.errors.procedures?.[index]?.description && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.procedures[index]?.description?.message}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor={`notes-${index}`}>Catatan</Label>
                                    <Textarea
                                        id={`notes-${index}`}
                                        {...form.register(`procedures.${index}.notes`)}
                                        placeholder="Catatan tambahan mengenai tindakan"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddItem}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Tindakan Lain
                        </Button>
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
                                    Menyimpan {fields.length} Tindakan...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Simpan {fields.length} Tindakan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
