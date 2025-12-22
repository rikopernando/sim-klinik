"use client"

/**
 * Room Form Dialog Component
 * Dialog for creating and editing rooms
 */

import { useState, useEffect } from "react"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { Room, RoomCreateInput } from "@/types/rooms"
import { ROOM_TYPES } from "@/lib/constants/rooms"
import { CurrencyInput } from "@/components/ui/currency-input"

interface RoomFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RoomCreateInput) => Promise<void>
  room?: Room | null
  mode: "create" | "edit"
}

export function RoomFormDialog({ open, onOpenChange, onSubmit, room, mode }: RoomFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<RoomCreateInput>({
    roomNumber: "",
    roomType: "",
    bedCount: 1,
    floor: "",
    building: "",
    dailyRate: "",
    facilities: "",
    description: "",
  })

  // Reset form when dialog opens/closes or room changes
  useEffect(() => {
    if (open && room && mode === "edit") {
      setFormData({
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
      setFormData({
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
  }, [open, room, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="grid grid-cols-2 gap-4">
            {/* Room Number */}
            <Field>
              <FieldLabel htmlFor="roomNumber">
                Nomor Kamar <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="101, 201A, dll"
                required
              />
            </Field>

            {/* Room Type */}
            <Field>
              <FieldLabel htmlFor="roomType">
                Tipe Kamar <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={formData.roomType}
                onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                required
              >
                <SelectTrigger>
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
            </Field>

            {/* Bed Count */}
            <Field>
              <FieldLabel htmlFor="bedCount">
                Jumlah Bed <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="bedCount"
                type="number"
                min="1"
                value={formData.bedCount}
                onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) })}
                required
              />
            </Field>

            {/* Daily Rate */}
            <Field>
              <FieldLabel htmlFor="dailyRate">
                Tarif Harian (Rp) <span className="text-destructive">*</span>
              </FieldLabel>
              <CurrencyInput
                id="dailyRate"
                min="0"
                step="1000"
                value={formData.dailyRate}
                onValueChange={(value) => setFormData({ ...formData, dailyRate: value })}
                placeholder="100.000"
                required
              />
            </Field>

            {/* Floor */}
            <Field>
              <FieldLabel htmlFor="floor">Lantai</FieldLabel>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1, 2, 3, dll"
              />
            </Field>

            {/* Building */}
            <Field>
              <FieldLabel htmlFor="building">Gedung</FieldLabel>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Gedung A, Gedung Utama, dll"
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            {/* Facilities */}
            <Field>
              <FieldLabel htmlFor="facilities">Fasilitas</FieldLabel>
              <Textarea
                id="facilities"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                placeholder="AC, TV, Kamar Mandi Dalam, dll (pisahkan dengan koma)"
                rows={3}
              />
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Catatan tambahan tentang kamar"
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
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
