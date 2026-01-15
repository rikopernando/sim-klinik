/**
 * Lab Order Form Component
 * Form for creating lab order with clinical details
 */

"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconFlask, IconInfoCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { createLabOrderSchema } from "@/lib/lab/validation"
import type { LabTest } from "@/types/lab"
import { formatCurrency } from "@/lib/utils/billing"
import { Input } from "@/components/ui/input"
import LabBadge from "./lab-badge"

const formSchema = createLabOrderSchema.omit({ visitId: true, patientId: true })

type LabOrderFormData = z.infer<typeof formSchema>

interface LabOrderFormProps {
  selectedTest: LabTest | null
  onSubmit: (data: LabOrderFormData) => void
  onBack: () => void
  isSubmitting: boolean
}

export function LabOrderForm({ selectedTest, onSubmit, onBack, isSubmitting }: LabOrderFormProps) {
  const form = useForm<LabOrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testId: selectedTest?.id,
      urgency: "routine",
      clinicalIndication: "",
      notes: "",
    },
  })

  const handleSubmit = (data: LabOrderFormData) => {
    onSubmit(data)
  }

  if (!selectedTest) {
    return (
      <Card className="p-8 text-center">
        <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-muted-foreground text-sm">Pilih tes laboratorium terlebih dahulu</p>
      </Card>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Selected Test Info */}
      <Card className="bg-accent/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <IconFlask className="text-primary h-4 w-4" />
              <h4 className="font-semibold">{selectedTest.name}</h4>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="font-mono">{selectedTest.code}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                {selectedTest.category}
              </Badge>
              <span>•</span>
              <LabBadge departement={selectedTest.department} />
            </div>
            {selectedTest.specimenType && (
              <p className="text-muted-foreground text-xs">
                <span className="font-medium">Spesimen:</span> {selectedTest.specimenType}
                {selectedTest.specimenVolume && ` (${selectedTest.specimenVolume})`}
                {selectedTest.specimenContainer && ` • Wadah: ${selectedTest.specimenContainer}`}
              </p>
            )}
            {selectedTest.instructions && (
              <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950/20">
                <div className="flex gap-2">
                  <IconInfoCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <span className="font-medium">Instruksi:</span> {selectedTest.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-primary text-lg font-semibold">
              {formatCurrency(parseFloat(selectedTest.price))}
            </p>
            {selectedTest.tatHours && (
              <p className="text-muted-foreground text-xs">Estimasi: {selectedTest.tatHours} jam</p>
            )}
          </div>
        </div>
      </Card>

      <Separator />

      <FieldGroup>
        <FieldLabel>Deskripsi</FieldLabel>
        <Input readOnly disabled name="description" value={selectedTest.description || ""} />
      </FieldGroup>

      {/* Urgency */}
      <FieldGroup>
        <FieldLabel>
          Urgensi <span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          name="urgency"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tingkat urgensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      RUTIN
                    </Badge>
                    <span>Hasil normal (sesuai TAT)</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-orange-500 text-xs">
                      URGENT
                    </Badge>
                    <span>Diprioritaskan (dalam 4 jam)</span>
                  </div>
                </SelectItem>
                <SelectItem value="stat">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      STAT
                    </Badge>
                    <span>Segera (dalam 1 jam)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>Tentukan kecepatan hasil yang dibutuhkan</FieldDescription>
        <FieldError>{form.formState.errors.urgency?.message}</FieldError>
      </FieldGroup>

      {/* Clinical Indication */}
      <FieldGroup>
        <FieldLabel>
          Indikasi Klinis <span className="text-destructive">*</span>
        </FieldLabel>
        <Controller
          name="clinicalIndication"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Jelaskan alasan pemeriksaan dan gejala pasien..."
              rows={4}
              className="resize-none"
            />
          )}
        />
        <FieldError>{form.formState.errors.clinicalIndication?.message}</FieldError>
        <FieldDescription>Informasi klinis untuk membantu interpretasi hasil</FieldDescription>
      </FieldGroup>

      {/* Additional Notes */}
      <FieldGroup>
        <FieldLabel>Catatan Tambahan</FieldLabel>
        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Catatan khusus untuk petugas laboratorium (opsional)..."
              rows={3}
              className="resize-none"
            />
          )}
        />
        <FieldDescription>
          Informasi tambahan seperti alergi, obat yang sedang dikonsumsi, dll
        </FieldDescription>
        <FieldError>{form.formState.errors.notes?.message}</FieldError>
      </FieldGroup>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Kembali
        </Button>
        <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="flex-1">
          {isSubmitting ? "Memproses..." : "Buat Order"}
        </Button>
      </div>
    </form>
  )
}
