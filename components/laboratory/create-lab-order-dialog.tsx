/**
 * Create Lab Order Dialog Component
 * 2-step wizard for creating lab orders (select test → enter details)
 */

"use client"

import { useState } from "react"
import { IconFlask, IconPlus, IconArrowLeft } from "@tabler/icons-react"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog"
import { Button } from "@/components/ui/button"
import { useCreateLabOrder } from "@/hooks/use-create-lab-order"
import type { LabTest, CreateLabOrderInput } from "@/types/lab"

import { LabTestCatalog } from "./lab-test-catalog"
import { LabOrderForm } from "./lab-order-form"
import { FormStepIndicator } from "../patients/form-step-indicator"

interface CreateLabOrderDialogProps {
  visitId: string
  patientId: string
  patientName?: string
  onSuccess?: () => void
}

const STEPS = [
  { number: 1, label: "Pilih Tes", description: "Cari dan pilih pemeriksaan" },
  { number: 2, label: "Detail Order", description: "Indikasi klinis & urgensi" },
]

export function CreateLabOrderDialog({
  visitId,
  patientId,
  patientName,
  onSuccess,
}: CreateLabOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)

  const { isCreating, createOrder } = useCreateLabOrder({
    onSuccess: () => {
      setOpen(false)
      setStep(1)
      setSelectedTest(null)
      onSuccess?.()
    },
  })

  const handleSelectTest = (test: LabTest) => {
    setSelectedTest(test)
  }

  const handleContinue = () => {
    if (selectedTest) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (formData: Omit<CreateLabOrderInput, "visitId" | "patientId">) => {
    await createOrder({
      visitId,
      patientId,
      ...formData,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setStep(1)
      setSelectedTest(null)
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Order
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="sm:max-w-[800px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <IconFlask className="h-5 w-5" />
            Order Laboratorium & Radiologi
          </ResponsiveDialogTitle>
          {patientName && (
            <ResponsiveDialogDescription>
              Pasien: <strong>{patientName}</strong>
            </ResponsiveDialogDescription>
          )}
        </ResponsiveDialogHeader>

        {/* Step Indicator */}
        <div className="my-4 md:my-0">
          <FormStepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 ? (
            <div className="space-y-4">
              <LabTestCatalog onSelectTest={handleSelectTest} selectedTestId={selectedTest?.id} />

              {/* Continue Button */}
              {selectedTest && (
                <div
                  style={{ width: "calc(100% + 48px)" }}
                  className="bg-background sticky -bottom-6 -mb-6 -ml-6 p-4"
                >
                  <Button onClick={handleContinue} className="w-full" size="lg">
                    Lanjut ke Detail Order
                    <IconArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <LabOrderForm
              selectedTest={selectedTest}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isSubmitting={isCreating}
            />
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
