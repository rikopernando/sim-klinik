/**
 * Add Prescription Dialog (Pharmacist)
 * Allows pharmacists to add prescriptions for urgent cases
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { getPharmacists, type Pharmacist } from "@/lib/services/pharmacist.service";
import axios from "axios";

interface Drug {
    id: number;
    name: string;
    genericName?: string | null;
    unit: string;
    price: string;
}

interface Doctor {
    id: string;
    name: string;
}

interface AddPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicalRecordId: number;
    doctor: Doctor | null;
    onSuccess: () => void;
}

interface FormData {
    drugId: string;
    dosage: string;
    frequency: string;
    quantity: string;
    instructions: string;
    route: string;
    addedByPharmacistId: string;
    pharmacistNote: string;
}

export function AddPrescriptionDialog({
    open,
    onOpenChange,
    medicalRecordId,
    doctor,
    onSuccess,
}: AddPrescriptionDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        drugId: "",
        dosage: "",
        frequency: "",
        quantity: "",
        instructions: "",
        route: "",
        addedByPharmacistId: "",
        pharmacistNote: "",
    });

    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);
    const [isLoadingPharmacists, setIsLoadingPharmacists] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Frequency options (same as in prescription form)
    const frequencyOptions = [
        { value: "1 x 1 Sebelum Makan", label: "1 x 1 Sebelum Makan" },
        { value: "1 x 1 Setelah Makan", label: "1 x 1 Setelah Makan" },
        { value: "2 x 1 Sebelum Makan", label: "2 x 1 Sebelum Makan" },
        { value: "2 x 1 Setelah Makan", label: "2 x 1 Setelah Makan" },
        { value: "3 x 1 Sebelum Makan", label: "3 x 1 Sebelum Makan" },
        { value: "3 x 1 Setelah Makan", label: "3 x 1 Setelah Makan" },
        { value: "4 x 1 Sebelum Makan", label: "4 x 1 Sebelum Makan" },
        { value: "4 x 1 Setelah Makan", label: "4 x 1 Setelah Makan" },
        { value: "Bila Perlu", label: "Bila Perlu" },
    ];

    // Load drugs and pharmacists when dialog opens
    useEffect(() => {
        if (open) {
            loadDrugs();
            loadPharmacists();
        }
    }, [open]);

    const loadDrugs = async () => {
        setIsLoadingDrugs(true);
        try {
            const response = await axios.get("/api/drugs");
            if (response.data.success) {
                setDrugs(response.data.data);
            }
        } catch (err) {
            console.error("Error loading drugs:", err);
        } finally {
            setIsLoadingDrugs(false);
        }
    };

    const loadPharmacists = async () => {
        setIsLoadingPharmacists(true);
        try {
            const pharmacistsList = await getPharmacists();
            setPharmacists(pharmacistsList);
        } catch (err) {
            console.error("Error loading pharmacists:", err);
        } finally {
            setIsLoadingPharmacists(false);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        // Validate required fields
        if (!formData.drugId) {
            setError("Obat wajib dipilih");
            return;
        }
        if (!formData.frequency) {
            setError("Frekuensi wajib dipilih");
            return;
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            setError("Jumlah wajib diisi dengan angka positif");
            return;
        }
        if (!formData.addedByPharmacistId) {
            setError("Petugas farmasi wajib dipilih");
            return;
        }
        if (!formData.pharmacistNote.trim()) {
            setError("Alasan penambahan resep wajib diisi");
            return;
        }
        if (!doctor) {
            setError("Dokter tidak ditemukan");
            return;
        }

        try {
            setIsSubmitting(true);

            await axios.post("/api/pharmacy/prescriptions/add", {
                medicalRecordId,
                drugId: parseInt(formData.drugId),
                dosage: formData.dosage || null,
                frequency: formData.frequency,
                quantity: parseInt(formData.quantity),
                instructions: formData.instructions || null,
                route: formData.route || null,
                addedByPharmacistId: formData.addedByPharmacistId,
                approvedBy: doctor.id, // Auto-approve by the medical record's doctor
                pharmacistNote: formData.pharmacistNote,
            });

            // Reset form
            setFormData({
                drugId: "",
                dosage: "",
                frequency: "",
                quantity: "",
                instructions: "",
                route: "",
                addedByPharmacistId: "",
                pharmacistNote: "",
            });

            onSuccess();
            onOpenChange(false);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error ||
                        err.response?.data?.message ||
                        "Gagal menambahkan resep"
                );
            } else {
                setError("Gagal menambahkan resep");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                drugId: "",
                dosage: "",
                frequency: "",
                quantity: "",
                instructions: "",
                route: "",
                addedByPharmacistId: "",
                pharmacistNote: "",
            });
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Resep (Farmasi)</DialogTitle>
                    <DialogDescription>
                        Tambahkan resep untuk kasus mendesak dengan persetujuan dokter.
                        {doctor && (
                            <span className="block mt-1 font-medium text-foreground">
                                Dokter: {doctor.name}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    {/* Drug Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="drugId">
                            Obat <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.drugId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, drugId: value })
                            }
                            disabled={isLoadingDrugs}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        isLoadingDrugs ? "Memuat obat..." : "Pilih obat"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {drugs.map((drug) => (
                                    <SelectItem key={drug.id} value={drug.id.toString()}>
                                        {drug.name}
                                        {drug.genericName && ` (${drug.genericName})`} - {drug.unit}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dosage (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="dosage">Dosis (Opsional)</Label>
                        <Input
                            id="dosage"
                            placeholder="e.g., 500mg"
                            value={formData.dosage}
                            onChange={(e) =>
                                setFormData({ ...formData, dosage: e.target.value })
                            }
                        />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                        <Label htmlFor="frequency">
                            Frekuensi <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.frequency}
                            onValueChange={(value) =>
                                setFormData({ ...formData, frequency: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih frekuensi" />
                            </SelectTrigger>
                            <SelectContent>
                                {frequencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            placeholder="Jumlah obat"
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, quantity: e.target.value })
                            }
                        />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instruksi (Opsional)</Label>
                        <Textarea
                            id="instructions"
                            placeholder="Instruksi tambahan untuk pasien..."
                            rows={2}
                            value={formData.instructions}
                            onChange={(e) =>
                                setFormData({ ...formData, instructions: e.target.value })
                            }
                        />
                    </div>

                    {/* Pharmacist */}
                    <div className="space-y-2">
                        <Label htmlFor="pharmacist">
                            Petugas Farmasi <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.addedByPharmacistId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, addedByPharmacistId: value })
                            }
                            disabled={isLoadingPharmacists}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        isLoadingPharmacists
                                            ? "Memuat farmasi..."
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

                    {/* Pharmacist Note (Required) */}
                    <div className="space-y-2">
                        <Label htmlFor="pharmacistNote">
                            Alasan Penambahan Resep <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="pharmacistNote"
                            placeholder="Jelaskan alasan menambahkan resep (e.g., urgensi, dokter tidak tersedia)..."
                            rows={3}
                            value={formData.pharmacistNote}
                            onChange={(e) =>
                                setFormData({ ...formData, pharmacistNote: e.target.value })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Catatan ini akan dikirimkan ke dokter untuk persetujuan
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menambahkan...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Resep
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
