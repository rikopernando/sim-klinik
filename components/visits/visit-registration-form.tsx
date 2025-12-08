"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Check, AlertCircle } from "lucide-react"

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { visitFormSchema, type VisitFormData } from "@/lib/validations/registration"
import { type Patient, type RegisteredVisit } from "@/types/registration"
import { registerVisit } from "@/lib/services/visit.service"
import { getErrorMessage } from "@/lib/utils/error"
import { PatientInfoCard } from "@/components/forms/patient-info-card"
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

export function VisitRegistrationForm({
  patient,
  onSuccess,
  onCancel,
}: VisitRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { doctors, isLoading: loadingDoctors, errorMessage: doctorsError } = useDoctor()
  const { polis, isLoading: loadingPolis, errorMessage: polisError } = usePoli()

  console.log({ doctors, polis })

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
    },
  })

  const visitType = watch("visitType")

  const onSubmit = async (data: VisitFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const visit = await registerVisit(patient.id, data)
      console.log({ visit })
      onSuccess?.(visit)
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

              {visitType === "inpatient" && <InpatientFields errors={errors} setValue={setValue} />}

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
