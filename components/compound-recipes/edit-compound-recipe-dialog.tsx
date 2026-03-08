/**
 * Edit Compound Recipe Dialog
 */

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { CompositionBuilder } from "./composition-builder"
import { useUpdateCompoundRecipe } from "@/hooks/use-compound-recipes"
import type {
  CompoundIngredient,
  CompoundRecipeWithCreator,
  UpdateCompoundRecipeInput,
} from "@/types/compound-recipe"

interface EditCompoundRecipeDialogProps {
  recipe: CompoundRecipeWithCreator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCompoundRecipeDialog({
  recipe,
  open,
  onOpenChange,
  onSuccess,
}: EditCompoundRecipeDialogProps) {
  const [formData, setFormData] = useState<UpdateCompoundRecipeInput>({})
  const [compositionError, setCompositionError] = useState<string | null>(null)
  const { updateRecipe, isUpdating, error } = useUpdateCompoundRecipe()

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
        code: recipe.code,
        name: recipe.name,
        description: recipe.description,
        composition: recipe.composition,
        defaultInstructions: recipe.defaultInstructions,
        defaultFrequency: recipe.defaultFrequency,
        price: recipe.price ? parseFloat(recipe.price) : undefined,
        isActive: recipe.isActive,
      })
    }
  }, [recipe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipe) return

    // Validate composition
    if (formData.composition && formData.composition.length < 2) {
      setCompositionError("Minimal harus ada 2 bahan")
      return
    }

    setCompositionError(null)

    try {
      await updateRecipe({ id: recipe.id, data: formData })
      toast.success("Obat racik berhasil diperbarui!")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gagal memperbarui obat racik"
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
      setCompositionError(null)
    }
    onOpenChange(open)
  }

  if (!recipe) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Obat Racik</DialogTitle>
          <DialogDescription>Edit resep obat racik {recipe.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">
                Kode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-code"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: CR-001"
                required
              />
              <p className="text-muted-foreground text-xs">
                Hanya huruf kapital, angka, dan tanda hubung
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Puyer Batuk Anak"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi obat racik (opsional)"
              rows={2}
            />
          </div>

          <CompositionBuilder
            value={formData.composition || []}
            onChange={handleCompositionChange}
            error={compositionError || undefined}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-defaultFrequency">Frekuensi Default</Label>
              <Input
                id="edit-defaultFrequency"
                value={formData.defaultFrequency || ""}
                onChange={(e) => setFormData({ ...formData, defaultFrequency: e.target.value })}
                placeholder="Contoh: 3 x 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Harga per Unit</Label>
              <Input
                id="edit-price"
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
            <Label htmlFor="edit-defaultInstructions">Aturan Pakai Default</Label>
            <Textarea
              id="edit-defaultInstructions"
              value={formData.defaultInstructions || ""}
              onChange={(e) => setFormData({ ...formData, defaultInstructions: e.target.value })}
              placeholder="Contoh: Diminum setelah makan"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="edit-isActive"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="edit-isActive">Aktif</Label>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isUpdating}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
