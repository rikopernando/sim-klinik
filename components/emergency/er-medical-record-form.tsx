"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Save, Lock } from "lucide-react"

/**
 * ER Medical Record Form Schema
 * Focused on quick emergency documentation
 */
const erMedicalRecordSchema = z.object({
  // Brief History
  briefHistory: z.string().min(1, "Riwayat singkat wajib diisi"),

  // Vital Signs (important for ER)
  temperature: z.string().optional(),
  bloodPressure: z.string().optional(),
  pulse: z.string().optional(),
  respiration: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  consciousness: z.string().optional(),

  // Physical Examination (targeted)
  physicalExam: z.string().min(1, "Pemeriksaan fisik wajib diisi"),

  // Emergency Actions Taken
  emergencyActions: z.string().min(1, "Tindakan darurat wajib diisi"),

  // Working Diagnosis
  workingDiagnosis: z.string().min(1, "Diagnosis kerja wajib diisi"),

  // Disposition (where patient goes next)
  disposition: z.enum(["discharged", "admitted", "referred", "observation"], {
    required_error: "Disposisi wajib dipilih",
  }),

  // Follow-up instructions
  instructions: z.string().optional(),

  // Notes
  notes: z.string().optional(),
})

type ERMedicalRecordData = z.infer<typeof erMedicalRecordSchema>

interface ERMedicalRecordFormProps {
  visitId: number
  patientName: string
  triageStatus: string
  onSave?: (isDraft: boolean) => void
}

