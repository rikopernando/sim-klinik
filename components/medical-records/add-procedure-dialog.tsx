"use client";

import { useState, useEffect } from "react";
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

const INITIAL_FORM_STATE = {
    icd9Code: "",
    description: "",
    performedBy: "",
    notes: "",
};

export function AddProcedureDialog({
    open,
    onOpenChange,
    medicalRecordId,
    onSuccess,
}: AddProcedureDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

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
        setFormData(INITIAL_FORM_STATE);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                        <DialogTitle>Tambah Tindakan</DialogTitle>
                        <DialogDescription>
                            Tambahkan tindakan medis yang dilakukan berdasarkan kode ICD-9
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
                                <Select
                                    value={formData.performedBy}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, performedBy: value }))
                                    }
                                    disabled={loadingStaff}
                                >
                                    <SelectTrigger className="w-full" id="performedBy">
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
                                    Simpan Tindakan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
