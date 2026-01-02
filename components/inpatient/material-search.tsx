/**
 * Material Search Component
 * Autocomplete search for materials from unified inventory
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { IconSearch, IconPackage, IconAlertCircle } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useMaterialSearch, type Material } from "@/hooks/use-material-search"
import { cn } from "@/lib/utils"

interface MaterialSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (material: Material) => void
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
}

export function MaterialSearch({
  value,
  onChange,
  onSelect,
  label = "Material",
  placeholder = "Cari material...",
  required = false,
  error,
}: MaterialSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { materials, isLoading, search } = useMaterialSearch()

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    search(newValue)
    setIsOpen(true)
    setFocusedIndex(-1)
  }

  // Handle material selection
  const handleSelect = (material: Material) => {
    onSelect(material)
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setFocusedIndex((prev) => (prev < materials.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (focusedIndex >= 0 && materials[focusedIndex]) {
          handleSelect(materials[focusedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor="material-search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <div className="relative mt-2">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="material-search"
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn("pl-9", error && "border-destructive")}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {materials.length === 0 && !isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <IconAlertCircle className="h-4 w-4" />
              {value ? "Material tidak ditemukan" : "Ketik untuk mencari material"}
            </div>
          )}

          {materials.map((material, index) => (
            <button
              key={material.id}
              type="button"
              onClick={() => handleSelect(material)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                "hover:bg-accent focus:bg-accent focus:outline-none",
                index === focusedIndex && "bg-accent",
                material.totalStock === 0 && "opacity-50"
              )}
            >
              <IconPackage className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium leading-none">{material.name}</p>
                  <span className="text-xs text-muted-foreground">
                    Rp {parseFloat(material.price).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {material.category && <span>{material.category}</span>}
                  <span>•</span>
                  <span className={cn(
                    material.totalStock === 0 && "text-destructive font-medium",
                    material.totalStock < material.minimumStock && material.totalStock > 0 && "text-orange-500 font-medium"
                  )}>
                    Stok: {material.totalStock} {material.unit}
                  </span>
                </div>
                {material.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {material.description}
                  </p>
                )}
                {material.totalStock === 0 && (
                  <p className="text-xs font-medium text-destructive">Stok habis</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
