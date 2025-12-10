/**
 * ICD-10 Search Component
 * Simple search input with dropdown results
 */

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { useICD10Search, type ICD10Code } from "@/hooks/use-icd10-search"

interface ICD10SearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (code: string, description: string) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function ICD10Search({
  value,
  onChange,
  onSelect,
  label = "Kode ICD-10",
  placeholder = "Ketik kode atau nama penyakit...",
  required = false,
}: ICD10SearchProps) {
  const [showDropdown, setShowDropdown] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Only use searchQuery for the API call, not the display value
  const { codes, isSearching } = useICD10Search(searchQuery)

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue)
    onChange(newValue)
    setShowDropdown(true)
  }

  const handleSelect = (code: ICD10Code) => {
    setShowDropdown(false)
    setSearchQuery("") // Clear search query to stop API calls
    onChange(code.code)
    onSelect(code.code, code.description)
  }

  return (
    <>
      <FieldLabel htmlFor="icd10Search">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          id="icd10Search"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
        {codes.length > 0 && searchQuery && showDropdown && (
          <div className="bg-background absolute z-[9999] mt-2 max-h-60 w-full space-y-1 overflow-y-auto rounded-md border p-2 shadow-md">
            {codes.map((code) => (
              <button
                key={code.id}
                type="button"
                onClick={() => handleSelect(code)}
                className="hover:bg-accent w-full rounded px-3 py-2 text-left"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-semibold">{code.code}</span>
                  <span className="text-muted-foreground text-sm">{code.description}</span>
                  {code.category && (
                    <span className="text-muted-foreground text-xs italic">{code.category}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {isSearching && <FieldDescription>Mencari...</FieldDescription>}
      {searchQuery && searchQuery.length >= 2 && !isSearching && codes.length === 0 && (
        <FieldDescription>Tidak ada hasil ditemukan</FieldDescription>
      )}
    </>
  )
}
