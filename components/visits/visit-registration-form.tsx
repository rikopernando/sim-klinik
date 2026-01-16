"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Check, AlertCircle, ChevronDown, ChevronUp, HeartPulse } from "lucide-react"

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { VitalSignsFields } from "@/components/vitals/vital-signs-fields"
import { PatientInfoCard } from "@/components/forms/patient-info-card"

import { createMedicalRecord } from "@/lib/services/medical-record.service"
import { visitFormSchema, type VisitFormData } from "@/lib/validations/registration"
import { type Patient, type RegisteredVisit } from "@/types/registration"
import { registerVisit } from "@/lib/services/visit.service"
import { getErrorMessage } from "@/lib/utils/error"
import { useDoctor } from "@/hooks/use-doctor"
import { usePoli } from "@/hooks/use-poli"

import { VisitTypeSelector } from "./visit-type-selector"
import { OutpatientFields } from "./outpatient-fields"
import { EmergencyFields } from "./emergency-fields"
import { InpatientFields } from "./inpatient-fields"

interface VisitRegistrationFormProps {
  patient: Patient
  onSuccess?: (visit: RegisteredVisit) => void
  onCancel?: () => void
}

function hasVitalSigns(data: VisitFormData): boolean {
  return !!(
    data.temperature ||
    data.bloodPressureSystolic ||
    data.bloodPressureDiastolic ||
    data.pulse ||
    data.respiratoryRate ||
    data.oxygenSaturation ||
    data.weight ||
    data.height ||
    data.painScale ||
    data.consciousness
  )
}

function generateSoapObjective(data: VisitFormData): string | undefined {
  if (!hasVitalSigns(data)) return
  return `TTV: Suhu: ${data.temperature || "-"} °C, TD: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg, Nadi: ${data.pulse || "-"}/menit, RR: ${data.respiratoryRate || "-"}/menit, SpO2: ${data.oxygenSaturation || "-"}%, BB: ${data.weight || "-"} kg, TB: ${data.height || "-"} cm, Kesadaran: ${data.consciousness || "-"}`
}

export function VisitRegistrationForm({
  patient,
  onSuccess,
  onCancel,
}: VisitRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [vitalsOpen, setVitalsOpen] = useState(false)

  const { doctors, isLoading: loadingDoctors, errorMessage: doctorsError } = useDoctor()
  const { polis, isLoading: loadingPolis, errorMessage: polisError } = usePoli()

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitType: "outpatient",
      poliId: "",
      doctorId: "",
      triageStatus: undefined,
      chiefComplaint: "",
      roomId: "",
      notes: "",
      // Vital Signs
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
    },
  })

  const visitType = watch("visitType")

  const onSubmit = async (data: VisitFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await registerVisit(patient.id, data)
      await createMedicalRecord({
        soapObjective: generateSoapObjective(data),
        visitId: response.visit.id,
        isDraft: true,
      })

      onSuccess?.(response)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      console.error("Visit registration error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Combine all errors for display
  const combinedError = errorMessage || polisError || doctorsError

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <PatientInfoCard patient={patient} />

      {/* Visit Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registrasi Kunjungan</CardTitle>
            <CardDescription>
              Pilih jenis kunjungan dan lengkapi informasi yang diperlukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              {/* Visit Type Selection */}
              <VisitTypeSelector
                value={visitType}
                onChange={(value) => setValue("visitType", value)}
              />

              {/* Conditional Fields Based on Visit Type */}
              {visitType === "outpatient" && (
                <OutpatientFields
                  polis={polis}
                  doctors={doctors}
                  loadingPolis={loadingPolis}
                  loadingDoctors={loadingDoctors}
                  errors={errors}
                  setValue={setValue}
                />
              )}

              {visitType === "emergency" && (
                <EmergencyFields register={register} errors={errors} setValue={setValue} />
              )}

              {visitType === "inpatient" && <InpatientFields />}

              {/* Vital Signs Section (Collapsible) */}
              <Collapsible open={vitalsOpen} onOpenChange={setVitalsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2">
                      <HeartPulse className="text-muted-foreground h-5 w-5" />
                      <span className="font-medium">Tanda Vital</span>
                    </div>
                    {vitalsOpen ? (
                      <ChevronUp className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <VitalSignsFields control={control} errors={errors} />
                </CollapsibleContent>
              </Collapsible>

              {/* Common Notes Field */}
              <FieldGroup>
                <Field className="gap-2">
                  <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Catatan tambahan (opsional)"
                    rows={2}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {combinedError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{combinedError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Batal
          </Button>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
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
  )
}
