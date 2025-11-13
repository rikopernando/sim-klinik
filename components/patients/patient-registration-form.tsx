"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Validation schema
const patientFormSchema = z.object({
    // Step 1: Basic Information
    nik: z
        .string()
        .length(16, "NIK harus 16 digit")
        .regex(/^\d+$/, "NIK hanya boleh angka")
        .optional()
        .or(z.literal("")),
    name: z.string().min(2, "Nama minimal 2 karakter").max(255),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    bloodType: z.string().optional(),

    // Step 2: Contact & Insurance
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    emergencyContact: z.string().max(255).optional(),
    emergencyPhone: z.string().max(20).optional(),
    insuranceType: z.string().optional(),
    insuranceNumber: z.string().max(50).optional(),
    allergies: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientData {
    id: number;
    mrNumber: string;
    name: string;
    nik: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    insuranceType: string | null;
}

interface PatientRegistrationFormProps {
    onSuccess?: (patient: PatientData) => void;
    onCancel?: () => void;
}

export function PatientRegistrationForm({
    onSuccess,
    onCancel,
}: PatientRegistrationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PatientFormData>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            nik: "",
            name: "",
            dateOfBirth: "",
            gender: undefined,
            bloodType: "",
            phone: "",
            address: "",
            email: "",
            emergencyContact: "",
            emergencyPhone: "",
            insuranceType: "",
            insuranceNumber: "",
            allergies: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = form;

    // Watch fields for step 1 validation
    const step1Fields = watch(["name"]);
    const isStep1Valid = step1Fields[0]?.length >= 2;

    const onSubmit = async (data: PatientFormData) => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Gagal mendaftarkan pasien");
            }

            const result = await response.json();
            onSuccess?.(result.data);
        } catch (error) {
            console.error("Registration error:", error);
            alert(error instanceof Error ? error.message : "Gagal mendaftarkan pasien");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (isStep1Valid) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                            currentStep >= 1
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground text-muted-foreground"
                        )}
                    >
                        {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                    </div>
                    <span className="text-sm font-medium">Data Utama</span>
                </div>
                <div className="h-0.5 w-12 bg-border" />
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                            currentStep === 2
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground text-muted-foreground"
                        )}
                    >
                        2
                    </div>
                    <span className="text-sm font-medium">Kontak & Jaminan</span>
                </div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Data Utama Pasien</CardTitle>
                        <CardDescription>
                            Masukkan informasi dasar pasien. Nama wajib diisi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama Lengkap <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Masukkan nama lengkap"
                                className={errors.name ? "border-destructive" : ""}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nik">NIK (16 digit)</Label>
                                <Input
                                    id="nik"
                                    {...register("nik")}
                                    placeholder="3201234567890123"
                                    maxLength={16}
                                    className={errors.nik ? "border-destructive" : ""}
                                />
                                {errors.nik && (
                                    <p className="text-sm text-destructive">{errors.nik.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Jenis Kelamin</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue("gender", value as "male" | "female" | "other")
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Laki-laki</SelectItem>
                                        <SelectItem value="female">Perempuan</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bloodType">Golongan Darah</Label>
                                <Select onValueChange={(value) => setValue("bloodType", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih golongan darah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Contact & Insurance */}
            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Kontak & Jaminan</CardTitle>
                        <CardDescription>
                            Informasi kontak dan data jaminan kesehatan (opsional).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    {...register("phone")}
                                    placeholder="081234567890"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="email@example.com"
                                    className={errors.email ? "border-destructive" : ""}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                {...register("address")}
                                placeholder="Masukkan alamat lengkap"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact">Kontak Darurat</Label>
                                <Input
                                    id="emergencyContact"
                                    {...register("emergencyContact")}
                                    placeholder="Nama kontak darurat"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergencyPhone">No. Telp Darurat</Label>
                                <Input
                                    id="emergencyPhone"
                                    {...register("emergencyPhone")}
                                    placeholder="081234567890"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="insuranceType">Jenis Jaminan</Label>
                                <Select
                                    onValueChange={(value) => setValue("insuranceType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis jaminan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BPJS">BPJS Kesehatan</SelectItem>
                                        <SelectItem value="Asuransi Swasta">
                                            Asuransi Swasta
                                        </SelectItem>
                                        <SelectItem value="Umum">Umum (Cash)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="insuranceNumber">Nomor Jaminan</Label>
                                <Input
                                    id="insuranceNumber"
                                    {...register("insuranceNumber")}
                                    placeholder="Nomor kartu BPJS/asuransi"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies">Alergi</Label>
                            <Textarea
                                id="allergies"
                                {...register("allergies")}
                                placeholder="Sebutkan alergi obat atau makanan (jika ada)"
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <div>
                    {currentStep === 2 && (
                        <Button type="button" variant="outline" onClick={handleBack}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    )}
                    {currentStep === 1 && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    {currentStep === 1 && (
                        <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!isStep1Valid}
                        >
                            Selanjutnya
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {currentStep === 2 && (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Daftar Pasien
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
