/**
 * Transfer Bed Dialog Component
 * Allows nurses to transfer patients to different beds
 */

"use client"

import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, MoveHorizontalIcon } from "lucide-react"

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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAvailableRooms } from "@/hooks/use-available-rooms"
import { useBedTransfer } from "@/hooks/use-bed-transfer"
import { bedTransferSchema } from "@/lib/inpatient/validation"

const transferBedFormSchema = bedTransferSchema.omit({ visitId: true })

type TransferBedFormData = z.infer<typeof transferBedFormSchema>

interface TransferBedDialogProps {
  visitId: string
  patientName: string
  currentRoomNumber?: string
  currentBedNumber?: string
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function TransferBedDialog({
  visitId,
  patientName,
  currentRoomNumber,
  currentBedNumber,
  onSuccess,
  trigger,
}: TransferBedDialogProps) {
  const [open, setOpen] = useState(false)

  const { rooms: availableRooms, isLoading: isLoadingRooms } = useAvailableRooms()

  const form = useForm<TransferBedFormData>({
    resolver: zodResolver(transferBedFormSchema),
    defaultValues: {
      newRoomId: "",
      newBedNumber: "",
      transferReason: "",
    },
  })

  const { transfer, isTransferring } = useBedTransfer({
    onSuccess: () => {
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
  })

  // Watch the selected room to generate bed options
  const selectedRoomId = form.watch("newRoomId")

  const selectedRoom = useMemo(() => {
    return availableRooms.find((r) => r.id === selectedRoomId)
  }, [selectedRoomId, availableRooms])

  // Generate bed options based on selected room
  const bedOptions = useMemo(() => {
    if (!selectedRoom) return []
    return Array.from({ length: selectedRoom.bedCount }, (_, i) => (i + 1).toString())
  }, [selectedRoom])

  const handleSubmit = async (data: TransferBedFormData) => {
    await transfer({
      visitId,
      ...data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MoveHorizontalIcon className="h-4 w-4" />
            Transfer Bed
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Bed Pasien</DialogTitle>
          <DialogDescription>
            Transfer {patientName}
            {currentRoomNumber &&
              currentBedNumber &&
              ` dari Kamar ${currentRoomNumber} Bed ${currentBedNumber}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup>
            {/* Room Selection */}
            <Field>
              <FieldLabel htmlFor="newRoomId">Kamar Tujuan *</FieldLabel>
              <Controller
                control={form.control}
                name="newRoomId"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Reset bed number when room changes
                      form.setValue("newBedNumber", "")
                    }}
                    value={field.value}
                    disabled={isLoadingRooms}
                  >
                    <SelectTrigger id="newRoomId">
                      <SelectValue placeholder="Pilih kamar tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRooms ? (
                        <SelectItem value="loading" disabled>
                          Memuat kamar...
                        </SelectItem>
                      ) : availableRooms.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Tidak ada kamar tersedia
                        </SelectItem>
                      ) : (
                        availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Kamar {room.roomNumber} - {room.roomType} ({room.availableBeds}/
                            {room.bedCount} tersedia)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.newRoomId]} />
            </Field>

            {/* Bed Number Selection */}
            <Field>
              <FieldLabel htmlFor="newBedNumber">Nomor Bed *</FieldLabel>
              <Controller
                control={form.control}
                name="newBedNumber"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedRoom || bedOptions.length === 0}
                  >
                    <SelectTrigger id="newBedNumber">
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
                )}
              />
              <FieldError errors={[form.formState.errors.newBedNumber]} />
            </Field>

            {/* Transfer Reason */}
            <Field>
              <FieldLabel htmlFor="transferReason">Alasan Transfer *</FieldLabel>
              <Controller
                control={form.control}
                name="transferReason"
                render={({ field }) => (
                  <Textarea
                    id="transferReason"
                    {...field}
                    placeholder="Contoh: Permintaan keluarga, Kebutuhan isolasi, dll."
                    rows={3}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.transferReason]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isTransferring}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isTransferring}>
              {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer Bed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
