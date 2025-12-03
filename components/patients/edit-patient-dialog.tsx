"use client"

/**
 * Edit Patient Dialog Component (B.6)
 * Allows updating patient information
 */

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

/**
 * Patient Update Schema
 */
const patientUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  nik: z.string().length(16, "NIK harus 16 digit").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  insuranceType: z.string().optional(),
  insuranceNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().max(20).optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
})

type PatientUpdateData = z.infer<typeof patientUpdateSchema>

interface EditPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: number
  initialData?: Partial<PatientUpdateData>
  onSuccess?: () => void
}

export function EditPatientDialog({
  open,
  onOpenChange,
  patientId,
  initialData,
  onSuccess,
}: EditPatientDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PatientUpdateData>({
    resolver: zodResolver(patientUpdateSchema),
    defaultValues: initialData,
  })

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && initialData) {
      reset(initialData)
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: PatientUpdateData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: patientId,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui data pasien")
      }

      toast({
        title: "Berhasil",
        description: "Data pasien berhasil diperbarui",
      })

      // Close dialog
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Update patient error:", error)
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Pasien</DialogTitle>
          <DialogDescription>
            Perbarui informasi pasien. Pastikan data yang dimasukkan akurat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informasi Pribadi</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-destructive mt-1 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* NIK */}
              <div>
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  {...register("nik")}
                  maxLength={16}
                  placeholder="16 digit"
                  className={errors.nik ? "border-destructive" : ""}
                />
                {errors.nik && (
                  <p className="text-destructive mt-1 text-sm">{errors.nik.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("gender", value as "male" | "female" | "other")
                  }
                  defaultValue={initialData?.gender}
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

              {/* Blood Type */}
              <div>
                <Label htmlFor="bloodType">Golongan Darah</Label>
                <Select
                  onValueChange={(value) => setValue("bloodType", value)}
                  defaultValue={initialData?.bloodType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan darah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informasi Kontak</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" {...register("phone")} placeholder="08xxxxxxxxxx" />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-destructive mt-1 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="col-span-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  rows={3}
                  placeholder="Jalan, Kelurahan, Kecamatan, Kota, Provinsi"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informasi Jaminan</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Insurance Type */}
              <div>
                <Label htmlFor="insuranceType">Jenis Jaminan</Label>
                <Select
                  onValueChange={(value) => setValue("insuranceType", value)}
                  defaultValue={initialData?.insuranceType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis jaminan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bpjs">BPJS</SelectItem>
                    <SelectItem value="insurance">Asuransi Swasta</SelectItem>
                    <SelectItem value="general">Umum/Mandiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Insurance Number */}
              <div>
                <Label htmlFor="insuranceNumber">Nomor Jaminan</Label>
                <Input
                  id="insuranceNumber"
                  {...register("insuranceNumber")}
                  placeholder="Nomor BPJS/Asuransi"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kontak Darurat</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Emergency Contact Name */}
              <div>
                <Label htmlFor="emergencyContact">Nama Kontak Darurat</Label>
                <Input
                  id="emergencyContact"
                  {...register("emergencyContact")}
                  placeholder="Nama keluarga/kerabat"
                />
              </div>

              {/* Emergency Phone */}
              <div>
                <Label htmlFor="emergencyPhone">Nomor Telepon Darurat</Label>
                <Input
                  id="emergencyPhone"
                  {...register("emergencyPhone")}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informasi Medis</h3>

            <div>
              <Label htmlFor="allergies">Alergi</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                rows={2}
                placeholder="Alergi obat, makanan, dll. (jika ada)"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
