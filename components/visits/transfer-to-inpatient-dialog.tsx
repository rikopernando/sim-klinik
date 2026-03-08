"use client"

/**
 * Transfer to Inpatient Dialog
 * Transfers outpatient patients to inpatient care with room/bed selection
 */

import { useMemo, useEffect } from "react"
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
import { ArrowRight, Bed } from "lucide-react"

import { useTransferToInpatient } from "@/hooks/use-transfer-to-inpatient"
import { useAvailableRooms } from "@/hooks/use-available-rooms"

// Form Schema
const formSchema = z.object({
  roomId: z.string().min(1, "Kamar wajib dipilih"),
  bedNumber: z.string().min(1, "Nomor bed wajib dipilih"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TransferToInpatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitId: string
  patientName: string
  onSuccess?: () => void
}

export function TransferToInpatientDialog({
  open,
  onOpenChange,
  visitId,
  patientName,
  onSuccess,
}: TransferToInpatientDialogProps) {
  const { transfer, isSubmitting, reset } = useTransferToInpatient(() => {
    onOpenChange(false)
    if (onSuccess) {
      onSuccess()
    }
  })

  const { rooms, isLoading: roomsLoading, refresh: refreshRooms } = useAvailableRooms()

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset: resetForm,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: "",
      bedNumber: "",
      notes: "",
    },
  })

  const selectedRoomId = watch("roomId")
  const selectedBedNumber = watch("bedNumber")

  // Selected room details
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId)
  }, [rooms, selectedRoomId])

  // Generate bed options based on selected room
  const bedOptions = useMemo(() => {
    if (!selectedRoom) return []
    return Array.from({ length: selectedRoom.bedCount }, (_, i) => (i + 1).toString())
  }, [selectedRoom])

  // Reset bed number when room changes
  useEffect(() => {
    if (selectedRoomId) {
      setValue("bedNumber", "")
    }
  }, [selectedRoomId, setValue])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm()
      reset()
      refreshRooms()
    }
  }, [open, resetForm, reset, refreshRooms])

  const onSubmit = async (data: FormData) => {
    await transfer({
      visitId,
      roomId: data.roomId,
      bedNumber: data.bedNumber,
      notes: data.notes,
    })
  }

  const isValid = selectedRoomId && selectedBedNumber

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Transfer ke Rawat Inap
          </DialogTitle>
          <DialogDescription>
            Transfer pasien <strong>{patientName}</strong> ke rawat inap
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="roomId">
              Pilih Kamar <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRoomId}
              onValueChange={(value) => setValue("roomId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.roomId ? "border-destructive" : ""}>
                <SelectValue placeholder="Pilih kamar yang tersedia" />
              </SelectTrigger>
              <SelectContent>
                {roomsLoading ? (
                  <SelectItem value="loading" disabled>
                    Memuat data kamar...
                  </SelectItem>
                ) : rooms.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Tidak ada kamar tersedia
                  </SelectItem>
                ) : (
                  rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Kamar {room.roomNumber} - {room.roomType} ({room.availableBeds} bed tersedia)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-destructive text-sm">{errors.roomId.message}</p>}
            {selectedRoom && (
              <p className="text-muted-foreground text-xs">
                Tarif: Rp {parseFloat(selectedRoom.dailyRate).toLocaleString("id-ID")}/hari
                {selectedRoom.floor && ` | Lantai ${selectedRoom.floor}`}
              </p>
            )}
          </div>

          {/* Bed Number Selection */}
          <div className="space-y-2">
            <Label htmlFor="bedNumber">
              Nomor Bed <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedBedNumber}
              onValueChange={(value) => setValue("bedNumber", value)}
              disabled={!selectedRoom || isSubmitting}
            >
              <SelectTrigger className={errors.bedNumber ? "border-destructive" : ""}>
                <SelectValue placeholder="Pilih nomor bed" />
              </SelectTrigger>
              <SelectContent>
                {bedOptions.map((bed) => (
                  <SelectItem key={bed} value={bed}>
                    Bed {bed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bedNumber && (
              <p className="text-destructive text-sm">{errors.bedNumber.message}</p>
            )}
          </div>

          {/* Transfer Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Transfer (Opsional)</Label>
            <Textarea
              id="notes"
              onChange={(e) => setValue("notes", e.target.value)}
              placeholder="Catatan untuk perawat rawat inap..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Room Facilities Info */}
          {selectedRoom?.facilities && (
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-sm font-medium">Fasilitas Kamar</p>
              <p className="text-muted-foreground text-xs">{selectedRoom.facilities}</p>
            </div>
          )}

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
            <Button type="submit" disabled={isSubmitting || !isValid}>
              <ArrowRight className="mr-2 h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Transfer ke Rawat Inap"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
