"use client"

import { Loader2, X } from "lucide-react"
import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isSearching?: boolean
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  isSearching = false,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch
        size={15}
        className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-muted/40 border-muted-foreground/20 pr-9 pl-9 focus-visible:border-[#52b788] focus-visible:ring-[#74c69d]/30"
      />
      {isSearching ? (
        <Loader2
          size={14}
          className="text-muted-foreground/60 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
        />
      ) : value ? (
        <button
          onClick={() => onChange("")}
          className="text-muted-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  )
}
