"use client"

import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BedDouble, RefreshCw } from "lucide-react"
import { useInpatientList } from "@/hooks/use-inpatient-list"
import { useInpatientFilters } from "@/hooks/use-inpatient-filters"
import { PatientListTable } from "@/components/inpatient/patient-list-table"
import { InpatientPagination } from "@/components/inpatient/inpatient-pagination"
import { ROOM_TYPES } from "@/lib/constants/rooms"
import { cn } from "@/lib/utils"

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

  const isSearching = filterHook.search !== filterHook.debouncedSearch || isLoading

  const rangeStart =
    !pagination || pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  return (
    <div>
      <PageHeader
        title="Pasien Rawat Inap"
        description="Daftar pasien yang sedang menjalani perawatan"
      >
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={cn("mr-1.5 h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={filterHook.search}
            onChange={filterHook.setSearch}
            placeholder="Cari nama pasien, No. RM, nomor kamar..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          <Select value={filterHook.roomType} onValueChange={filterHook.setRoomType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipe Kamar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              {ROOM_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TablePanel
          label="Daftar Pasien Rawat Inap"
          total={pagination?.total}
          isLoading={patients.length === 0 && isLoading}
          loadingMessage="Memuat data pasien..."
          isEmpty={patients.length === 0 && !isLoading}
          emptyIcon={<BedDouble size={22} className="text-[#52b788]" />}
          emptyTitle={filterHook.search ? "Pasien tidak ditemukan" : "Tidak ada pasien rawat inap"}
          emptyDescription={
            filterHook.search
              ? `Tidak ada hasil untuk "${filterHook.search}"`
              : "Pasien yang sedang dirawat akan muncul di sini"
          }
          paginationRange={
            pagination && pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} pasien`
              : undefined
          }
          pagination={
            pagination && pagination.totalPages > 1 ? (
              <InpatientPagination pagination={pagination} onPageChange={handlePageChange} />
            ) : undefined
          }
        >
          <PatientListTable patients={patients} />
        </TablePanel>
      </div>
    </div>
  )
}
