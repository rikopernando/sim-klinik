/**
 * Lab Test Catalog Component
 * Searchable and filterable list of lab tests for ordering
 */

"use client"

import { useState } from "react"
import { IconSearch, IconFilter, IconFlask, IconX } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLabTests } from "@/hooks/use-lab-tests"
import type { LabTest } from "@/types/lab"
import { formatCurrency } from "@/lib/utils/billing"

interface LabTestCatalogProps {
  onSelectTest: (test: LabTest) => void
  selectedTestId?: string | null
}

export function LabTestCatalog({ onSelectTest, selectedTestId }: LabTestCatalogProps) {
  const [showFilters, setShowFilters] = useState(false)

  const { tests, loading, filters, setSearch, setCategory, setDepartment } = useLabTests()

  const handleClearFilters = () => {
    setSearch("")
    setCategory(undefined)
    setDepartment(undefined)
  }

  const hasActiveFilters = filters.category || filters.department || filters.search

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Cari tes laboratorium (kode atau nama)..."
            value={filters.search || ""}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <IconFilter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filter</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <IconX className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departemen</label>
                <Select
                  value={filters.department || "all"}
                  onValueChange={(value) =>
                    setDepartment(value === "all" ? undefined : (value as "LAB" | "RAD"))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    <SelectItem value="LAB">Laboratorium</SelectItem>
                    <SelectItem value="RAD">Radiologi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) => setCategory(value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="Hematology">Hematologi</SelectItem>
                    <SelectItem value="Chemistry">Kimia Klinik</SelectItem>
                    <SelectItem value="Immunology">Imunologi</SelectItem>
                    <SelectItem value="Microbiology">Mikrobiologi</SelectItem>
                    <SelectItem value="Urinalysis">Urinalisis</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="Ultrasound">USG</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{loading ? "Memuat..." : `${tests.length} tes ditemukan`}</span>
        {hasActiveFilters && (
          <span className="text-xs">
            Filter aktif: {filters.search && "Pencarian, "}
            {filters.category && "Kategori, "}
            {filters.department && "Departemen"}
          </span>
        )}
      </div>

      <Separator />

      {/* Test List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse p-4">
                <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-1/2 rounded" />
              </Card>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <Card className="p-8 text-center">
            <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground text-sm">
              {hasActiveFilters
                ? "Tidak ada tes yang sesuai dengan filter"
                : "Tidak ada tes tersedia"}
            </p>
          </Card>
        ) : (
          tests.map((test) => (
            <Card
              key={test.id}
              className={`hover:bg-accent cursor-pointer p-4 transition-colors ${
                selectedTestId === test.id ? "border-primary bg-accent" : ""
              }`}
              onClick={() => onSelectTest(test)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{test.name}</h4>
                    {selectedTestId === test.id && (
                      <Badge variant="default" className="text-xs">
                        Dipilih
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span className="font-mono">{test.code}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {test.category}
                    </Badge>
                    <span>•</span>
                    <Badge
                      variant={test.department === "LAB" ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {test.department === "LAB" ? "Laboratorium" : "Radiologi"}
                    </Badge>
                  </div>
                  {test.specimenType && (
                    <p className="text-muted-foreground text-xs">
                      Spesimen: {test.specimenType}
                      {test.specimenVolume && ` (${test.specimenVolume})`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">
                    {formatCurrency(parseFloat(test.price))}
                  </p>
                  {test.tatHours && (
                    <p className="text-muted-foreground text-xs">TAT: {test.tatHours}h</p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
