"use client"

/**
 * Patient Handover Dialog
 * Transfers ER patients to other departments
 */

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

// Hooks
import { useHandover } from "@/hooks/use-handover"

/**
 * Form Schema
 */
const formSchema = z.object({
  newVisitType: z.enum(["outpatient", "inpatient"], {
    message: "Jenis kunjungan baru wajib dipilih",
  }),
  poliId: z.string().optional(),
  roomId: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface HandoverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function HandoverDialog({
  open,
  onOpenChange,
  visitId,
  patientName,
  onSuccess,
}: HandoverDialogProps) {
  // Use handover hook
  const { handover, isSubmitting, error, success } = useHandover(() => {
    // Close dialog after success
    setTimeout(() => {
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    }, 1500)
  })

  // Form hook
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const newVisitType = watch("newVisitType")

  /**
   * Submit handler
   */
  const onSubmit = async (data: FormData) => {
    await handover({
      visitId,
      newVisitType: data.newVisitType,
      poliId: data.poliId ? parseInt(data.poliId) : undefined,
      roomId: data.roomId ? parseInt(data.roomId) : undefined,
      notes: data.notes,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Handover Pasien UGD</DialogTitle>
          <DialogDescription>
            Transfer pasien <strong>{patientName}</strong> ke unit lain
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Handover berhasil dilakukan!</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Select New Visit Type */}
          <div className="space-y-2">
            <Label htmlFor="newVisitType">
              Transfer ke <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("newVisitType", value as "outpatient" | "inpatient")
              }
            >
              <SelectTrigger className={errors.newVisitType ? "border-destructive" : ""}>
                <SelectValue placeholder="Pilih jenis kunjungan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outpatient">🏥 Rawat Jalan (Outpatient)</SelectItem>
                <SelectItem value="inpatient">🛏️ Rawat Inap (Inpatient)</SelectItem>
              </SelectContent>
            </Select>
            {errors.newVisitType && (
              <p className="text-destructive text-sm">{errors.newVisitType.message}</p>
            )}
          </div>

          {/* Conditional: Poli Selection for Outpatient */}
          {newVisitType === "outpatient" && (
            <div className="space-y-2">
              <Label htmlFor="poliId">
                Pilih Poli <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("poliId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih poli tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Poli Umum</SelectItem>
                  <SelectItem value="2">Poli Gigi</SelectItem>
                  <SelectItem value="3">Poli Anak</SelectItem>
                  <SelectItem value="4">Poli Kandungan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conditional: Room Selection for Inpatient */}
          {newVisitType === "inpatient" && (
            <div className="space-y-2">
              <Label htmlFor="roomId">
                Pilih Kamar <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("roomId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kamar tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Kamar 101 - Kelas 3</SelectItem>
                  <SelectItem value="2">Kamar 102 - Kelas 3</SelectItem>
                  <SelectItem value="3">Kamar 201 - Kelas 2</SelectItem>
                  <SelectItem value="4">Kamar 202 - Kelas 2</SelectItem>
                  <SelectItem value="5">Kamar 301 - Kelas 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Handover Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Handover</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Catatan untuk tim yang menerima pasien..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !newVisitType}>
              <ArrowRight className="mr-2 h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Handover Pasien"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
