/**
 * Record Vital Signs Dialog Component
 * Form for recording patient vital signs
 */

"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { IconHeartRateMonitor, IconPlus } from "@tabler/icons-react"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { vitalSignsSchema } from "@/lib/inpatient/validation"
import { recordVitalSigns } from "@/lib/services/inpatient.service"
import { getErrorMessage } from "@/lib/utils/error"

const vitalSignsFormSchema = vitalSignsSchema.omit({ visitId: true, recordedBy: true })

type VitalSignsFormData = z.infer<typeof vitalSignsFormSchema>

interface RecordVitalsDialogProps {
  visitId: string
  patientName: string
  onSuccess?: () => void
}

const CONSCIOUSNESS_OPTIONS = [
  { value: "Compos Mentis (CM)", label: "Compos Mentis (CM)" },
  { value: "Apatis", label: "Apatis" },
  { value: "Delirium", label: "Delirium" },
  { value: "Somnolen", label: "Somnolen" },
  { value: "Sopor", label: "Sopor" },
  { value: "Semi Coma", label: "Semi Coma" },
  { value: "Coma", label: "Coma" },
]

export function RecordVitalsDialog({ visitId, patientName, onSuccess }: RecordVitalsDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsFormSchema),
    defaultValues: {
      temperature: "",
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
      pulse: undefined,
      respiratoryRate: undefined,
      oxygenSaturation: "",
      weight: "",
      height: "",
      painScale: undefined,
      consciousness: "",
      notes: "",
    },
  })

  const handleSubmit = async (data: VitalSignsFormData) => {
    try {
      // recordedBy will be set by the API using the session user ID
      await recordVitalSigns({
        visitId,
        recordedBy: "", // Will be overridden by API
        ...data,
      })

      toast.success("Tanda vital berhasil dicatat")
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error recording vital signs:", error)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Catat Tanda Vital
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconHeartRateMonitor className="h-5 w-5" />
            Catat Tanda Vital
          </DialogTitle>
          <DialogDescription>Catat tanda vital untuk {patientName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <Field>
              <FieldLabel htmlFor="temperature">Suhu Tubuh (°C)</FieldLabel>
              <Controller
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <Input id="temperature" {...field} placeholder="36.5" type="number" />
                )}
              />
              <FieldError errors={[form.formState.errors.temperature]} />
            </Field>

            {/* Pulse */}
            <Field>
              <FieldLabel htmlFor="pulse">Nadi (per menit)</FieldLabel>
              <Controller
                control={form.control}
                name="pulse"
                render={({ field }) => (
                  <Input
                    id="pulse"
                    type="number"
                    placeholder="80"
                    value={field.value ? field.value.toString() : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.pulse]} />
            </Field>

            {/* Blood Pressure Systolic */}
            <Field>
              <FieldLabel htmlFor="bloodPressureSystolic">Tekanan Darah Sistolik</FieldLabel>
              <Controller
                control={form.control}
                name="bloodPressureSystolic"
                render={({ field }) => (
                  <Input
                    id="bloodPressureSystolic"
                    type="number"
                    placeholder="120"
                    value={field.value ? field.value.toString() : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.bloodPressureSystolic]} />
            </Field>

            {/* Blood Pressure Diastolic */}
            <Field>
              <FieldLabel htmlFor="bloodPressureDiastolic">Tekanan Darah Diastolik</FieldLabel>
              <Controller
                control={form.control}
                name="bloodPressureDiastolic"
                render={({ field }) => (
                  <Input
                    id="bloodPressureDiastolic"
                    type="number"
                    placeholder="80"
                    value={field.value ? field.value.toString() : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.bloodPressureDiastolic]} />
            </Field>

            {/* Respiratory Rate */}
            <Field>
              <FieldLabel htmlFor="respiratoryRate">Laju Respirasi (per menit)</FieldLabel>
              <Controller
                control={form.control}
                name="respiratoryRate"
                render={({ field }) => (
                  <Input
                    id="respiratoryRate"
                    type="number"
                    placeholder="20"
                    value={field.value ? field.value.toString() : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.respiratoryRate]} />
            </Field>

            {/* Oxygen Saturation */}
            <Field>
              <FieldLabel htmlFor="oxygenSaturation">Saturasi Oksigen (%)</FieldLabel>
              <Controller
                control={form.control}
                name="oxygenSaturation"
                render={({ field }) => (
                  <Input id="oxygenSaturation" {...field} placeholder="98" type="text" />
                )}
              />
              <FieldError errors={[form.formState.errors.oxygenSaturation]} />
            </Field>

            {/* Weight */}
            <Field>
              <FieldLabel htmlFor="weight">Berat Badan (kg)</FieldLabel>
              <Controller
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <Input id="weight" {...field} placeholder="70" type="text" />
                )}
              />
              <FieldError errors={[form.formState.errors.weight]} />
            </Field>

            {/* Height */}
            <Field>
              <FieldLabel htmlFor="height">Tinggi Badan (cm)</FieldLabel>
              <Controller
                control={form.control}
                name="height"
                render={({ field }) => (
                  <Input id="height" {...field} placeholder="170" type="text" />
                )}
              />
              <FieldError errors={[form.formState.errors.height]} />
            </Field>

            {/* Pain Scale */}
            <Field>
              <FieldLabel htmlFor="painScale">Skala Nyeri (0-10)</FieldLabel>
              <Controller
                control={form.control}
                name="painScale"
                render={({ field }) => (
                  <Input
                    id="painScale"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={field.value ? field.value.toString() : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.painScale]} />
            </Field>

            {/* Consciousness */}
            <Field>
              <FieldLabel htmlFor="consciousness">Tingkat Kesadaran</FieldLabel>
              <Controller
                control={form.control}
                name="consciousness"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="consciousness">
                      <SelectValue placeholder="Pilih tingkat kesadaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSCIOUSNESS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.consciousness]} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            {/* Notes */}
            <Field>
              <FieldLabel htmlFor="notes">Catatan Tambahan</FieldLabel>
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    id="notes"
                    {...field}
                    placeholder="Catatan tambahan jika ada..."
                    rows={3}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.notes]} />
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
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Tanda Vital"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
