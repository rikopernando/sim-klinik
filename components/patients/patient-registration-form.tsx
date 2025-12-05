"use client"

/**
 * Patient Registration Form Component
 * 2-step wizard form for registering new patients
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormStepIndicator } from "@/components/patients/form-step-indicator"
import { PatientBasicInfoStep } from "@/components/patients/patient-basic-info-step"
import { PatientContactStep } from "@/components/patients/patient-contact-step"
import { WizardNavigation } from "@/components/patients/wizard-navigation"

import { patientFormSchema, type PatientFormData } from "@/lib/validations/registration"
import { type RegisteredPatient } from "@/types/registration"
import { registerPatient } from "@/lib/services/patient.service"
import { getErrorMessage } from "@/lib/utils/error"

interface PatientRegistrationFormProps {
  onSuccess?: (patient: RegisteredPatient) => void
  onCancel?: () => void
}

const FORM_STEPS = [
  { number: 1, label: "Data Utama" },
  { number: 2, label: "Kontak & Jaminan" },
]

export function PatientRegistrationForm({ onSuccess, onCancel }: PatientRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nik: "",
      name: "",
      dateOfBirth: undefined,
      gender: undefined,
      bloodType: "",
      phone: "",
      address: "",
      email: "",
      emergencyContact: "",
      emergencyPhone: "",
      insuranceType: "",
      insuranceNumber: "",
      allergies: "",
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
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
      const patient = await registerPatient(data)
      onSuccess?.(patient)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      console.error("Registration error:", error)
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
        submitLabel="Daftar Pasien"
      />
    </form>
  )
}
