/**
 * Result Entry Dialog Component
 * Supports numeric, multi_parameter, and descriptive result templates with full type safety
 */

"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconFileText, IconX, IconAlertTriangle } from "@tabler/icons-react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCreateLabResult } from "@/hooks/use-create-lab-result"
import {
  type LabOrderWithRelations,
  type ResultTemplate,
  type ResultFlag,
  RESULT_FLAGS,
} from "@/types/lab"
import {
  isNumericTemplate,
  isDescriptiveTemplate,
  isMultiParameterTemplate,
  type NumericResultFormData,
  type DescriptiveResultFormData,
  type MultiParameterResultFormData,
  type ResultFormData,
  createParameterKey,
} from "@/types/lab-result-form"
import { CreateLabResultInput, ParameterResultInput } from "@/lib/lab"

interface ResultEntryDialogProps {
  order: LabOrderWithRelations
  trigger?: React.ReactNode
  onSuccess?: () => void
}

/**
 * Create dynamic Zod schema based on result template type
 */
function createFormSchema(template: ResultTemplate | null) {
  const baseSchema = {
    isCritical: z.boolean(),
    notes: z.string().optional(),
  }

  if (isMultiParameterTemplate(template)) {
    // Build parameter fields dynamically
    const parameterFields = template.parameters.reduce(
      (acc, param, index) => {
        acc[createParameterKey(index)] = z.string().min(1, `${param.name} harus diisi`)
        return acc
      },
      {} as Record<string, z.ZodString>
    )

    return z.object({ ...baseSchema, ...parameterFields })
  }

  if (isDescriptiveTemplate(template)) {
    return z.object({
      ...baseSchema,
      findings: z.string().min(1, "Temuan harus diisi"),
      interpretation: z.string().optional(),
      impression: z.string().optional(),
    })
  }

  // Numeric or default
  return z.object({
    ...baseSchema,
    resultValue: z.string().min(1, "Nilai hasil harus diisi"),
  })
}

/**
 * Convert form data to CreateLabResultInput based on template type
 */
function convertFormDataToResultInput(
  orderId: string,
  formData: ResultFormData,
  template: ResultTemplate | null
): CreateLabResultInput {
  let resultData: CreateLabResultInput["resultData"]
  let parameters: ParameterResultInput[] = []

  if (isNumericTemplate(template)) {
    const data = formData as NumericResultFormData
    const value = parseFloat(data.resultValue) || 0
    const { min, max } = template.referenceRange

    // Calculate flag based on reference range
    let flag: ResultFlag = RESULT_FLAGS.NORMAL
    const criticalThreshold = 2 // 2x or 0.5x is considered critical

    if (value < min * (1 / criticalThreshold) || value > max * criticalThreshold) {
      flag = value < min ? RESULT_FLAGS.CRITICAL_LOW : RESULT_FLAGS.CRITICAL_HIGH
    } else if (value < min) {
      flag = RESULT_FLAGS.LOW
    } else if (value > max) {
      flag = RESULT_FLAGS.HIGH
    }

    resultData = {
      value,
      unit: template.unit,
      referenceRange: template.referenceRange,
      flag,
    }
  } else if (isMultiParameterTemplate(template)) {
    const data = formData as MultiParameterResultFormData

    parameters = template.parameters.map((param, index) => {
      const paramKey = createParameterKey(index)
      const value = parseFloat(data[paramKey]) || 0
      const { min, max } = param.referenceRange

      // Calculate flag based on reference range
      let flag: ResultFlag = RESULT_FLAGS.NORMAL
      const criticalThreshold = 2 // 2x or 0.5x is considered critical

      if (value < min * (1 / criticalThreshold) || value > max * criticalThreshold) {
        flag = value < min ? RESULT_FLAGS.CRITICAL_LOW : RESULT_FLAGS.CRITICAL_HIGH
      } else if (value < min) {
        flag = RESULT_FLAGS.LOW
      } else if (value > max) {
        flag = RESULT_FLAGS.HIGH
      }

      return {
        parameterName: param.name,
        parameterValue: value.toString(),
        unit: param.unit,
        referenceMin: param.referenceRange.min,
        referenceMax: param.referenceRange.max,
        flag,
      }
    })

    // For multi-parameter templates, provide a default descriptive result
    resultData = {
      findings: "Multi-parameter test results",
      interpretation: "See parameters for detailed values",
    }
  } else if (isDescriptiveTemplate(template)) {
    const data = formData as DescriptiveResultFormData
    resultData = {
      findings: data.findings,
      interpretation: data.interpretation || "",
    }
  } else {
    // Fallback to descriptive format
    const data = formData as NumericResultFormData
    resultData = {
      findings: data.resultValue || "",
      interpretation: data.notes || "",
    }
  }

  return {
    orderId,
    resultData,
    parameters,
    resultNotes: formData.notes,
    criticalValue: formData.isCritical,
  }
}

