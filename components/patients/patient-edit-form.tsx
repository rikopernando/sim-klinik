"use client"

/**
 * Patient Edit Form Component
 * 2-step wizard form for editing existing patient information
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormStepIndicator } from "./form-step-indicator"
import { PatientBasicInfoStep } from "./patient-basic-info-step"
import { PatientContactStep } from "./patient-contact-step"
import { WizardNavigation } from "./wizard-navigation"

import { patientFormSchema, type PatientFormData } from "@/lib/validations/registration"
import { type Patient } from "@/types/registration"
import { getErrorMessage } from "@/lib/utils/error"

interface PatientEditFormProps {
  patient: Patient
  onSuccess?: (patient: Patient) => void
  onCancel?: () => void
}

const FORM_STEPS = [
  { number: 1, label: "Data Utama" },
  { number: 2, label: "Kontak & Jaminan" },
]

export function PatientEditForm({ patient, onSuccess, onCancel }: PatientEditFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nik: patient.nik || "",
      name: patient.name,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
      gender: patient.gender as "male" | "female" | undefined,
      bloodType: patient.bloodType || "",
      phone: patient.phone || "",
      // Hierarchical address fields
      provinceId: patient.provinceId || "",
      provinceName: patient.provinceName || "",
      cityId: patient.cityId || "",
      cityName: patient.cityName || "",
      subdistrictId: patient.subdistrictId || "",
      subdistrictName: patient.subdistrictName || "",
      villageId: patient.villageId || "",
      villageName: patient.villageName || "",
      address: patient.address || "",
      email: patient.email || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      insuranceType: patient.insuranceType || "",
      insuranceNumber: patient.insuranceNumber || "",
      allergies: patient.allergies || "",
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = form

  // Watch fields for step 1 validation
  const [name, nik, gender] = watch(["name", "nik", "gender"])
  const isStep1Valid = name?.length >= 2 && nik?.length === 16 && gender !== undefined

  // Watch insurance type for conditional validation
  const insuranceType = watch("insuranceType")

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, "yyyy-MM-dd") : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update patient")
      }

      const result = await response.json()
      onSuccess?.(result.data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      console.error("Update error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const isValid = await trigger(["name", "nik", "gender"])
    if (isValid) {
      setCurrentStep(2)
      setErrorMessage(null)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
    setErrorMessage(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Indicator */}
      <FormStepIndicator steps={FORM_STEPS} currentStep={currentStep} />

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <PatientBasicInfoStep register={register} control={control} errors={errors} />
      )}

      {/* Step 2: Contact & Insurance */}
      {currentStep === 2 && (
        <PatientContactStep
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          insuranceType={insuranceType}
        />
      )}

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={FORM_STEPS.length}
        isSubmitting={isSubmitting}
        isStep1Valid={isStep1Valid}
        onNext={handleNext}
        onBack={handleBack}
        onCancel={onCancel}
        submitLabel="Simpan Perubahan"
      />
    </form>
  )
}
