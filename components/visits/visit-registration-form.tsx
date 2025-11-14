"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, Check, Stethoscope, Bed, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { visitFormSchema, type VisitFormData } from "@/lib/validations/registration";
import { type Patient, type RegisteredVisit, type Poli, TRIAGE_STATUS } from "@/types/registration";

interface VisitRegistrationFormProps {
    patient: Patient;
    onSuccess?: (visit: RegisteredVisit) => void;
    onCancel?: () => void;
}

export function VisitRegistrationForm({
    patient,
    onSuccess,
    onCancel,
}: VisitRegistrationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        formState: { errors },
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
        setErrorMessage(null);

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

            const response = await axios.post("/api/visits", payload);
            onSuccess?.(response.data.data);
        } catch (error) {
            console.error("Visit registration error:", error);

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.details) {
                    // Handle validation errors
                    const validationErrors = error.response.data.details
                        .map((err: { message: string }) => err.message)
                        .join(", ");
                    setErrorMessage(`Validasi gagal: ${validationErrors}`);
                } else {
                    // Handle other API errors
                    setErrorMessage(
                        error.response?.data?.error || "Gagal mendaftarkan kunjungan. Silakan coba lagi."
                    );
                }
            } else {
                // Handle non-Axios errors
                setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
            }
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
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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

            {/* Error Alert */}
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

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
                                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
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
                                        <SelectTrigger className={errors.poliId ? "w-full border-destructive" : "w-full"}>
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
                                    {errors.poliId && (
                                        <p className="text-sm text-destructive">{errors.poliId.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Emergency Fields */}
                        {visitType === "emergency" && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="chiefComplaint">
                                        Keluhan Utama <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="chiefComplaint"
                                        {...register("chiefComplaint")}
                                        placeholder="Jelaskan keluhan atau gejala yang dialami"
                                        rows={3}
                                        className={errors.chiefComplaint ? "border-destructive" : ""}
                                    />
                                    {errors.chiefComplaint && (
                                        <p className="text-sm text-destructive">
                                            {errors.chiefComplaint.message}
                                        </p>
                                    )}
                                </div>

                                <FormField label="Status Triage" htmlFor="triageStatus">
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("triageStatus", value as "red" | "yellow" | "green")
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tingkat kegawatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TRIAGE_STATUS.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    <span className="flex items-center gap-2">
                                                        <Badge className={status.color}>{status.label}</Badge>
                                                        {status.description}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
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
                                        <SelectTrigger className={errors.roomId ? "w-full border-destructive" : "w-full"}>
                                            <SelectValue placeholder="Pilih kamar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Kamar VIP 101</SelectItem>
                                            <SelectItem value="2">Kamar Kelas 1 - 201</SelectItem>
                                            <SelectItem value="3">Kamar Kelas 2 - 301</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.roomId && (
                                        <p className="text-sm text-destructive">{errors.roomId.message}</p>
                                    )}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
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
