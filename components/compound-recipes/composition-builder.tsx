/**
 * Composition Builder Component
 * For adding/removing drug ingredients in compound recipes
 * Shows ingredient prices and calculates total cost
 */

"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NumericFormat } from "react-number-format"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useDrugSearch, type Drug } from "@/hooks/use-drug-search"
import type { CompoundIngredient } from "@/types/compound-recipe"

/**
 * Format number to Indonesian Rupiah
 */
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`
}

interface CompositionBuilderProps {
  value: CompoundIngredient[]
  onChange: (value: CompoundIngredient[]) => void
  onTotalChange?: (total: number) => void // Callback when total price changes
  error?: string
}

export function CompositionBuilder({
  value,
  onChange,
  onTotalChange,
  error,
}: CompositionBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const { drugs, isSearching } = useDrugSearch(searchQuery)

  // Calculate total price of all ingredients
  const totalPrice = useMemo(() => {
    return value.reduce((sum, ingredient) => {
      const price = ingredient.price || 0
      return sum + price * ingredient.quantity
    }, 0)
  }, [value])

  // Track previous total to avoid unnecessary callbacks
  const prevTotalRef = useRef<number>(totalPrice)

  // Emit total price only when it actually changes
  useEffect(() => {
    if (prevTotalRef.current !== totalPrice) {
      prevTotalRef.current = totalPrice
      onTotalChange?.(totalPrice)
    }
  }, [totalPrice, onTotalChange])

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
      price: parseFloat(drug.price) || 0, // Store the drug price
    }

    onChange([...value, newIngredient])
    setSearchQuery("")
    setShowDropdown(false)
  }

  const handleRemoveIngredient = (drugId: string) => {
    onChange(value.filter((i) => i.drugId !== drugId))
  }

  const handleUpdateQuantity = (drugId: string, quantity: number) => {
    onChange(value.map((i) => (i.drugId === drugId ? { ...i, quantity } : i)))
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
          {value.map((ingredient, index) => {
            const subtotal = (ingredient.price || 0) * ingredient.quantity
            return (
              <div key={ingredient.drugId} className="bg-muted/50 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm font-medium">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ingredient.drugName}</p>
                    {ingredient.price !== undefined && ingredient.price > 0 && (
                      <p className="text-muted-foreground text-xs">
                        @ {formatRupiah(ingredient.price)}/{ingredient.unit}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <NumericFormat
                      customInput={Input}
                      value={ingredient.quantity}
                      onValueChange={({ floatValue }) =>
                        handleUpdateQuantity(ingredient.drugId, floatValue ?? 1)
                      }
                      decimalSeparator=","
                      thousandSeparator="."
                      decimalScale={3}
                      allowNegative={false}
                      isAllowed={({ floatValue }) => !floatValue || floatValue > 0}
                      className="w-24"
                      placeholder="0"
                    />
                    <Input
                      value={ingredient.unit}
                      className="w-20 disabled:cursor-default disabled:opacity-70"
                      placeholder="Unit"
                      disabled
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
                {/* Subtotal per ingredient */}
                {ingredient.price !== undefined && ingredient.price > 0 && (
                  <div className="mt-1 ml-6 text-right">
                    <span className="text-muted-foreground text-xs">
                      Subtotal:{" "}
                      <span className="text-foreground font-medium">{formatRupiah(subtotal)}</span>
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Total Price */}
          {totalPrice > 0 && (
            <div className="bg-primary/5 flex items-center justify-between rounded-lg border border-dashed p-3">
              <span className="text-sm font-medium">Total Harga Bahan:</span>
              <span className="text-primary text-lg font-semibold">{formatRupiah(totalPrice)}</span>
            </div>
          )}
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