export function ResultEntryDialog({ order, trigger, onSuccess }: ResultEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [showCriticalWarning, setShowCriticalWarning] = useState(false)

  const template = order.test?.resultTemplate || null
  const formSchema = createFormSchema(template)
  type FormData = z.infer<typeof formSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isCritical: false,
      notes: "",
    } as FormData,
  })

  const { createResult, isCreating } = useCreateLabResult({
    onSuccess: (result) => {
      if (result?.criticalValue) {
        setShowCriticalWarning(true)
        setTimeout(() => setShowCriticalWarning(false), 5000)
      }
      setOpen(false)
      form.reset()
      onSuccess?.()
    },
  })

  const onSubmit = async (data: FormData) => {
    const resultInput = convertFormDataToResultInput(order.id, data as ResultFormData, template)
    await createResult(resultInput)
  }

  const renderResultFields = () => {
    if (isMultiParameterTemplate(template)) {
      return (
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Parameter Pemeriksaan</FieldLegend>
            <FieldGroup>
              {template.parameters.map((param, index) => {
                const paramKey = createParameterKey(index)
                return (
                  <Field key={paramKey}>
                    <FieldLabel htmlFor={paramKey}>
                      {param.name} ({param.unit}) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Controller
                      control={form.control}
                      name={paramKey as keyof FormData}
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            id={paramKey}
                            type="number"
                            step="any"
                            autoComplete="off"
                            placeholder={`Masukkan nilai ${param.name}...`}
                            value={(field.value as string) || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                          {fieldState?.error?.message && (
                            <FieldError>{fieldState.error.message}</FieldError>
                          )}
                        </>
                      )}
                    />
                    <FieldDescription>
                      Rujukan: {param.referenceRange.min} - {param.referenceRange.max} {param.unit}
                    </FieldDescription>
                  </Field>
                )
              })}
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      )
    }

    if (isDescriptiveTemplate(template)) {
      return (
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="findings">
                  Temuan / Findings <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={form.control}
                  name={"findings" as keyof FormData}
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        id="findings"
                        placeholder="Deskripsikan temuan pemeriksaan..."
                        rows={4}
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {fieldState?.error?.message && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="interpretation">Interpretasi / Interpretation</FieldLabel>
                <Controller
                  control={form.control}
                  name={"interpretation" as keyof FormData}
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        id="interpretation"
                        placeholder="Berikan interpretasi hasil..."
                        rows={4}
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {fieldState?.error?.message && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="impression">Kesan / Impression</FieldLabel>
                <Controller
                  control={form.control}
                  name={"impression" as keyof FormData}
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        id="impression"
                        placeholder="Kesimpulan atau kesan..."
                        rows={4}
                        value={field.value as string}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {fieldState?.error?.message && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </>
                  )}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      )
    }

    // Numeric (default)
    return (
      <div className="space-y-4">
        {isNumericTemplate(template) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Satuan</p>
              <p className="font-medium">{template.unit}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-muted-foreground text-xs">Nilai Rujukan</p>
              <p className="font-medium">
                {template.referenceRange.min} - {template.referenceRange.max}
              </p>
            </div>
          </div>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="findings">
              Nilai Hasil ({template?.unit}) <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={form.control}
              name={"resultValue" as keyof FormData}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="resultValue"
                    type="number"
                    step="any"
                    placeholder="Masukkan hasil pemeriksaan..."
                    autoComplete="off"
                    value={(field.value as string) || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  {fieldState?.error?.message && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </>
              )}
            />
          </Field>
        </FieldGroup>
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" variant="default">
              <IconFileText className="mr-2 h-4 w-4" />
              Input Hasil
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Input Hasil Pemeriksaan
            </DialogTitle>
            <DialogDescription>
              Masukkan hasil pemeriksaan laboratorium dengan teliti dan akurat
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Order Information */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{order.test?.name || "Test Unknown"}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {order.test?.department}
                  </Badge>
                  {order.urgency && order.urgency !== "routine" && (
                    <Badge
                      variant={order.urgency === "stat" ? "destructive" : "default"}
                      className={order.urgency === "urgent" ? "bg-orange-500" : ""}
                    >
                      {order.urgency.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Pasien:</span> {order.patient.name}
                  </p>
                  <p>
                    <span className="font-medium">MR Number:</span> {order.patient.mrNumber}
                  </p>
                  <p className="font-mono text-xs">{order.orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Result Fields */}
            {renderResultFields()}

            {/* Critical Value Checkbox */}
            <Field>
              <Controller
                control={form.control}
                name="isCritical"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isCritical"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                    <FieldLabel htmlFor="isCritical">Nilai Kritis</FieldLabel>
                  </div>
                )}
              />
              <FieldDescription>
                Centang jika hasil berada di luar batas normal dan memerlukan perhatian segera dari
                dokter
              </FieldDescription>
            </Field>

            {/* Notes (for numeric and multi_parameter only) */}
            {!isDescriptiveTemplate(template) && (
              <Field>
                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea
                      id="notes"
                      placeholder="Catat observasi tambahan, metode pemeriksaan, atau informasi relevan lainnya..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </Field>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                <IconX className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button type="submit" disabled={isCreating}>
                <IconFileText className="mr-2 h-4 w-4" />
                {isCreating ? "Menyimpan..." : "Simpan Hasil"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Critical Value Warning Alert */}
      {showCriticalWarning && (
        <Alert variant="destructive" className="animate-in fixed right-4 bottom-4 z-50 w-96">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertTitle>Nilai Kritis Terdeteksi!</AlertTitle>
          <AlertDescription>
            Hasil dengan nilai kritis telah disimpan. Dokter akan segera diberitahu untuk segera
            meninjau hasil ini.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
