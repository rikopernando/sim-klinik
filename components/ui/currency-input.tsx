/**
 * Currency Input Component
 * Formatted number input for Indonesian Rupiah (IDR)
 * Uses period (.) as thousand separator
 */

import * as React from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<
  NumericFormatProps,
  "customInput" | "onValueChange" | "value"
> {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    return (
      <NumericFormat
        value={value}
        onValueChange={(values) => {
          // Only pass the raw numeric value (no formatting)
          onValueChange(values.value)
        }}
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        allowNegative={false}
        decimalScale={0}
        className={cn(className)}
        getInputRef={ref}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"
