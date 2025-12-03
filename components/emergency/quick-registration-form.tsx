"use client"

/**
 * Quick ER Registration Form
 * Minimal registration form for emergency cases
 */

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

// Hooks & Utils
import { useQuickRegistration } from "@/hooks/use-quick-registration"
import { TRIAGE_CONFIG } from "@/lib/emergency/triage-utils"
import { TriageStatus } from "@/types/emergency"

/**
 * Form Schema
 */
const formSchema = z.object({
  name: z.string().min(1, "Nama pasien wajib diisi"),
  chiefComplaint: z.string().min(1, "Keluhan utama wajib diisi"),
  triageStatus: z.enum(["red", "yellow", "green"], {
    required_error: "Status triage wajib dipilih",
  }),
  nik: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface QuickRegistrationFormProps {
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

export function QuickRegistrationForm({ onSuccess, onCancel }: QuickRegistrationFormProps) {
  // Use quick registration hook
  const {
    register: registerPatient,
    isSubmitting,
    error,
    success,
  } = useQuickRegistration(onSuccess)

  // Form hook
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const triageStatus = watch("triageStatus")

  /**
   * Submit handler
   */
  const onSubmit = async (data: FormData) => {
    await registerPatient(data)
    reset()
  }

  /**
   * Get triage select option class
   */
  const getTriageSelectClass = (status: TriageStatus | undefined) => {
    if (!status) return ""
    const config = TRIAGE_CONFIG[status]
    return `${config.bgColor} ${config.borderColor} ${config.textColor}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Pendaftaran Cepat UGD</h2>
        <p className="text-muted-foreground text-sm">
          Form pendaftaran minimal untuk kasus gawat darurat. Data lengkap dapat dilengkapi setelah
          kondisi pasien stabil.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Pasien UGD berhasil didaftarkan! Silakan lanjutkan ke pemeriksaan.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Patient Data */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Data Pasien (Minimal)</h3>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Pasien <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Masukkan nama pasien"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK (Opsional)</Label>
              <Input id="nik" {...register("nik")} placeholder="16 digit NIK" maxLength={16} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon (Opsional)</Label>
              <Input id="phone" {...register("phone")} placeholder="Nomor telepon" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin (Opsional)</Label>
            <Select onValueChange={(value) => setValue("gender", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section 2: Triage & Chief Complaint */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Triage & Keluhan Utama</h3>

          <div className="space-y-2">
            <Label htmlFor="triageStatus">
              Status Triage <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("triageStatus", value as TriageStatus)}>
              <SelectTrigger
                className={`${triageStatus ? getTriageSelectClass(triageStatus) : ""} ${errors.triageStatus ? "border-destructive" : ""}`}
              >
                <SelectValue placeholder="Pilih status triage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red" className="bg-red-100 font-semibold text-red-700">
                  🔴 MERAH - Gawat Darurat (Immediate)
                </SelectItem>
                <SelectItem value="yellow" className="bg-yellow-100 font-semibold text-yellow-700">
                  🟡 KUNING - Urgent
                </SelectItem>
                <SelectItem value="green" className="bg-green-100 font-semibold text-green-700">
                  🟢 HIJAU - Non-Urgent
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.triageStatus && (
              <p className="text-destructive text-sm">{errors.triageStatus.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">
              Keluhan Utama <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="chiefComplaint"
              {...register("chiefComplaint")}
              placeholder="Jelaskan keluhan atau kondisi pasien saat ini..."
              rows={4}
              className={errors.chiefComplaint ? "border-destructive" : ""}
            />
            {errors.chiefComplaint && (
              <p className="text-destructive text-sm">{errors.chiefComplaint.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Catatan tambahan dari triage..."
              rows={2}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? "Mendaftarkan..." : "Daftarkan Pasien UGD"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
