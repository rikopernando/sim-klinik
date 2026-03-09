/**
 * Edit Compound Recipe Dialog
 * 2-step wizard for editing compound medications
 */

"use client"

import { useState, useEffect, useCallback } from "react"
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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { FormStepIndicator } from "@/components/patients/form-step-indicator"
import { WizardNavigation } from "@/components/patients/wizard-navigation"
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

const STEPS = [
  { number: 1, label: "Informasi Dasar" },
  { number: 2, label: "Komposisi" },
]

export function EditCompoundRecipeDialog({
  recipe,
  open,
  onOpenChange,
  onSuccess,
}: EditCompoundRecipeDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<UpdateCompoundRecipeInput>({})
  const [compositionError, setCompositionError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const { updateRecipe, isUpdating, error } = useUpdateCompoundRecipe()

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
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

  // Step 1 validation
  const isStep1Valid = (formData.name || "").trim() !== ""

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipe) return

    // Only submit on step 2
    if (currentStep !== 2) {
      return
    }

    // Validate composition
    if (formData.composition && formData.composition.length < 2) {
      setCompositionError("Minimal harus ada 2 bahan")
      return
    }

    // Validate price
    if (formData.price !== undefined && formData.price !== null && formData.price < 100) {
      setPriceError("Harga minimal Rp 100")
      return
    }

    setCompositionError(null)
    setPriceError(null)

    try {
      await updateRecipe({ id: recipe.id, data: formData })
      toast.success("Obat racik berhasil diperbarui!")
      setCurrentStep(1)
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

  const handleTotalPriceChange = useCallback((total: number) => {
    // Auto-fill price field when ingredients change
    setFormData((prev) => ({ ...prev, price: total }))
    if (total >= 100) {
      setPriceError(null)
    }
  }, [])

  const handleClose = (open: boolean) => {
    if (!open) {
      setCompositionError(null)
      setPriceError(null)
      setCurrentStep(1)
    }
    onOpenChange(open)
  }

  if (!recipe) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Obat Racik
            <Badge variant="outline" className="font-mono">
              {recipe.code}
            </Badge>
          </DialogTitle>
          <DialogDescription>Edit resep obat racik {recipe.name}</DialogDescription>
        </DialogHeader>

        <FormStepIndicator steps={STEPS} currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nama Obat Racik <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Puyer Batuk Anak"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Deskripsi (opsional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat obat racik"
                  rows={3}
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
            </div>
          )}

          {/* Step 2: Composition & Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <CompositionBuilder
                value={formData.composition || []}
                onChange={handleCompositionChange}
                onTotalChange={handleTotalPriceChange}
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
                  <Label htmlFor="edit-price">
                    Harga per Unit <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      Rp
                    </span>
                    <CurrencyInput
                      id="edit-price"
                      value={formData.price ? formData.price.toString() : ""}
                      onValueChange={(value) => {
                        const numValue = value ? parseInt(value, 10) : 0
                        setFormData({ ...formData, price: numValue })
                        if (numValue >= 100) {
                          setPriceError(null)
                        }
                      }}
                      className="pl-10"
                      placeholder="15.000"
                    />
                  </div>
                  {priceError && <p className="text-destructive text-sm">{priceError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-defaultInstructions">Aturan Pakai Default</Label>
                <Textarea
                  id="edit-defaultInstructions"
                  value={formData.defaultInstructions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultInstructions: e.target.value })
                  }
                  placeholder="Contoh: Diminum setelah makan"
                  rows={2}
                />
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <WizardNavigation
            currentStep={currentStep}
            totalSteps={2}
            isSubmitting={isUpdating}
            isStep1Valid={isStep1Valid}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={() => handleClose(false)}
            submitLabel="Simpan Perubahan"
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
