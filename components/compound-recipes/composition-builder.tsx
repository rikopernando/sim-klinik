/**
 * Composition Builder Component
 * For adding/removing drug ingredients in compound recipes
 */

"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useDrugSearch, type Drug } from "@/hooks/use-drug-search"
import type { CompoundIngredient } from "@/types/compound-recipe"

interface CompositionBuilderProps {
  value: CompoundIngredient[]
  onChange: (value: CompoundIngredient[]) => void
  error?: string
}

export function CompositionBuilder({ value, onChange, error }: CompositionBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const { drugs, isSearching } = useDrugSearch(searchQuery)

  const handleAddIngredient = (drug: Drug) => {
    // Check if drug already exists
    if (value.some((i) => i.drugId === drug.id)) {
      return
    }

    const newIngredient: CompoundIngredient = {
      drugId: drug.id,
      drugName: drug.name,
      quantity: 1,
      unit: drug.unit,
    }

    onChange([...value, newIngredient])
    setSearchQuery("")
    setShowDropdown(false)
  }

  const handleRemoveIngredient = (drugId: string) => {
    onChange(value.filter((i) => i.drugId !== drugId))
  }

  const handleUpdateQuantity = (drugId: string, quantity: number) => {
    onChange(
      value.map((i) => (i.drugId === drugId ? { ...i, quantity: Math.max(0.001, quantity) } : i))
    )
  }

  const handleUpdateUnit = (drugId: string, unit: string) => {
    onChange(value.map((i) => (i.drugId === drugId ? { ...i, unit } : i)))
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Komposisi Bahan</Label>
        <p className="text-muted-foreground text-xs">Minimal 2 bahan, maksimal 20 bahan</p>
      </div>

      {/* Drug Search */}
      <div className="relative">
        {isSearching ? (
          <Spinner className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        ) : (
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Cari obat untuk ditambahkan..."
          className="pl-10"
        />
        {drugs.length > 0 && searchQuery && showDropdown && (
          <div className="bg-background absolute z-[9999] mt-2 max-h-40 w-full space-y-1 overflow-y-auto rounded-md border p-2 shadow-md">
            {drugs.map((drug) => {
              const alreadyAdded = value.some((i) => i.drugId === drug.id)
              return (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => !alreadyAdded && handleAddIngredient(drug)}
                  disabled={alreadyAdded}
                  className={`w-full rounded px-2 py-1 text-left text-sm ${
                    alreadyAdded
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {drug.name} {drug.genericName && `(${drug.genericName})`}
                    </span>
                    {alreadyAdded ? (
                      <Badge variant="secondary" className="text-xs">
                        Sudah ditambahkan
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {drug.unit}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Ingredient List */}
      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((ingredient, index) => (
            <div
              key={ingredient.drugId}
              className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3"
            >
              <span className="text-muted-foreground text-sm font-medium">{index + 1}.</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{ingredient.drugName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleUpdateQuantity(ingredient.drugId, parseFloat(e.target.value) || 0.001)
                  }
                  className="w-24"
                />
                <Input
                  value={ingredient.unit}
                  onChange={(e) => handleUpdateUnit(ingredient.drugId, e.target.value)}
                  className="w-20"
                  placeholder="Unit"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveIngredient(ingredient.drugId)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
          Belum ada bahan ditambahkan. Cari dan tambahkan obat di atas.
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {value.length > 0 && value.length < 2 && (
        <p className="text-muted-foreground text-xs">
          Tambahkan minimal {2 - value.length} bahan lagi
        </p>
      )}
    </div>
  )
}
