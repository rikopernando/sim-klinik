"use client"

/**
 * Room Form Dialog Component
 * Dialog for creating and editing rooms
 */

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { Room, RoomCreateInput } from "@/types/rooms"
import { ROOM_TYPES } from "@/lib/constants/rooms"
import { CurrencyInput } from "@/components/ui/currency-input"
import { roomCreateSchema } from "@/lib/validations/rooms"

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RoomCreateInput) => Promise<void>
  room?: Room | null
  mode: "create" | "edit"
}

export function RoomFormDialog({ open, onOpenChange, onSubmit, room, mode }: RoomFormDialogProps) {
  const form = useForm<RoomCreateInput>({
    resolver: zodResolver(roomCreateSchema),
    defaultValues: {
      roomNumber: "",
      roomType: "",
      bedCount: 1,
      floor: "",
      building: "",
      dailyRate: "",
      facilities: "",
      description: "",
    },
  })

  // Reset form when dialog opens/closes or room changes
  useEffect(() => {
    if (open && room && mode === "edit") {
      form.reset({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        bedCount: room.bedCount,
        floor: room.floor || "",
        building: room.building || "",
        dailyRate: room.dailyRate,
        facilities: room.facilities || "",
        description: room.description || "",
      })
    } else if (open && mode === "create") {
      form.reset({
        roomNumber: "",
        roomType: "",
        bedCount: 1,
        floor: "",
        building: "",
        dailyRate: "",
        facilities: "",
        description: "",
      })
    }
  }, [open, room, mode, form])

  const handleSubmit = async (data: RoomCreateInput) => {
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
      console.error("Form submission error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Kamar Baru" : "Edit Kamar"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Isi form di bawah untuk menambah kamar baru"
              : "Ubah informasi kamar"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-2 gap-4">
            {/* Room Number */}
            <Field>
              <FieldLabel htmlFor="roomNumber">
                Nomor Kamar <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <Input id="roomNumber" {...field} placeholder="101, 201A, dll" />
                )}
              />
              <FieldError errors={[form.formState.errors.roomNumber]} />
            </Field>

            {/* Room Type */}
            <Field>
              <FieldLabel htmlFor="roomType">
                Tipe Kamar <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="roomType">
                      <SelectValue placeholder="Pilih tipe kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.roomType]} />
            </Field>

            {/* Bed Count */}
            <Field>
              <FieldLabel htmlFor="bedCount">
                Jumlah Bed <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={form.control}
                name="bedCount"
                render={({ field }) => (
                  <Input
                    id="bedCount"
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.bedCount]} />
            </Field>

            {/* Daily Rate */}
            <Field>
              <FieldLabel htmlFor="dailyRate">
                Tarif Harian (Rp) <span className="text-destructive">*</span>
              </FieldLabel>
              <Controller
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <CurrencyInput
                    id="dailyRate"
                    min="0"
                    step="1000"
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="100.000"
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.dailyRate]} />
            </Field>

            {/* Floor */}
            <Field>
              <FieldLabel htmlFor="floor">Lantai</FieldLabel>
              <Controller
                control={form.control}
                name="floor"
                render={({ field }) => <Input id="floor" {...field} placeholder="1, 2, 3, dll" />}
              />
              <FieldError errors={[form.formState.errors.floor]} />
            </Field>

            {/* Building */}
            <Field>
              <FieldLabel htmlFor="building">Gedung</FieldLabel>
              <Controller
                control={form.control}
                name="building"
                render={({ field }) => (
                  <Input id="building" {...field} placeholder="Gedung A, Gedung Utama, dll" />
                )}
              />
              <FieldError errors={[form.formState.errors.building]} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            {/* Facilities */}
            <Field>
              <FieldLabel htmlFor="facilities">Fasilitas</FieldLabel>
              <Controller
                control={form.control}
                name="facilities"
                render={({ field }) => (
                  <Textarea
                    id="facilities"
                    {...field}
                    placeholder="AC, TV, Kamar Mandi Dalam, dll (pisahkan dengan koma)"
                    rows={3}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.facilities]} />
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Catatan tambahan tentang kamar"
                    rows={3}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Menyimpan..."
                : mode === "create"
                  ? "Tambah Kamar"
                  : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
