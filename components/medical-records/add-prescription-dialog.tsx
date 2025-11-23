"use client";

import { useState } from "react";
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

// Validation schema for a single prescription item
const prescriptionItemSchema = z.object({
    drugId: z.number().min(1, "Obat wajib dipilih"),
    drugName: z.string().min(1, "Nama obat wajib diisi"),
    dosage: z.string().min(1, "Dosis wajib diisi"),
    frequency: z.string().min(1, "Frekuensi wajib diisi"),
    duration: z.string().optional(),
    quantity: z.number().min(1, "Jumlah minimal 1"),
    instructions: z.string().optional(),
    route: z.string().optional(),
});

// Schema for the entire form with array of prescriptions
const prescriptionFormSchema = z.object({
    prescriptions: z.array(prescriptionItemSchema).min(1, "Minimal 1 resep harus ditambahkan"),
});

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

export function AddPrescriptionDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
}: AddPrescriptionDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [drugSearches, setDrugSearches] = useState<Record<number, string>>({});

    const form = useForm<PrescriptionFormData>({
        resolver: zodResolver(prescriptionFormSchema),
        defaultValues: {
            prescriptions: [
                {
                    drugId: 0,
                    drugName: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    quantity: 1,
                    instructions: "",
                    route: "oral",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "prescriptions",
    });

    const resetForm = () => {
        form.reset();
        setDrugSearches({});
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleDrugSelect = (index: number, drug: Drug) => {
        form.setValue(`prescriptions.${index}.drugId`, drug.id);
        form.setValue(`prescriptions.${index}.drugName`, drug.name);
        setDrugSearches((prev) => ({ ...prev, [index]: drug.name }));
    };

    const handleAddItem = () => {
        append({
            drugId: 0,
            drugName: "",
            dosage: "",
            frequency: "",
            duration: "",
            quantity: 1,
            instructions: "",
            route: "oral",
        });
    };

    const handleRemoveItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
            // Clean up drug search for removed item
            setDrugSearches((prev) => {
                const newSearches = { ...prev };
                delete newSearches[index];
                return newSearches;
            });
        }
    };

    const onSubmit = async (data: PrescriptionFormData) => {
        try {
            setIsSaving(true);
            setError(null);

            // Save all prescriptions sequentially
            for (const prescription of data.prescriptions) {
                await addPrescription({
                    medicalRecordId,
                    drugId: prescription.drugId,
                    dosage: prescription.dosage,
                    frequency: prescription.frequency,
                    duration: prescription.duration || undefined,
                    quantity: prescription.quantity,
                    instructions: prescription.instructions || undefined,
                    route: prescription.route || undefined,
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
                        <DialogTitle>Tambah Resep</DialogTitle>
                        <DialogDescription>
                            Tambahkan satu atau lebih resep obat untuk pasien
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Prescription Items */}
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4">
                                {index > 0 && <Separator />}

                                {/* Item Header */}
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Resep #{index + 1}</h4>
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

                                {/* Drug Search */}
                                <DrugSearch
                                    value={drugSearches[index] || ""}
                                    onChange={(value) =>
                                        setDrugSearches((prev) => ({ ...prev, [index]: value }))
                                    }
                                    onSelect={(drug) => handleDrugSelect(index, drug)}
                                    required
                                />
                                {form.formState.errors.prescriptions?.[index]?.drugId && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.prescriptions[index]?.drugId?.message}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Dosage */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`dosage-${index}`}>
                                            Dosis <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`dosage-${index}`}
                                            {...form.register(`prescriptions.${index}.dosage`)}
                                            placeholder="Contoh: 500mg, 1 tablet"
                                        />
                                        {form.formState.errors.prescriptions?.[index]?.dosage && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.prescriptions[index]?.dosage?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Frequency */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`frequency-${index}`}>
                                            Frekuensi <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`frequency-${index}`}
                                            {...form.register(`prescriptions.${index}.frequency`)}
                                            placeholder="Contoh: 3x sehari"
                                        />
                                        {form.formState.errors.prescriptions?.[index]?.frequency && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.prescriptions[index]?.frequency?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`duration-${index}`}>Durasi</Label>
                                        <Input
                                            id={`duration-${index}`}
                                            {...form.register(`prescriptions.${index}.duration`)}
                                            placeholder="Contoh: 7 hari"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`quantity-${index}`}>
                                            Jumlah <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`quantity-${index}`}
                                            type="number"
                                            min="1"
                                            {...form.register(`prescriptions.${index}.quantity`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {form.formState.errors.prescriptions?.[index]?.quantity && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.prescriptions[index]?.quantity?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Route */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor={`route-${index}`}>Rute Pemberian</Label>
                                        <Select
                                            value={form.watch(`prescriptions.${index}.route`)}
                                            onValueChange={(value) =>
                                                form.setValue(`prescriptions.${index}.route`, value)
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
                                    <Label htmlFor={`instructions-${index}`}>Instruksi Tambahan</Label>
                                    <Textarea
                                        id={`instructions-${index}`}
                                        {...form.register(`prescriptions.${index}.instructions`)}
                                        placeholder="Contoh: Diminum setelah makan"
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
                            Tambah Resep Lain
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
                                    Menyimpan {fields.length} Resep...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Simpan {fields.length} Resep
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
