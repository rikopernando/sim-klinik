/**
 * Result Entry Dialog Component
 * Supports numeric, multi_parameter, and descriptive result templates with full type safety
 */

"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconFileText, IconX, IconAlertTriangle, IconUpload, IconFile } from "@tabler/icons-react"
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
  type AttachmentType,
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
import {
  uploadLabAttachment,
  getAllowedMimeTypes,
  getAttachmentType,
  formatFileSize,
} from "@/lib/utils/file-upload"
import { toTitleCaseMap } from "@/lib/utils/string"

import LabBadge from "./lab-badge"

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
    // Build parameter fields dynamically
    const parameterFields = template.fields.reduce(
      (acc, field) => {
        acc[field] = z.string().min(1, `${toTitleCaseMap(field, "_")} harus diisi`)
        return acc
      },
      {} as Record<string, z.ZodString>
    )
    return z.object({ ...baseSchema, ...parameterFields })
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

  if (isNumericTemplate(template)) {
    const data = formData as NumericResultFormData
    const value = parseFloat(data.resultValue) || 0
    const { min, max } = template.referenceRange

    // Calculate flag based on reference range
    let flag: ResultFlag = RESULT_FLAGS.NORMAL
    const criticalThreshold = 2 // 2x or 0.5x is considered critical

    const hasReferenceRange = min > 0 || max > 0
    if (hasReferenceRange) {
      if (value < min * (1 / criticalThreshold) || value > max * criticalThreshold) {
        flag = value < min ? RESULT_FLAGS.CRITICAL_LOW : RESULT_FLAGS.CRITICAL_HIGH
      } else if (value < min) {
        flag = RESULT_FLAGS.LOW
      } else if (value > max) {
        flag = RESULT_FLAGS.HIGH
      }
    }

    resultData = {
      value,
      unit: template.unit,
      referenceRange: template.referenceRange,
      flag,
    }
  } else if (isMultiParameterTemplate(template)) {
    const data = formData as MultiParameterResultFormData

    const parameters: ParameterResultInput[] = template.parameters.map((param, index) => {
      const paramKey = createParameterKey(index)
      const { min, max } = param.referenceRange

      // Calculate flag based on reference range
      let flag: ResultFlag = RESULT_FLAGS.NORMAL
      const criticalThreshold = 2 // 2x or 0.5x is considered critical

      const hasReferenceRange = min > 0 || max > 0
      if (hasReferenceRange) {
        const value = parseFloat(data[paramKey]) || 0
        if (value < min * (1 / criticalThreshold) || value > max * criticalThreshold) {
          flag = value < min ? RESULT_FLAGS.CRITICAL_LOW : RESULT_FLAGS.CRITICAL_HIGH
        } else if (value < min) {
          flag = RESULT_FLAGS.LOW
        } else if (value > max) {
          flag = RESULT_FLAGS.HIGH
        }
      }

      return {
        name: param.name,
        value: data[paramKey],
        unit: param.unit,
        referenceValue: param.referenceValue,
        referenceRange: {
          min: param.referenceRange.min,
          max: param.referenceRange.max,
        },
        flag,
      }
    })

    resultData = {
      parameters,
    }
  } else if (isDescriptiveTemplate(template)) {
    const data = formData as DescriptiveResultFormData
    let fieldValues = {}
    for (let index = 0; index < template.fields.length; index++) {
      const field = template.fields[index]
      fieldValues = {
        ...fieldValues,
        [field]: data[field],
      }
    }

    resultData = {
      ...fieldValues,
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
    resultNotes: formData.notes,
    criticalValue: formData.isCritical,
  }
}

