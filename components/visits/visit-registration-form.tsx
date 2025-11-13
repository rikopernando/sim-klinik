"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Stethoscope, Bed, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const visitFormSchema = z.object({
    visitType: z.enum(["outpatient", "inpatient", "emergency"]),
    poliId: z.string().optional(),
    doctorId: z.string().optional(),
    triageStatus: z.enum(["red", "yellow", "green"]).optional(),
    chiefComplaint: z.string().optional(),
    roomId: z.string().optional(),
    notes: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitFormSchema>;

interface Patient {
    id: number;
    mrNumber: string;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    insuranceType: string | null;
}

interface VisitData {
    visit: {
        id: number;
        visitNumber: string;
        queueNumber?: string;
        visitType: string;
        arrivalTime: string;
    };
    patient: {
        id: number;
        mrNumber: string;
        name: string;
    };
}

interface VisitRegistrationFormProps {
    patient: Patient;
    onSuccess?: (visit: VisitData) => void;
    onCancel?: () => void;
}

export function VisitRegistrationForm({
    patient,
    onSuccess,
    onCancel,
}: VisitRegistrationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [polis, setPolis] = useState<Array<{ id: number; name: string; code: string }>>([]);

    const form = useForm<VisitFormData>({
        resolver: zodResolver(visitFormSchema),
        defaultValues: {
            visitType: "outpatient",
            poliId: "",
            doctorId: "",
            triageStatus: undefined,
            chiefComplaint: "",
            roomId: "",
            notes: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
    } = form;

    const visitType = watch("visitType");

    // Fetch polis/departments (placeholder - will implement API later)
    useEffect(() => {
        // TODO: Fetch from API
        setPolis([
            { id: 1, name: "Poli Umum", code: "PU" },
            { id: 2, name: "Poli Gigi", code: "PG" },
            { id: 3, name: "Poli Anak", code: "PA" },
            { id: 4, name: "Poli Kebidanan", code: "PKB" },
        ]);
    }, []);

    const onSubmit = async (data: VisitFormData) => {
        setIsSubmitting(true);

        try {
            const payload = {
                patientId: patient.id,
                visitType: data.visitType,
                poliId: data.poliId ? parseInt(data.poliId) : undefined,
                doctorId: data.doctorId || undefined,
                triageStatus: data.triageStatus,
                chiefComplaint: data.chiefComplaint,
                roomId: data.roomId ? parseInt(data.roomId) : undefined,
                notes: data.notes,
            };

            const response = await fetch("/api/visits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal mendaftarkan kunjungan");
            }

            const result = await response.json();
            onSuccess?.(result.data);
        } catch (error) {
            console.error("Visit registration error:", error);
            alert(error instanceof Error ? error.message : "Gagal mendaftarkan kunjungan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateAge = (dateOfBirth: string | null) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age;
    };

    return (
        <div className="space-y-6">
            {/* Patient Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pasien</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Nama:</span> {patient.name}
                        </div>
                        <div>
                            <span className="font-medium">No. RM:</span> {patient.mrNumber}
                        </div>
                        <div>
                            <span className="font-medium">Usia:</span>{" "}
                            {patient.dateOfBirth
                                ? `${calculateAge(patient.dateOfBirth)} tahun`
                                : "-"}
                        </div>
                        <div>
                            <span className="font-medium">Jaminan:</span>{" "}
                            {patient.insuranceType || "Umum"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Visit Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Registrasi Kunjungan</CardTitle>
                        <CardDescription>
                            Pilih jenis kunjungan dan lengkapi informasi yang diperlukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Visit Type Selection */}
                        <div className="space-y-3">
                            <Label>Jenis Kunjungan</Label>
                            <RadioGroup
                                value={visitType}
                                onValueChange={(value) =>
                                    setValue(
                                        "visitType",
                                        value as "outpatient" | "inpatient" | "emergency"
                                    )
                                }
                                className="grid grid-cols-3 gap-4"
                            >
                                <Label
                                    htmlFor="outpatient"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem
                                        value="outpatient"
                                        id="outpatient"
                                        className="sr-only"
                                    />
                                    <Stethoscope className="mb-3 h-6 w-6" />
                                    <span className="text-center font-medium">Rawat Jalan</span>
                                </Label>

                                <Label
                                    htmlFor="inpatient"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem
                                        value="inpatient"
                                        id="inpatient"
                                        className="sr-only"
                                    />
                                    <Bed className="mb-3 h-6 w-6" />
                                    <span className="text-center font-medium">Rawat Inap</span>
                                </Label>

                                <Label
                                    htmlFor="emergency"
                                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                >
                                    <RadioGroupItem
                                        value="emergency"
                                        id="emergency"
                                        className="sr-only"
                                    />
                                    <AlertCircle className="mb-3 h-6 w-6" />
                                    <span className="text-center font-medium">UGD</span>
                                </Label>
                            </RadioGroup>
                        </div>

                        {/* Outpatient Fields */}
                        {visitType === "outpatient" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="poliId">
                                        Poli/Poliklinik <span className="text-destructive">*</span>
                                    </Label>
                                    <Select onValueChange={(value) => setValue("poliId", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih poli tujuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {polis.map((poli) => (
                                                <SelectItem key={poli.id} value={poli.id.toString()}>
                                                    {poli.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Emergency Fields */}
                        {visitType === "emergency" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="chiefComplaint">
                                        Keluhan Utama <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="chiefComplaint"
                                        {...register("chiefComplaint")}
                                        placeholder="Jelaskan keluhan atau gejala yang dialami"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="triageStatus">Status Triage</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("triageStatus", value as "red" | "yellow" | "green")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tingkat kegawatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="red">
                                                <span className="flex items-center gap-2">
                                                    <Badge className="bg-red-500">Merah</Badge>
                                                    Gawat Darurat
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="yellow">
                                                <span className="flex items-center gap-2">
                                                    <Badge className="bg-yellow-500">Kuning</Badge>
                                                    Mendesak
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="green">
                                                <span className="flex items-center gap-2">
                                                    <Badge className="bg-green-500">Hijau</Badge>
                                                    Tidak Mendesak
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Inpatient Fields */}
                        {visitType === "inpatient" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="roomId">
                                        Kamar <span className="text-destructive">*</span>
                                    </Label>
                                    <Select onValueChange={(value) => setValue("roomId", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kamar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Kamar VIP 101</SelectItem>
                                            <SelectItem value="2">Kamar Kelas 1 - 201</SelectItem>
                                            <SelectItem value="3">Kamar Kelas 2 - 301</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Common Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan</Label>
                            <Textarea
                                id="notes"
                                {...register("notes")}
                                placeholder="Catatan tambahan (opsional)"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Batal
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mendaftar...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Daftar Kunjungan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
