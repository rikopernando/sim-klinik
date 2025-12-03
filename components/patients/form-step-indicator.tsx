/**
 * Form Step Indicator Component
 * Visual progress indicator for multi-step forms
 */

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
}

interface FormStepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function FormStepIndicator({ steps, currentStep }: FormStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2">
          {index > 0 && <div className="bg-border h-0.5 w-12" />}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                currentStep >= step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              )}
            >
              {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