export function ERMedicalRecordForm({
  visitId,
  patientName,
  triageStatus,
  onSave,
}: ERMedicalRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ERMedicalRecordData>({
    resolver: zodResolver(erMedicalRecordSchema),
  })

  const disposition = watch("disposition")

  const getTriageBadgeColor = (status: string) => {
    switch (status) {
      case "red":
        return "bg-red-600 text-white"
      case "yellow":
        return "bg-yellow-500 text-white"
      case "green":
        return "bg-green-600 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const onSubmit = async (data: ERMedicalRecordData, isDraft: boolean) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create medical record
      const medicalRecordResponse = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitId,
          soapSubjective: data.briefHistory,
          soapObjective: `Vital Signs:\n- Suhu: ${data.temperature || "-"}\n- TD: ${data.bloodPressure || "-"}\n- Nadi: ${data.pulse || "-"}\n- RR: ${data.respiration || "-"}\n- SpO2: ${data.oxygenSaturation || "-"}\n- Kesadaran: ${data.consciousness || "-"}\n\nPemeriksaan Fisik:\n${data.physicalExam}`,
          soapAssessment: data.workingDiagnosis,
          soapPlan: `Tindakan Darurat:\n${data.emergencyActions}\n\n${data.instructions ? `Instruksi Lanjutan:\n${data.instructions}` : ""}`,
          isLocked: !isDraft,
        }),
      })

      const medicalRecordResult = await medicalRecordResponse.json()

      if (!medicalRecordResponse.ok) {
        throw new Error(medicalRecordResult.error || "Gagal menyimpan rekam medis")
      }

      // Update visit with disposition
      const visitResponse = await fetch("/api/visits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: visitId,
          disposition: data.disposition,
          status: isDraft ? "in_progress" : "completed",
          endTime: !isDraft ? new Date().toISOString() : undefined,
        }),
      })

      const visitResult = await visitResponse.json()

      if (!visitResponse.ok) {
        throw new Error(visitResult.error || "Gagal mengupdate kunjungan")
      }

      setSuccess(true)
      if (!isDraft) {
        setIsLocked(true)
      }

      if (onSave) {
        onSave(isDraft)
      }

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RME Unit Gawat Darurat</h2>
          <p className="text-muted-foreground text-sm">
            Pasien: <span className="font-medium">{patientName}</span>
          </p>
        </div>
        <Badge className={getTriageBadgeColor(triageStatus)}>
          {triageStatus === "red"
            ? "🔴 MERAH"
            : triageStatus === "yellow"
              ? "🟡 KUNING"
              : "🟢 HIJAU"}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Rekam medis UGD berhasil disimpan!</AlertDescription>
        </Alert>
      )}

      <form className="space-y-6">
        {/* Section 1: Brief History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Singkat & Keluhan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="briefHistory">
                Riwayat Singkat <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="briefHistory"
                {...register("briefHistory")}
                placeholder="Keluhan utama, onset, riwayat trauma/kecelakaan, dll..."
                rows={4}
                disabled={isLocked}
                className={errors.briefHistory ? "border-destructive" : ""}
              />
              {errors.briefHistory && (
                <p className="text-destructive text-sm">{errors.briefHistory.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle>Tanda-Tanda Vital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">Suhu (°C)</Label>
                <Input
                  id="temperature"
                  {...register("temperature")}
                  placeholder="36.5"
                  disabled={isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Tekanan Darah (mmHg)</Label>
                <Input
                  id="bloodPressure"
                  {...register("bloodPressure")}
                  placeholder="120/80"
                  disabled={isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pulse">Nadi (x/menit)</Label>
                <Input id="pulse" {...register("pulse")} placeholder="80" disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiration">Respirasi (x/menit)</Label>
                <Input
                  id="respiration"
                  {...register("respiration")}
                  placeholder="20"
                  disabled={isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">Saturasi O₂ (%)</Label>
                <Input
                  id="oxygenSaturation"
                  {...register("oxygenSaturation")}
                  placeholder="98"
                  disabled={isLocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consciousness">Kesadaran</Label>
                <Input
                  id="consciousness"
                  {...register("consciousness")}
                  placeholder="Compos Mentis"
                  disabled={isLocked}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Physical Examination */}
        <Card>
          <CardHeader>
            <CardTitle>Pemeriksaan Fisik Terarah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="physicalExam">
                Hasil Pemeriksaan Fisik <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="physicalExam"
                {...register("physicalExam")}
                placeholder="Fokus pada area yang relevan dengan keluhan..."
                rows={4}
                disabled={isLocked}
                className={errors.physicalExam ? "border-destructive" : ""}
              />
              {errors.physicalExam && (
                <p className="text-destructive text-sm">{errors.physicalExam.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Emergency Actions & Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle>Tindakan & Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyActions">
                Tindakan Darurat yang Dilakukan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="emergencyActions"
                {...register("emergencyActions")}
                placeholder="Contoh: Pemasangan infus, oksigenasi, jahitan luka, dll..."
                rows={3}
                disabled={isLocked}
                className={errors.emergencyActions ? "border-destructive" : ""}
              />
              {errors.emergencyActions && (
                <p className="text-destructive text-sm">{errors.emergencyActions.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingDiagnosis">
                Diagnosis Kerja <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="workingDiagnosis"
                {...register("workingDiagnosis")}
                placeholder="Diagnosis berdasarkan pemeriksaan..."
                rows={2}
                disabled={isLocked}
                className={errors.workingDiagnosis ? "border-destructive" : ""}
              />
              {errors.workingDiagnosis && (
                <p className="text-destructive text-sm">{errors.workingDiagnosis.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Disposition */}
        <Card>
          <CardHeader>
            <CardTitle>Disposisi (Keputusan Akhir)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disposition">
                Disposisi Pasien <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "disposition",
                    value as "discharged" | "admitted" | "referred" | "observation"
                  )
                }
                disabled={isLocked}
              >
                <SelectTrigger className={errors.disposition ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih disposisi pasien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discharged">🏠 Pulang (Boleh Pulang)</SelectItem>
                  <SelectItem value="admitted">🏥 Rawat Inap (Admission)</SelectItem>
                  <SelectItem value="referred">🚑 Rujuk ke RS Lain</SelectItem>
                  <SelectItem value="observation">👁️ Observasi (Ruang Observasi UGD)</SelectItem>
                </SelectContent>
              </Select>
              {errors.disposition && (
                <p className="text-destructive text-sm">{errors.disposition.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruksi Lanjutan</Label>
              <Textarea
                id="instructions"
                {...register("instructions")}
                placeholder="Instruksi untuk pasien/keluarga, resep pulang, jadwal kontrol, dll..."
                rows={3}
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Catatan lain yang perlu didokumentasikan..."
                rows={2}
                disabled={isLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        {!isLocked && (
          <div className="bg-background sticky bottom-0 flex justify-end gap-3 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Draf
            </Button>
            <Button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Lock className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan & Kunci RME"}
            </Button>
          </div>
        )}

        {isLocked && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Rekam medis ini telah dikunci dan tidak dapat diubah.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  )
}
