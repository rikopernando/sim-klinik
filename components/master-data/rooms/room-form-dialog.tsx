"use client"

/**
 * Room Form Dialog Component
 * Dialog for creating and editing rooms
 */

import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Room Number */}
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nomor Kamar <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="101, 201A, dll" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Room Type */}
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Kamar <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe kamar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bed Count */}
              <FormField
                control={form.control}
                name="bedCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jumlah Bed <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Daily Rate */}
              <FormField
                control={form.control}
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tarif Harian (Rp) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <CurrencyInput
                        min="0"
                        step="1000"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="100.000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Floor */}
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lantai</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1, 2, 3, dll" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Building */}
              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gedung</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Gedung A, Gedung Utama, dll" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              {/* Facilities */}
              <FormField
                control={form.control}
                name="facilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fasilitas</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="AC, TV, Kamar Mandi Dalam, dll (pisahkan dengan koma)"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Catatan tambahan tentang kamar" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
