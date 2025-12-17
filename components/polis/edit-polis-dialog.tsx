"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PayloadPoli, ResultPoli } from "@/types/poli"

interface EditPolisDialogProps {
  polis: ResultPoli | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onSubmit?: (id: string, payload: PayloadPoli) => Promise<void>
}

export function EditPolisDialog({
  polis,
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}: EditPolisDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", description: "", isActive: "" })

  useEffect(() => {
    if (polis) {
      setFormData({
        name: polis.name,
        code: polis.code,
        description: polis.description,
        isActive: polis.isActive,
      })
    }
  }, [polis])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!polis) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (onSubmit) {
        await onSubmit(polis.id, formData)
        onOpenChange(false)
        toast.success("Poli berhasil diupdate!")
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update poli"
      setError(errorMessage)
      toast.error(`Gagal mengupdate poli: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!polis) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Poli</DialogTitle>
          <DialogDescription>Ubah informasi poli</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-code">Kode</Label>
            <Input
              id="edit-code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Masukkan kode"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Input
              id="edit-description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Masukkan deskripsi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
              required
            >
              <option value="">Pilih status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
