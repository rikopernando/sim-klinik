"use client"

/**
 * Delete Room Alert Dialog Component
 * Confirmation dialog for deleting rooms
 */

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Room } from "@/types/rooms"

interface DeleteRoomAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onConfirm: (roomId: string) => Promise<void>
}

export function DeleteRoomAlert({ open, onOpenChange, room, onConfirm }: DeleteRoomAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!room) return

    setIsDeleting(true)
    try {
      await onConfirm(room.id)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!room) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kamar?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Apakah Anda yakin ingin menghapus kamar{" "}
              <span className="text-foreground font-semibold">{room.roomNumber}</span> (
              {room.roomType})?
            </p>
            <p className="text-sm">
              Kamar akan dinonaktifkan dan tidak akan muncul dalam daftar aktif. Tindakan ini tidak
              dapat dibatalkan.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Menghapus..." : "Hapus Kamar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
