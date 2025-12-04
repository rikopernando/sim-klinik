"use client"

/**
 * Edit Visit Dialog Component (B.6)
 * Allows updating visit information
 */

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

/**
 * Visit Update Schema
 */
const visitUpdateSchema = z.object({
  visitType: z.enum(["outpatient", "inpatient", "emergency"]).optional(),
  poliId: z.number().int().positive().optional(),
  doctorId: z.string().optional(),
  roomId: z.number().int().positive().optional(),
  triageStatus: z.enum(["red", "yellow", "green"]).optional(),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
})

type VisitUpdateData = z.infer<typeof visitUpdateSchema>

interface EditVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitId: string
  initialData?: Partial<VisitUpdateData & { visitNumber: string; patientName: string }>
  onSuccess?: () => void
}

export function EditVisitDialog({
  open,
  onOpenChange,
  visitId,
  initialData,
  onSuccess,
}: EditVisitDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<VisitUpdateData>({
    resolver: zodResolver(visitUpdateSchema),
    defaultValues: initialData,
  })

  const visitType = watch("visitType")

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && initialData) {
      reset(initialData)
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: VisitUpdateData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/visits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: visitId,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui data kunjungan")
      }

      toast({
        title: "Berhasil",
        description: "Data kunjungan berhasil diperbarui",
      })

      // Close dialog
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Update visit error:", error)
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Kunjungan</DialogTitle>
          <DialogDescription>
            {initialData?.visitNumber && `Nomor Kunjungan: ${initialData.visitNumber}`}
            {initialData?.patientName && ` - ${initialData.patientName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Visit Type */}
          <div>
            <Label htmlFor="visitType">Jenis Kunjungan</Label>
            <Select
              onValueChange={(value) =>
                setValue("visitType", value as "outpatient" | "inpatient" | "emergency")
              }
              defaultValue={initialData?.visitType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kunjungan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outpatient">Rawat Jalan</SelectItem>
                <SelectItem value="inpatient">Rawat Inap</SelectItem>
                <SelectItem value="emergency">UGD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Visit Type */}
          {visitType === "outpatient" && (
            <div>
              <Label htmlFor="poliId">ID Poli</Label>
              <Input
                id="poliId"
                type="number"
                {...register("poliId", { valueAsNumber: true })}
                placeholder="Masukkan ID Poli"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Contoh: 1 untuk Poli Umum, 2 untuk Poli Gigi
              </p>
            </div>
          )}

          {visitType === "inpatient" && (
            <div>
              <Label htmlFor="roomId">ID Ruangan</Label>
              <Input
                id="roomId"
                type="number"
                {...register("roomId", { valueAsNumber: true })}
                placeholder="Masukkan ID Ruangan"
              />
            </div>
          )}

          {visitType === "emergency" && (
            <>
              <div>
                <Label htmlFor="triageStatus">Status Triage</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("triageStatus", value as "red" | "yellow" | "green")
                  }
                  defaultValue={initialData?.triageStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status triage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">🔴 Merah (Darurat)</SelectItem>
                    <SelectItem value="yellow">🟡 Kuning (Mendesak)</SelectItem>
                    <SelectItem value="green">🟢 Hijau (Tidak Mendesak)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chiefComplaint">Keluhan Utama</Label>
                <Textarea
                  id="chiefComplaint"
                  {...register("chiefComplaint")}
                  rows={3}
                  placeholder="Keluhan utama pasien"
                />
              </div>
            </>
          )}

          {/* Doctor ID */}
          <div>
            <Label htmlFor="doctorId">ID Dokter (Opsional)</Label>
            <Input id="doctorId" {...register("doctorId")} placeholder="Masukkan ID Dokter" />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              rows={3}
              placeholder="Catatan tambahan untuk kunjungan ini"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
