"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { format } from "date-fns";
import { Loader2, ChevronRight, ChevronLeft, Check, CalendarIcon, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

import { patientFormSchema, type PatientFormData } from "@/lib/validations/registration";
import { type RegisteredPatient, BLOOD_TYPES, INSURANCE_TYPES } from "@/types/registration";

interface PatientRegistrationFormProps {
    onSuccess?: (patient: RegisteredPatient) => void;
    onCancel?: () => void;
}

export function PatientRegistrationForm({
    onSuccess,
    onCancel,
}: PatientRegistrationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<PatientFormData>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            nik: "",
            name: "",
            dateOfBirth: undefined,
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
        control,
        watch,
        trigger,
        formState: { errors },
    } = form;

    // Watch fields for step 1 validation
    const [name, nik, gender] = watch(["name", "nik", "gender"]);
    const isStep1Valid = name?.length >= 2 && nik?.length === 16 && gender !== undefined;

    // Watch insurance type to conditionally require insurance number
    const insuranceType = watch("insuranceType");

    const onSubmit = async (data: PatientFormData) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            // Convert Date to ISO string for API
            const payload = {
                ...data,
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
            };

            const response = await axios.post("/api/patients", payload);
            onSuccess?.(response.data.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle validation errors from API
                if (error.response?.data?.details) {
                    const validationErrors = error.response.data.details
                        .map((err: { message: string }) => err.message)
                        .join(", ");
                    setErrorMessage(`Validasi gagal: ${validationErrors}`);
                } else {
                    setErrorMessage(
                        error.response?.data?.error || "Gagal mendaftarkan pasien. Silakan coba lagi."
                    );
                }
            } else {
                setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
            }
            console.error("Registration error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        // Validate step 1 fields before proceeding
        const isValid = await trigger(["name", "nik", "gender"]);
        if (isValid) {
            setCurrentStep(2);
            setErrorMessage(null);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setErrorMessage(null);
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

            {/* Error Alert */}
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Data Utama Pasien</CardTitle>
                        <CardDescription>
                            Masukkan informasi dasar pasien. Nama, NIK, dan jenis kelamin wajib diisi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Name */}
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

                            {/* NIK - Required */}
                            <div className="space-y-2">
                                <Label htmlFor="nik">
                                    NIK (16 digit) <span className="text-destructive">*</span>
                                </Label>
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

                            {/* Gender - Radio Buttons */}
                            <div className="space-y-3">
                                <Label>
                                    Jenis Kelamin <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="male" id="male" />
                                                <Label htmlFor="male" className="cursor-pointer font-normal">
                                                    Laki-laki
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="female" id="female" />
                                                <Label htmlFor="female" className="cursor-pointer font-normal">
                                                    Perempuan
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                                {errors.gender && (
                                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                                )}
                            </div>

                            {/* Date of Birth - Calendar Component */}
                            <div className="space-y-2">
                            <Label>Tanggal Lahir</Label>
                            <Controller
                                name="dateOfBirth"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "dd MMMM yyyy")
                                                ) : (
                                                    <span>Pilih tanggal lahir</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                captionLayout="dropdown"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                                initialFocus
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            </div>

                            {/* Blood Type */}
                            <FormField label="Golongan Darah" htmlFor="bloodType">
                                <Controller
                                    name="bloodType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih golongan darah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BLOOD_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
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
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    {...register("phone")}
                                    placeholder="081234567890"
                                />
                            </div>

                            {/* Email */}
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
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Address - Span 2 columns */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    {...register("address")}
                                    placeholder="Masukkan alamat lengkap"
                                    rows={3}
                                />
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact">Kontak Darurat</Label>
                                <Input
                                    id="emergencyContact"
                                    {...register("emergencyContact")}
                                    placeholder="Nama kontak darurat"
                                />
                            </div>

                            {/* Emergency Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="emergencyPhone">No. Telp Darurat</Label>
                                <Input
                                    id="emergencyPhone"
                                    {...register("emergencyPhone")}
                                    placeholder="081234567890"
                                />
                            </div>

                            {/* Insurance Type */}
                            <FormField label="Jenis Jaminan" htmlFor="insuranceType">
                                <Controller
                                    name="insuranceType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis jaminan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INSURANCE_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            {/* Insurance Number */}
                            <div className="space-y-2">
                                <Label htmlFor="insuranceNumber">
                                    Nomor Jaminan
                                    {insuranceType && insuranceType !== "Umum" && (
                                        <span className="text-destructive"> *</span>
                                    )}
                                </Label>
                                <Input
                                    id="insuranceNumber"
                                    {...register("insuranceNumber")}
                                    placeholder="Nomor kartu BPJS/asuransi"
                                    className={errors.insuranceNumber ? "border-destructive" : ""}
                                />
                                {errors.insuranceNumber && (
                                    <p className="text-sm text-destructive">
                                        {errors.insuranceNumber.message}
                                    </p>
                                )}
                            </div>

                            {/* Allergies - Span 2 columns */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="allergies">Alergi</Label>
                                <Textarea
                                    id="allergies"
                                    {...register("allergies")}
                                    placeholder="Sebutkan alergi obat atau makanan (jika ada)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                    {currentStep === 2 && (
                        <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    )}
                    {currentStep === 1 && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
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
                            className="w-full sm:w-auto"
                        >
                            Selanjutnya
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {currentStep === 2 && (
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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
