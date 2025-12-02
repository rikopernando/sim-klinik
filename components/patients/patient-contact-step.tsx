/**
 * Patient Contact Step Component
 * Step 2: Contact information and insurance details
 */

import { Control, FieldErrors, UseFormRegister, Controller } from "react-hook-form";

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
import { FormField } from "@/components/ui/form-field";

import { type PatientFormData } from "@/lib/validations/registration";
import { INSURANCE_TYPES } from "@/types/registration";

interface PatientContactStepProps {
    register: UseFormRegister<PatientFormData>;
    control: Control<PatientFormData>;
    errors: FieldErrors<PatientFormData>;
    insuranceType?: string;
}

export function PatientContactStep({
    register,
    control,
    errors,
    insuranceType,
}: PatientContactStepProps) {
    return (
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
                            inputMode="numeric"
                            {...register("phone")}
                            placeholder="081234567890"
                            onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                e.target.value = value;
                                register("phone").onChange(e);
                            }}
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

                    {/* Address */}
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
                        <Label htmlFor="emergencyContact">Wali/Penanggung Jawab</Label>
                        <Input
                            id="emergencyContact"
                            {...register("emergencyContact")}
                            placeholder="Nama wali/penanggung jawab"
                        />
                    </div>

                    {/* Emergency Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">No. Telp Wali/Penanggung Jawab</Label>
                        <Input
                            id="emergencyPhone"
                            {...register("emergencyPhone")}
                            placeholder="081234567890"
                            onKeyPress={(e) => {
                                if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                e.target.value = value;
                                register("emergencyPhone").onChange(e);
                            }}
                        />
                    </div>

                    {/* Insurance Type */}
                    <FormField label="Jenis Jaminan" htmlFor="insuranceType">
                        <Controller
                            name="insuranceType"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full">
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

                    {/* Allergies */}
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
    );
}
