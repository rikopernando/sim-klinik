"use client"

/**
 * Discharge Summary Dialog Component
 * Form for doctors to fill discharge summary (Resume Medis)
 * Locks the visit by setting status to 'ready_for_billing'
 */

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import z from "zod"
import { IconFileDescription } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { dischargeSummarySchema } from "@/lib/inpatient/validation"
import { createInpatientDischargeSummary } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { ICD10Search } from "@/components/medical-records/icd10-search"
import { DatePickerField } from "@/components/forms/date-picker-field"

const currentYear = new Date().getFullYear() + 20

const dischargeSummaryInputSchema = dischargeSummarySchema
  .omit({
    followUpDate: true,
  })
  .extend({
    followUpDate: z.date().optional(),
  })

type DischargeSummaryInput = z.infer<typeof dischargeSummaryInputSchema>

interface DischargeSummaryDialogProps {
  visitId: string
  patientName: string
  onSuccess: () => void
}

export function DischargeSummaryDialog({
  visitId,
  patientName,
  onSuccess,
}: DischargeSummaryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DischargeSummaryInput>({
    resolver: zodResolver(dischargeSummaryInputSchema),
    defaultValues: {
      visitId,
      admissionDiagnosis: "",
      dischargeDiagnosis: "",
      clinicalSummary: "",
      proceduresPerformed: "",
      medicationsOnDischarge: "",
      dischargeInstructions: "",
      dietaryRestrictions: "",
      activityRestrictions: "",
      followUpDate: undefined,
      followUpInstructions: "",
    },
  })

  const onSubmit = async (data: DischargeSummaryInput) => {
    setIsSubmitting(true)
    try {
      await createInpatientDischargeSummary({
        ...data,
        followUpDate: data.followUpDate ? data.followUpDate.toISOString() : undefined,
      })
      toast.success("Ringkasan medis pulang berhasil dibuat. Visit telah terkunci.")
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating discharge summary:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconFileDescription className="mr-2 h-4 w-4" />
          Isi Ringkasan Medis Pulang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Ringkasan Medis Pulang (Resume Medis)</DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Admission Diagnosis */}
          <Controller
            control={form.control}
            name="admissionDiagnosis"
            render={({ field, fieldState }) => (
              <Field>
                <ICD10Search
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                  }}
                  onSelect={(_code, description) => {
                    field.onChange(description)
                  }}
                  label="Diagnosis Masuk"
                  placeholder="Ketik kode atau nama penyakit..."
                  required
                />
                {fieldState?.error && <FieldError>{fieldState.error.message}</FieldError>}
                <FieldDescription>Diagnosis awal saat pasien masuk RS</FieldDescription>
              </Field>
            )}
          />

          {/* Discharge Diagnosis */}
          <Controller
            control={form.control}
            name="dischargeDiagnosis"
            render={({ field, fieldState }) => (
              <Field>
                <ICD10Search
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                  }}
                  onSelect={(_code, description) => {
                    field.onChange(description)
                  }}
                  label="Diagnosis saat pulang"
                  placeholder="Ketik kode atau nama penyakit..."
                  required
                />
                {fieldState?.error && <FieldError>{fieldState.error.message}</FieldError>}
                <FieldDescription>Diagnosis akhir saat pasien pulang</FieldDescription>
              </Field>
            )}
          />

          {/* Clinical Summary */}
          <Controller
            control={form.control}
            name="clinicalSummary"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="clinicalSummary">
                  Ringkasan Klinis <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  placeholder="Ringkasan perjalanan penyakit dan perawatan selama di RS..."
                  rows={5}
                  {...field}
                />
                {fieldState?.error && <FieldError>{fieldState.error.message}</FieldError>}
                <FieldDescription>
                  Rangkuman kondisi dan perawatan pasien selama rawat inap
                </FieldDescription>
              </Field>
            )}
          />

          {/* Procedures Performed */}
          <Controller
            control={form.control}
            name="proceduresPerformed"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="proceduresPerformed">Tindakan yang Dilakukan</FieldLabel>
                <Textarea
                  placeholder="Daftar tindakan medis yang sudah dilakukan (dokumentasi)..."
                  rows={3}
                  {...field}
                />
                <FieldDescription>
                  Tindakan yang sudah dilakukan dan dibilling (opsional)
                </FieldDescription>
              </Field>
            )}
          />

          {/* Medications on Discharge */}
          <Controller
            control={form.control}
            name="medicationsOnDischarge"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="medicationsOnDischarge">Obat untuk Dibawa Pulang</FieldLabel>
                <Textarea
                  placeholder="Resep obat yang harus dibeli untuk lanjutan terapi di rumah..."
                  rows={3}
                  {...field}
                />
                <FieldDescription>Obat yang harus dilanjutkan di rumah (opsional)</FieldDescription>
              </Field>
            )}
          />

          {/* Discharge Instructions */}
          <Controller
            control={form.control}
            name="dischargeInstructions"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="dischargeInstructions">
                  Instruksi Pulang <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  placeholder="Instruksi perawatan luka, aktivitas, dll..."
                  rows={4}
                  {...field}
                />
                {fieldState?.error && <FieldError>{fieldState.error.message}</FieldError>}
                <FieldDescription>Instruksi untuk pasien di rumah</FieldDescription>
              </Field>
            )}
          />

          {/* Dietary Restrictions */}
          <Controller
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="dietaryRestrictions">Pantangan Makanan</FieldLabel>
                <Input placeholder="Makanan yang harus dihindari..." {...field} />
              </Field>
            )}
          />

          {/* Activity Restrictions */}
          <Controller
            control={form.control}
            name="activityRestrictions"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="activityRestrictions">Pembatasan Aktivitas</FieldLabel>
                <Input placeholder="Aktivitas yang harus dihindari..." {...field} />
              </Field>
            )}
          />

          {/* Follow Up Date */}
          <Controller
            control={form.control}
            name="followUpDate"
            render={({ field, fieldState }) => (
              <>
                <DatePickerField
                  label="Tanggal Kontrol"
                  value={field.value}
                  onChange={field.onChange}
                  endMonth={new Date(currentYear, 12)}
                />
                {fieldState.error?.message && <FieldError>{fieldState.error?.message}</FieldError>}
              </>
            )}
          />

          {/* Follow Up Instructions */}
          <Controller
            control={form.control}
            name="followUpInstructions"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="followUpInstructions">Instruksi Kontrol</FieldLabel>
                <Textarea
                  placeholder="Instruksi untuk kunjungan kontrol berikutnya..."
                  rows={3}
                  {...field}
                />
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan & Kunci Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
