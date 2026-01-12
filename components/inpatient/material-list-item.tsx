/**
 * Material List Item Component
 * Displays a single material in the search dropdown
 * Separated for better modularity and performance
 */

import { memo } from "react"
import { IconPackage } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { Material } from "@/types/material"
import { getMaterialStockStatus } from "@/types/material"

interface MaterialListItemProps {
  material: Material
  isActive: boolean
  onClick: () => void
}

export const MaterialListItem = memo(function MaterialListItem({
  material,
  isActive,
  onClick,
}: MaterialListItemProps) {
  const stockStatus = getMaterialStockStatus(material)
  const isOutOfStock = stockStatus === "out_of_stock"
  const isLowStock = stockStatus === "low_stock"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent focus:bg-accent focus:outline-none",
        isActive && "bg-accent",
        isOutOfStock && "opacity-50"
      )}
    >
      <IconPackage className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />

      <div className="flex-1 space-y-1">
        {/* Name and Price */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm leading-none font-medium">{material.name}</p>
          <span className="text-muted-foreground text-xs">
            Rp {parseFloat(material.price).toLocaleString("id-ID")}
          </span>
        </div>

        {/* Category and Stock */}
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          {material.category && <span>{material.category}</span>}
          {material.category && <span>•</span>}
          <span
            className={cn(
              isOutOfStock && "text-destructive font-medium",
              isLowStock && "font-medium text-orange-500"
            )}
          >
            Stok: {material.totalStock} {material.unit}
          </span>
        </div>

        {/* Description */}
        {material.description && (
          <p className="text-muted-foreground line-clamp-1 text-xs">{material.description}</p>
        )}

        {/* Out of Stock Warning */}
        {isOutOfStock && <p className="text-destructive text-xs font-medium">Stok habis</p>}

        {/* Low Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <p className="text-xs font-medium text-orange-500">
            Stok menipis (minimum: {material.minimumStock} {material.unit})
          </p>
        )}
      </div>
    </button>
  )
})
