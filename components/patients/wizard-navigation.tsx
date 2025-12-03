/**
 * Wizard Navigation Component
 * Navigation buttons for multi-step forms
 */

import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
  isStep1Valid?: boolean
  onNext?: () => void
  onBack?: () => void
  onCancel?: () => void
  submitLabel?: string
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  isStep1Valid = true,
  onNext,
  onBack,
  onCancel,
  submitLabel = "Simpan",
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      {/* Left side buttons */}
      <div>
        {!isFirstStep && onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        )}
        {isFirstStep && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Batal
          </Button>
        )}
      </div>

      {/* Right side buttons */}
      <div className="flex gap-2">
        {!isLastStep && onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!isStep1Valid}
            className="w-full sm:w-auto"
          >
            Selanjutnya
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {isLastStep && (
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
