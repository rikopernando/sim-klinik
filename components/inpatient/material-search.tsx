/**
 * Material Search Component
 * Autocomplete search for materials from unified inventory
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useMaterialSearch } from "@/hooks/use-material-search"
import type { Material } from "@/types/material"
import { cn } from "@/lib/utils"
import { FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"

import { MaterialListItem } from "./material-list-item"

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
      <FieldLabel htmlFor="drugSearch">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>

      <div className="relative mt-2">
        {isLoading ? (
          <Spinner className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        ) : (
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}
        <Input
          ref={inputRef}
          id="material-search"
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pl-9", error && "border-destructive")}
        />
      </div>

      {isLoading && <FieldDescription className="!mt-1">Mencari...</FieldDescription>}
      {value && value.length >= 2 && !isLoading && materials.length === 0 && (
        <FieldDescription className="!mt-1">
          Tidak ada alat kesehatan yang ditemukan
        </FieldDescription>
      )}
      {error && <FieldError className="!mt-1">{error}</FieldError>}

      {/* Dropdown */}
      {isOpen && value && materials.length > 0 && (
        <div className="bg-popover absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md">
          {materials.map((material, index) => (
            <MaterialListItem
              key={material.id}
              material={material}
              isActive={index === focusedIndex}
              onClick={() => handleSelect(material)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
