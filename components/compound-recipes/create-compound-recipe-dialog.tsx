/**
 * Create Compound Recipe Dialog
 */

"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CompositionBuilder } from "./composition-builder"
import { useCreateCompoundRecipe } from "@/hooks/use-compound-recipes"
import type { CompoundIngredient, CreateCompoundRecipeInput } from "@/types/compound-recipe"

interface CreateCompoundRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const initialFormData: CreateCompoundRecipeInput = {
  code: "",
  name: "",
  description: "",
  composition: [],
  defaultInstructions: "",
  defaultFrequency: "",
  price: undefined,
}

export function CreateCompoundRecipeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompoundRecipeDialogProps) {
  const [formData, setFormData] = useState<CreateCompoundRecipeInput>(initialFormData)
  const [compositionError, setCompositionError] = useState<string | null>(null)
  const { createRecipe, isCreating, error } = useCreateCompoundRecipe()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate composition
    if (formData.composition.length < 2) {
      setCompositionError("Minimal harus ada 2 bahan")
      return
    }

    setCompositionError(null)

    try {
      await createRecipe(formData)
      toast.success("Obat racik berhasil ditambahkan!")
      setFormData(initialFormData)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal menambahkan obat racik"
      toast.error(errorMessage)
    }
  }

  const handleCompositionChange = (composition: CompoundIngredient[]) => {
    setFormData({ ...formData, composition })
    if (composition.length >= 2) {
      setCompositionError(null)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData(initialFormData)
      setCompositionError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Obat Racik</DialogTitle>
          <DialogDescription>
            Buat resep obat racik baru. Dokter dapat memilih resep ini saat membuat resep.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Kode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: CR-001"
                required
              />
              <p className="text-muted-foreground text-xs">
                Hanya huruf kapital, angka, dan tanda hubung
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Puyer Batuk Anak"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi obat racik (opsional)"
              rows={2}
            />
          </div>

          <CompositionBuilder
            value={formData.composition}
            onChange={handleCompositionChange}
            error={compositionError || undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultFrequency">Frekuensi Default</Label>
              <Input
                id="defaultFrequency"
                value={formData.defaultFrequency || ""}
                onChange={(e) => setFormData({ ...formData, defaultFrequency: e.target.value })}
                placeholder="Contoh: 3 x 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga per Unit</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Contoh: 15000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultInstructions">Aturan Pakai Default</Label>
            <Textarea
              id="defaultInstructions"
              value={formData.defaultInstructions || ""}
              onChange={(e) => setFormData({ ...formData, defaultInstructions: e.target.value })}
              placeholder="Contoh: Diminum setelah makan"
              rows={2}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isCreating}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
