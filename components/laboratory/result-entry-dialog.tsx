/**
 * Result Entry Dialog Component
 * Dialog for lab technicians to input test results
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCreateLabResult } from "@/hooks/use-create-lab-result"
import type { LabOrderWithRelations } from "@/types/lab"

interface ResultEntryDialogProps {
  order: LabOrderWithRelations
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const formSchema = z.object({
  resultValue: z.string().min(1, "Nilai hasil harus diisi"),
  isCritical: z.boolean(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function ResultEntryDialog({ order, trigger, onSuccess }: ResultEntryDialogProps) {
  console.log({ order })
  const [open, setOpen] = useState(false)
  const [showCriticalWarning, setShowCriticalWarning] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resultValue: "",
      isCritical: false,
      notes: "",
    },
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
    // Construct resultData based on test template type
    let resultData
    const template = order.test?.resultTemplate

    if (template?.type === "numeric") {
      resultData = {
        value: parseFloat(data.resultValue) || 0,
        unit: template.unit,
        referenceRange: template.referenceRange,
        flag: "normal" as const,
      }
    } else if (template?.type === "descriptive") {
      resultData = {
        findings: data.resultValue,
        interpretation: data.notes || "",
      }
    } else {
      // Default to descriptive if no template
      resultData = {
        findings: data.resultValue,
        interpretation: data.notes || "",
      }
    }

    await createResult({
      orderId: order.id,
      resultData,
      resultNotes: data.notes,
      criticalValue: data.isCritical,
    })
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
        <DialogContent className="sm:max-w-[600px]">
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

            {/* Test Information */}
            {order.test?.resultTemplate?.type === "numeric" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground text-xs">Satuan</p>
                  <p className="font-medium">{order.test.resultTemplate.unit}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground text-xs">Nilai Rujukan</p>
                  <p className="font-medium">
                    {order.test.resultTemplate.referenceRange.min} -{" "}
                    {order.test.resultTemplate.referenceRange.max}
                  </p>
                </div>
              </div>
            )}

            {/* Result Value */}
            <div className="space-y-2">
              <Label htmlFor="resultValue">
                Nilai Hasil *
                {order.test?.resultTemplate?.type === "numeric" &&
                  ` (${order.test.resultTemplate.unit})`}
              </Label>
              <Input
                id="resultValue"
                placeholder="Masukkan hasil pemeriksaan..."
                {...form.register("resultValue")}
                autoComplete="off"
              />
              {form.formState.errors.resultValue && (
                <p className="text-sm text-red-600">{form.formState.errors.resultValue.message}</p>
              )}
            </div>

            {/* Critical Value Checkbox */}
            <div className="flex items-start space-x-3 rounded-md border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
              <Checkbox
                id="isCritical"
                checked={form.watch("isCritical")}
                onCheckedChange={(checked) => form.setValue("isCritical", checked === true)}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="isCritical"
                  className="cursor-pointer leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <IconAlertTriangle className="mr-1 inline-block h-4 w-4" />
                  Nilai Kritis
                </Label>
                <p className="text-muted-foreground text-xs">
                  Centang jika hasil berada di luar batas normal dan memerlukan perhatian segera
                  dari dokter
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Teknisi</Label>
              <Textarea
                id="notes"
                placeholder="Catat observasi tambahan, metode pemeriksaan, atau informasi relevan lainnya..."
                {...form.register("notes")}
                rows={3}
              />
              <p className="text-muted-foreground text-xs">Opsional</p>
            </div>

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
