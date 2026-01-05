"use client"

/**
 * Discharge Summary Dialog Component
 * Form for doctors to fill discharge summary (Resume Medis)
 * Locks the visit by setting status to 'ready_for_billing'
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { IconFileDescription, IconLock } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import z from "zod"
import { dischargeSummarySchema } from "@/lib/inpatient/validation"

const dischargeSummaryInputSchema = dischargeSummarySchema
  .omit({
    followUpDate: true,
  })
  .extend({
    followUpDate: z.date().optional(),
  })

type DischargeSummaryInput = z.infer<typeof dischargeSummaryInputSchema>

interface DischargeSummaryDialogProps {
  visitId: string
  patientName: string
  onSuccess: () => void
}

export function DischargeSummaryDialog({
  visitId,
  patientName,
  onSuccess,
}: DischargeSummaryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DischargeSummaryInput>({
    resolver: zodResolver(dischargeSummaryInputSchema),
    defaultValues: {
      visitId,
      admissionDiagnosis: "",
      dischargeDiagnosis: "",
      clinicalSummary: "",
      proceduresPerformed: "",
      medicationsOnDischarge: "",
      dischargeInstructions: "",
      dietaryRestrictions: "",
      activityRestrictions: "",
      followUpDate: undefined,
      followUpInstructions: "",
    },
  })

  const onSubmit = async (data: DischargeSummaryInput) => {
    setIsSubmitting(true)
    try {
      await axios.post("/api/inpatient/discharge-summary", data)
      toast.success("Ringkasan medis pulang berhasil dibuat. Visit telah terkunci.")
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating discharge summary:", error)
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Gagal membuat ringkasan medis pulang")
      } else {
        toast.error("Gagal membuat ringkasan medis pulang")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconFileDescription className="mr-2 h-4 w-4" />
          Isi Ringkasan Medis Pulang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Ringkasan Medis Pulang (Resume Medis)</DialogTitle>
          <DialogDescription>
            Pasien: <strong>{patientName}</strong>
            <br />
            <span className="text-destructive flex items-center gap-1 pt-2">
              <IconLock className="h-4 w-4" />
              Setelah disimpan, visit akan terkunci (status: ready_for_billing)
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Admission Diagnosis */}
            <FormField
              control={form.control}
              name="admissionDiagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Masuk *</FormLabel>
                  <FormControl>
                    <Input placeholder="Diagnosis saat masuk RS (ICD-10)" {...field} />
                  </FormControl>
                  <FormDescription>Diagnosis awal saat pasien masuk RS</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discharge Diagnosis */}
            <FormField
              control={form.control}
              name="dischargeDiagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Pulang *</FormLabel>
                  <FormControl>
                    <Input placeholder="Diagnosis saat pulang (ICD-10)" {...field} />
                  </FormControl>
                  <FormDescription>Diagnosis akhir saat pasien pulang</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinical Summary */}
            <FormField
              control={form.control}
              name="clinicalSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ringkasan Klinis *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ringkasan perjalanan penyakit dan perawatan selama di RS..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Rangkuman kondisi dan perawatan pasien selama rawat inap
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Procedures Performed */}
            <FormField
              control={form.control}
              name="proceduresPerformed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tindakan yang Dilakukan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Daftar tindakan medis yang sudah dilakukan (dokumentasi)..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tindakan yang sudah dilakukan dan dibilling (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications on Discharge */}
            <FormField
              control={form.control}
              name="medicationsOnDischarge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obat untuk Dibawa Pulang</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Resep obat yang harus dibeli untuk lanjutan terapi di rumah..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Obat yang harus dilanjutkan di rumah (opsional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discharge Instructions */}
            <FormField
              control={form.control}
              name="dischargeInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi Pulang *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruksi perawatan luka, aktivitas, dll..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Instruksi untuk pasien di rumah</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dietary Restrictions */}
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pantangan Makanan</FormLabel>
                  <FormControl>
                    <Input placeholder="Makanan yang harus dihindari..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activity Restrictions */}
            <FormField
              control={form.control}
              name="activityRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pembatasan Aktivitas</FormLabel>
                  <FormControl>
                    <Input placeholder="Aktivitas yang harus dihindari..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow Up Date */}
            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Kontrol</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                      onChange={(e) => {
                        const dateValue = e.target.value ? new Date(e.target.value) : null
                        field.onChange(dateValue)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow Up Instructions */}
            <FormField
              control={form.control}
              name="followUpInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi Kontrol</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruksi untuk kunjungan kontrol berikutnya..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan & Kunci Visit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
