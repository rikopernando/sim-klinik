/**
 * Compound Recipe Search Component
 * Search and select compound recipes (obat racik) for prescriptions
 */

import { useState } from "react"
import { Beaker, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useActiveCompoundRecipes } from "@/hooks/use-compound-recipes"
import { CreateCompoundRecipeDialog } from "@/components/compound-recipes/create-compound-recipe-dialog"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

interface CompoundRecipeSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (recipe: CompoundRecipeWithCreator) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function CompoundRecipeSearch({
  value,
  onChange,
  onSelect,
  label = "Cari Obat Racik",
  placeholder = "Ketik nama obat racik...",
  required = false,
}: CompoundRecipeSearchProps) {
  const [showDropdown, setShowDropdown] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { recipes = [], isLoading } = useActiveCompoundRecipes({
    search: searchQuery,
    enabled: searchQuery.length >= 2,
  })

  const handleRecipeCreated = (recipe: CompoundRecipeWithCreator) => {
    // Auto-select the newly created recipe
    setShowDropdown(false)
    setSearchQuery("")
    onSelect(recipe)
  }

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue)
    onChange(newValue)
    setShowDropdown(true)
  }

  const handleSelect = (recipe: CompoundRecipeWithCreator) => {
    setShowDropdown(false)
    setSearchQuery("")
    onSelect(recipe)
  }

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-"
    return `Rp ${parseFloat(price).toLocaleString("id-ID")}`
  }

  return (
    <>
      <FieldLabel htmlFor="compoundRecipeSearch">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <div className="relative">
        {isLoading ? (
          <Spinner className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        ) : (
          <Beaker className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}
        <Input
          id="compoundRecipeSearch"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
        {searchQuery && searchQuery.length >= 2 && showDropdown && (
          <div className="bg-background absolute z-[9999] mt-2 max-h-60 w-full space-y-1 overflow-y-auto rounded-md border p-2 shadow-md">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => handleSelect(recipe)}
                className="hover:bg-accent w-full rounded px-2 py-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {recipe.code}
                    </Badge>
                    <span className="text-sm font-medium">{recipe.name}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{formatPrice(recipe.price)}</span>
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {recipe.composition.length} bahan
                  {recipe.defaultFrequency && ` • ${recipe.defaultFrequency}`}
                </div>
              </button>
            ))}

            {/* No results message */}
            {!isLoading && recipes.length === 0 && (
              <div className="text-muted-foreground px-2 py-2 text-center text-sm">
                Tidak ada obat racik ditemukan
              </div>
            )}

            {/* Add New Recipe Button - Always visible at bottom */}
            <div className="border-t pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary w-full justify-start gap-2"
                onClick={() => {
                  setShowDropdown(false)
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Tambah Obat Racik Baru
              </Button>
            </div>
          </div>
        )}
      </div>
      {isLoading && <FieldDescription>Mencari obat racik...</FieldDescription>}

      {/* Create Compound Recipe Dialog */}
      <CreateCompoundRecipeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleRecipeCreated}
      />
    </>
  )
}
