/**
 * Service Search Component
 * Autocomplete search for medical procedures/services
 */

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useServiceSearch, type Service } from "@/hooks/use-service-search"
import { formatCurrency } from "@/lib/billing/billing-utils"

interface ServiceSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (service: Service) => void
  label?: string
  placeholder?: string
  required?: boolean
  serviceType?: string
}

export function ServiceSearch({
  value,
  onChange,
  onSelect,
  label = "Cari Tindakan",
  placeholder = "Ketik nama tindakan...",
  required = false,
  serviceType = "procedure",
}: ServiceSearchProps) {
  const [showDropdown, setShowDropdown] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Only use searchQuery for the API call, not the display value
  const { services, isSearching } = useServiceSearch(searchQuery, serviceType)

  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue)
    onChange(newValue)
    setShowDropdown(true)
  }

  const handleSelect = (service: Service) => {
    setShowDropdown(false)
    setSearchQuery("") // Clear search query to stop API calls
    onSelect(service)
  }

  return (
    <>
      <FieldLabel htmlFor="serviceSearch">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <div className="relative">
        {isSearching ? (
          <Spinner className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        ) : (
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        )}
        <Input
          id="serviceSearch"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
        {services.length > 0 && searchQuery && showDropdown && (
          <div className="bg-background absolute z-[9999] mt-1 max-h-60 w-full space-y-1 overflow-y-auto rounded-md border p-2 shadow-xl">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleSelect(service)}
                className="hover:bg-accent w-full rounded px-3 py-2 text-left text-sm transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      Kode: {service.code}
                      {service.description && ` • ${service.description}`}
                    </div>
                  </div>
                  <div className="text-primary text-xs font-medium whitespace-nowrap">
                    {formatCurrency(parseFloat(service.price))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {isSearching && <FieldDescription>Mencari tindakan...</FieldDescription>}
      {searchQuery && searchQuery.length >= 2 && !isSearching && services.length === 0 && (
        <FieldDescription>Tidak ada tindakan ditemukan</FieldDescription>
      )}
    </>
  )
}
