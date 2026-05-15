"use client"

import { useRouter } from "next/navigation"
import { IconUserPlus, IconUsers } from "@tabler/icons-react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import { usePatients } from "@/hooks/use-patients"
import { PatientsTable } from "@/components/patients/patients-table"
import { PatientsPagination } from "@/components/patients/patients-pagination"
import { usePermission } from "@/hooks/use-permission"

export default function PatientsPage() {
  return (
    <PageGuard permissions={["patients:read"]}>
      <PatientsPageContent />
    </PageGuard>
  )
}

function PatientsPageContent() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const {
    patients,
    loading,
    isSearching,
    searchQuery,
    pagination,
    setSearchQuery,
    handlePageChange,
  } = usePatients()

  const rangeStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div>
      <PageHeader title="Data Pasien" description="Kelola data pasien yang terdaftar">
        {hasPermission("patients:write") && (
          <Button onClick={() => router.push("/dashboard/patients/new")}>
            <IconUserPlus size={16} className="mr-1.5" />
            Pasien Baru
          </Button>
        )}
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari nama, NIK, atau No. RM..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          {!loading && pagination.total > 0 && (
            <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              pasien
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar Pasien"
          total={pagination.total}
          isLoading={patients.length === 0 && loading}
          loadingMessage="Memuat data pasien..."
          isEmpty={patients.length === 0 && !loading}
          emptyIcon={<IconUsers size={22} className="text-[#52b788]" />}
          emptyTitle={searchQuery ? "Pasien tidak ditemukan" : "Belum ada data pasien"}
          emptyDescription={
            searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : "Mulai dengan menambahkan pasien baru"
          }
          emptyAction={
            !searchQuery && hasPermission("patients:write") ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/dashboard/patients/new")}
              >
                <IconUserPlus size={14} className="mr-1.5" />
                Tambah Pasien
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${pagination.total.toLocaleString("id-ID")} pasien`
              : undefined
          }
          pagination={
            pagination.totalPages > 1 ? (
              <PatientsPagination pagination={pagination} onPageChange={handlePageChange} />
            ) : undefined
          }
        >
          <PatientsTable
            patients={patients}
            onEditPatient={(id) => router.push(`/dashboard/patients/${id}/edit`)}
          />
        </TablePanel>
      </div>
    </div>
  )
}
