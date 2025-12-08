"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, Loader2, AlertCircle, UserPlus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDebounce } from "@/hooks/use-debounce"

import { searchPatients as searchPatientsService } from "@/lib/services/patient.service"
import { getErrorMessage } from "@/lib/utils/error"
import { type RegisteredPatient } from "@/types/registration"
import { PatientCard } from "@/components/patients/patient-card"

interface PatientSearchProps {
  onSelectPatient?: (patient: RegisteredPatient) => void
  onNewPatient?: () => void
}

export function PatientSearch({ onSelectPatient, onNewPatient }: PatientSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<RegisteredPatient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 500)

  const handleSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await searchPatientsService(searchQuery)
      setResults(response.patients as RegisteredPatient[])
    } catch (err) {
      setError(getErrorMessage(err))
      console.error("Search error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    handleSearch(debouncedQuery)
  }, [debouncedQuery, handleSearch])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari pasien (NIK, No. RM, atau Nama)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onNewPatient} variant="outline" className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Pasien Baru
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          <span className="text-muted-foreground ml-2 text-sm">Mencari pasien...</span>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Ditemukan {results.length} pasien</p>
          {results.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => onSelectPatient?.(patient)}
            />
          ))}
        </div>
      )}

      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Tidak ada pasien ditemukan dengan kata kunci &quot;{query}&quot;
          </p>
          <Button onClick={onNewPatient} className="mt-4" variant="default">
            Daftar Pasien Baru
          </Button>
        </div>
      )}
    </div>
  )
}
