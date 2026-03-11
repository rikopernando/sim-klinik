/**
 * View Compound Recipe Dialog
 * Shows details of a compound recipe
 */

"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

interface ViewCompoundRecipeDialogProps {
  recipe: CompoundRecipeWithCreator | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewCompoundRecipeDialog({
  recipe,
  open,
  onOpenChange,
}: ViewCompoundRecipeDialogProps) {
  if (!recipe) return null

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-"
    const numPrice = parseFloat(price)
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {recipe.name}
            {recipe.isActive ? (
              <Badge className="bg-green-600">Aktif</Badge>
            ) : (
              <Badge variant="secondary">Non-aktif</Badge>
            )}
          </DialogTitle>
          <DialogDescription>Detail obat racik</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Kode</p>
              <p className="font-mono font-medium">{recipe.code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Harga</p>
              <p className="font-medium">{formatPrice(recipe.price)}</p>
            </div>
          </div>

          {recipe.description && (
            <div className="text-sm">
              <p className="text-muted-foreground">Deskripsi</p>
              <p>{recipe.description}</p>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Komposisi ({recipe.composition.length} bahan)
            </p>
            <div className="space-y-2">
              {recipe.composition.map((ingredient, idx) => (
                <div
                  key={ingredient.drugId}
                  className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2"
                >
                  <span className="text-sm">
                    <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                    {ingredient.drugName}
                  </span>
                  <Badge variant="outline">
                    {ingredient.quantity} {ingredient.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {recipe.defaultFrequency && (
              <div>
                <p className="text-muted-foreground">Frekuensi Default</p>
                <p>{recipe.defaultFrequency}</p>
              </div>
            )}
            {recipe.defaultInstructions && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Aturan Pakai Default</p>
                <p>{recipe.defaultInstructions}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              Dibuat {format(new Date(recipe.createdAt), "dd MMM yyyy HH:mm")}
              {recipe.creator && ` oleh ${recipe.creator.name}`}
            </span>
            <span>Diperbarui {format(new Date(recipe.updatedAt), "dd MMM yyyy HH:mm")}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
