/**
 * Inpatient Patients List Page
 * Display and manage active inpatient patients
 */

"use client"
import { PageGuard } from "@/components/auth/page-guard"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

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
  return (
    <PageGuard permissions={["inpatient:read"]}>
      <InpatientPatientsPageContent />
    </PageGuard>
  )
}

function InpatientPatientsPageContent() {
  const filterHook = useInpatientFilters()
  const { patients, pagination, isLoading, handlePageChange, refresh } = useInpatientList(
    filterHook.filters
  )

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="bg-primary mt-1.5 h-5 w-1 shrink-0 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pasien Rawat Inap</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Daftar pasien rawat inap yang sedang aktif
              </p>
            </div>
          </div>
          <Button
            onClick={refresh}
            variant="outline"
            disabled={isLoading}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
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
