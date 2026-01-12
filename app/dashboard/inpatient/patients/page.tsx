/**
 * Inpatient Patients List Page
 * Display and manage active inpatient patients
 */

"use client"
import { RefreshCw } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useInpatientList } from "@/hooks/use-inpatient-list"
import { useInpatientFilters } from "@/hooks/use-inpatient-filters"
import { PatientListTable } from "@/components/inpatient/patient-list-table"
import { PatientListFilters } from "@/components/inpatient/patient-list-filters"
import { InpatientPagination } from "@/components/inpatient/inpatient-pagination"
import { Button } from "@/components/ui/button"

export default function InpatientPatientsPage() {
  const filterHook = useInpatientFilters()
  const { patients, pagination, isLoading, handlePageChange, refresh } = useInpatientList(
    filterHook.filters
  )

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pasien Rawat Inap</h1>
            <p className="text-muted-foreground">Daftar pasien rawat inap yang sedang aktif</p>
          </div>
          <Button onClick={refresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Patient List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pasien</CardTitle>
            <CardDescription>
              {isLoading
                ? "Memuat data..."
                : pagination.total > 0
                  ? `Total: ${pagination.total} pasien`
                  : "Tidak ada pasien rawat inap"}
            </CardDescription>
            <CardAction>
              {/* Filters */}
              <PatientListFilters
                search={filterHook.search}
                roomType={filterHook.roomType}
                onSearchChange={filterHook.setSearch}
                onRoomTypeChange={filterHook.setRoomType}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Table */}
            <PatientListTable patients={patients} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && (
              <InpatientPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
