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
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2">
          {index > 0 && (
            <div
              className={cn(
                "h-px w-8 transition-colors",
                currentStep > step.number ? "bg-primary" : "bg-border"
              )}
            />
          )}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                currentStep > step.number
                  ? "bg-primary text-white"
                  : currentStep === step.number
                    ? "bg-primary ring-primary text-white ring-2 ring-offset-2"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.number ? "✓" : step.number}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                currentStep === step.number ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