export function ResultEntryDialog({ order, trigger, onSuccess }: ResultEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [showCriticalWarning, setShowCriticalWarning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
      setSelectedFile(null)
      setUploadError(null)
      onSuccess?.()
    },
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Validate file type
    const attachmentType = getAttachmentType(file)
    if (!attachmentType) {
      setUploadError(
        "Tipe file tidak didukung. Hanya PDF, JPEG, PNG, dan DICOM yang diperbolehkan."
      )
      setSelectedFile(null)
      return
    }

    // Validate file size
    const maxSizeMB = attachmentType === "PDF" || attachmentType === "DICOM" ? 50 : 10
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxSizeBytes) {
      setUploadError(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadError(null)
  }

  const onSubmit = async (data: FormData) => {
    setUploadError(null)
    let attachmentUrl: string | undefined
    let attachmentType: AttachmentType | undefined

    // Upload file if selected
    if (selectedFile) {
      setIsUploading(true)
      const uploadResult = await uploadLabAttachment(selectedFile, order.id)

      if ("error" in uploadResult) {
        setUploadError(uploadResult.error)
        setIsUploading(false)
        return
      }

      attachmentUrl = uploadResult.url
      attachmentType = uploadResult.type as AttachmentType
      setIsUploading(false)
    }

    // Create result with attachment URL if available
    const resultInput = convertFormDataToResultInput(order.id, data as ResultFormData, template)

    // Add attachment info if file was uploaded
    if (attachmentUrl && attachmentType) {
      resultInput.attachmentUrl = attachmentUrl
      resultInput.attachmentType = attachmentType
    }

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
                const hasReferenceRange =
                  param.referenceRange.min > 0 || param.referenceRange.max > 0
                return (
                  <Field key={paramKey}>
                    <FieldLabel htmlFor={paramKey}>
                      {param.name} {param.unit && `(${param.unit})`}{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Controller
                      control={form.control}
                      name={paramKey as keyof FormData}
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            id={paramKey}
                            type={hasReferenceRange ? "number" : "text"}
                            step={hasReferenceRange ? "any" : undefined}
                            autoComplete="off"
                            placeholder={`Masukkan nilai ${param.name} ${
                              param.unit ? `(${param.unit})` : ""
                            }...`}
                            value={(field.value as string) || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                          {fieldState?.error?.message && (
                            <FieldError>{fieldState.error.message}</FieldError>
                          )}
                        </>
                      )}
                    />
                    {(hasReferenceRange || param.referenceValue) && (
                      <FieldDescription>
                        Rujukan:{" "}
                        {hasReferenceRange
                          ? `${param.referenceRange.min} - ${param.referenceRange.max} ${param.unit}`
                          : param.referenceValue}
                      </FieldDescription>
                    )}
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
              {template?.fields?.map((fieldName, index) => {
                return (
                  <Field key={`${fieldName}-${index}}`}>
                    <FieldLabel htmlFor={fieldName}>
                      {toTitleCaseMap(fieldName, "_")} <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Controller
                      control={form.control}
                      name={fieldName as keyof FormData}
                      render={({ field, fieldState }) => (
                        <>
                          <Textarea
                            id={fieldName}
                            placeholder={`Masukkan ${toTitleCaseMap(fieldName, "_")}...`}
                            rows={1}
                            value={field.value as string}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="min-h-9"
                          />
                          {fieldState?.error?.message && (
                            <FieldError>{fieldState.error.message}</FieldError>
                          )}
                        </>
                      )}
                    />
                  </Field>
                )
              })}
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
            <FieldLabel htmlFor="resultValue">
              Nilai Hasil {template?.unit && `(${template.unit})`}{" "}
              <span className="text-destructive">*</span>
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
                  <LabBadge departement={order.test?.department || "LAB"} />
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

            {/* File Upload Section */}
            <Field>
              <FieldLabel htmlFor="attachment">Lampiran File</FieldLabel>
              <FieldDescription>
                Upload file PDF, gambar (JPEG/PNG), atau DICOM. Maksimal{" "}
                {order.test?.department === "RAD" ? "50MB" : "10MB"}
              </FieldDescription>

              {!selectedFile ? (
                <div className="border-muted-foreground/25 hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors">
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <IconUpload className="text-muted-foreground mb-2 h-8 w-8" />
                    <span className="text-muted-foreground mb-1 text-sm font-medium">
                      Klik untuk upload file
                    </span>
                    <span className="text-muted-foreground text-xs">
                      PDF, JPEG, PNG, atau DICOM
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept={getAllowedMimeTypes().join(",")}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <IconFile className="text-primary h-8 w-8" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading || isCreating}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadError && <FieldError>{uploadError}</FieldError>}
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating || isUploading}
              >
                <IconX className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button type="submit" disabled={isCreating || isUploading}>
                <IconFileText className="mr-2 h-4 w-4" />
                {isUploading ? "Mengupload file..." : isCreating ? "Menyimpan..." : "Simpan Hasil"}
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
