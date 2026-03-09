/**
 * Create Compound Recipe Dialog
 * 2-step wizard for creating compound medications
 */

"use client"

import { useState } from "react"
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
import { CurrencyInput } from "@/components/ui/currency-input"
import { toast } from "sonner"
import { FormStepIndicator } from "@/components/patients/form-step-indicator"
import { WizardNavigation } from "@/components/patients/wizard-navigation"
import { CompositionBuilder } from "./composition-builder"
import { useCreateCompoundRecipe } from "@/hooks/use-compound-recipes"
import type { CompoundIngredient, CreateCompoundRecipeInput } from "@/types/compound-recipe"

interface CreateCompoundRecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STEPS = [
  { number: 1, label: "Informasi Dasar" },
  { number: 2, label: "Komposisi" },
]

const initialFormData: CreateCompoundRecipeInput = {
  name: "",
  description: "",
  composition: [],
  defaultInstructions: "",
  defaultFrequency: "",
  price: 0,
}

export function CreateCompoundRecipeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompoundRecipeDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateCompoundRecipeInput>(initialFormData)
  const [compositionError, setCompositionError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const { createRecipe, isCreating, error } = useCreateCompoundRecipe()

  // Step 1 validation
  const isStep1Valid = formData.name.trim() !== ""

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

    // Only submit on step 2
    if (currentStep !== 2) {
      return
    }

    // Validate composition
    if (formData.composition.length < 2) {
      setCompositionError("Minimal harus ada 2 bahan")
      return
    }

    // Validate price
    if (!formData.price || formData.price < 100) {
      setPriceError("Harga minimal Rp 100")
      return
    }

    setCompositionError(null)
    setPriceError(null)

    try {
      await createRecipe(formData)
      toast.success("Obat racik berhasil ditambahkan!")
      setFormData(initialFormData)
      setCurrentStep(1)
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
      setPriceError(null)
      setCurrentStep(1)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Obat Racik</DialogTitle>
          <DialogDescription>
            Buat resep obat racik baru. Kode akan di-generate otomatis.
          </DialogDescription>
        </DialogHeader>

        <FormStepIndicator steps={STEPS} currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Obat Racik <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Puyer Batuk Anak"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat obat racik"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Composition & Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
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
                  <Label htmlFor="price">
                    Harga per Unit <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      Rp
                    </span>
                    <CurrencyInput
                      id="price"
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
                <Label htmlFor="defaultInstructions">Aturan Pakai Default</Label>
                <Textarea
                  id="defaultInstructions"
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
            isSubmitting={isCreating}
            isStep1Valid={isStep1Valid}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={() => handleClose(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
