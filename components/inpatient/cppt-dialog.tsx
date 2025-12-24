/**
 * CPPT Recording Dialog Component
 * Form for creating Integrated Progress Notes (Catatan Perkembangan Pasien Terintegrasi)
 */

"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { IconNotes, IconPlus } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { cpptSchema } from "@/lib/inpatient/validation"
import { createCPPTEntry } from "@/lib/services/inpatient.service"
import { useSession } from "@/lib/auth-client"

const cpptFormSchema = cpptSchema.omit({ visitId: true, authorId: true, authorRole: true })

type CPPTFormData = z.infer<typeof cpptFormSchema>

interface CPPTDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function CPPTDialog({ visitId, patientName, onSuccess }: CPPTDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const isDoctor = session?.user?.role === "doctor"

  const form = useForm<CPPTFormData>({
    resolver: zodResolver(cpptFormSchema),
    defaultValues: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      progressNote: "",
      instructions: "",
    },
  })

  const handleSubmit = async (data: CPPTFormData) => {
    try {
      await createCPPTEntry({
        visitId,
        ...data,
      })

      toast.success("Catatan CPPT berhasil disimpan")
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error creating CPPT entry:", error)
      toast.error("Gagal menyimpan catatan CPPT")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah CPPT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconNotes className="h-5 w-5" />
            Catatan Perkembangan Pasien Terintegrasi (CPPT)
          </DialogTitle>
          <DialogDescription>
            Catat perkembangan pasien untuk <strong>{patientName}</strong> •{" "}
            {isDoctor ? "Format SOAP (Dokter)" : "Catatan Perawat"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {isDoctor && (
            // SOAP Format for Doctors
            <FieldGroup>
              {/* Subjective */}
              <Field>
                <FieldLabel htmlFor="subjective">S - Subjective (Keluhan Pasien)</FieldLabel>
                <FieldDescription>
                  Keluhan yang disampaikan pasien atau keluarga pasien
                </FieldDescription>
                <Controller
                  control={form.control}
                  name="subjective"
                  render={({ field }) => (
                    <Textarea
                      id="subjective"
                      {...field}
                      placeholder="Contoh: Pasien mengeluh nyeri dada..."
                      rows={3}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.subjective]} />
              </Field>

              {/* Objective */}
              <Field>
                <FieldLabel htmlFor="objective">O - Objective (Pemeriksaan Objektif)</FieldLabel>
                <FieldDescription>
                  Hasil pemeriksaan fisik, tanda vital, dan hasil laboratorium
                </FieldDescription>
                <Controller
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <Textarea
                      id="objective"
                      {...field}
                      placeholder="Contoh: TD 120/80, Nadi 80x/menit, Suhu 36.5°C..."
                      rows={3}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.objective]} />
              </Field>

              {/* Assessment */}
              <Field>
                <FieldLabel htmlFor="assessment">A - Assessment (Penilaian/Diagnosis)</FieldLabel>
                <FieldDescription>
                  Diagnosis kerja, diagnosis banding, atau penilaian kondisi pasien
                </FieldDescription>
                <Controller
                  control={form.control}
                  name="assessment"
                  render={({ field }) => (
                    <Textarea
                      id="assessment"
                      {...field}
                      placeholder="Contoh: Diagnosis: Gastritis akut..."
                      rows={3}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.assessment]} />
              </Field>

              {/* Plan */}
              <Field>
                <FieldLabel htmlFor="plan">P - Plan (Rencana Tindakan)</FieldLabel>
                <FieldDescription>
                  Rencana pemeriksaan, pengobatan, dan tindakan selanjutnya
                </FieldDescription>
                <Controller
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <Textarea
                      id="plan"
                      {...field}
                      placeholder="Contoh: Berikan Omeprazole 1x20mg, Observasi keluhan..."
                      rows={3}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.plan]} />
              </Field>
            </FieldGroup>
          )}

          {/* Progress Note (for both doctor and nurse) */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="progressNote">
                Catatan Perkembangan <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldDescription>
                {isDoctor
                  ? "Ringkasan catatan tambahan atau perkembangan kondisi pasien"
                  : "Catatan observasi dan perawatan yang diberikan kepada pasien"}
              </FieldDescription>
              <Controller
                control={form.control}
                name="progressNote"
                render={({ field }) => (
                  <Textarea
                    id="progressNote"
                    {...field}
                    placeholder={
                      isDoctor
                        ? "Contoh: Pasien menunjukkan perbaikan klinis, keluhan berkurang..."
                        : "Contoh: Pasien tampak nyaman, vital signs stabil, intake/output seimbang..."
                    }
                    rows={4}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.progressNote]} />
            </Field>

            {/* Instructions */}
            <Field>
              <FieldLabel htmlFor="instructions">Instruksi Khusus</FieldLabel>
              <FieldDescription>
                Instruksi khusus untuk perawat, keluarga pasien, atau shift berikutnya
              </FieldDescription>
              <Controller
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <Textarea
                    id="instructions"
                    {...field}
                    placeholder="Contoh: Observasi tanda-tanda perdarahan, monitor intake output..."
                    rows={3}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.instructions]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={form.formState.isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan CPPT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
