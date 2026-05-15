"use client"

import { useRouter } from "next/navigation"
import { IconSearch, IconUserPlus, IconUsers } from "@tabler/icons-react"
import { Loader2, X } from "lucide-react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePatients } from "@/hooks/use-patients"
import { PatientsTable } from "@/components/patients/patients-table"
import { PatientsPagination } from "@/components/patients/patients-pagination"
import Loader from "@/components/loader"
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
  const isEmpty = patients.length === 0 && !loading

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
          <div className="relative max-w-sm flex-1">
            <IconSearch
              size={15}
              className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              placeholder="Cari nama, NIK, atau No. RM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/40 border-muted-foreground/20 pr-9 pl-9 focus-visible:border-[#52b788] focus-visible:ring-[#74c69d]/30"
            />
            {isSearching ? (
              <Loader2
                size={14}
                className="text-muted-foreground/60 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
              />
            ) : searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground/60 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          {!loading && pagination.total > 0 && (
            <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">
                {pagination.total.toLocaleString("id-ID")}
              </span>{" "}
              pasien
            </p>
          )}
        </div>

        {/* Table panel */}
        {patients.length === 0 && loading ? (
          <Loader message="Memuat data pasien..." />
        ) : isEmpty ? (
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#52b788]/10">
                <IconUsers size={22} className="text-[#52b788]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {searchQuery ? "Pasien tidak ditemukan" : "Belum ada data pasien"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {searchQuery
                    ? `Tidak ada hasil untuk "${searchQuery}"`
                    : "Mulai dengan menambahkan pasien baru"}
                </p>
              </div>
              {!searchQuery && hasPermission("patients:write") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => router.push("/dashboard/patients/new")}
                >
                  <IconUserPlus size={14} className="mr-1.5" />
                  Tambah Pasien
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                Daftar Pasien
              </p>
              {!loading && pagination.total > 0 && (
                <span className="rounded-full bg-[#52b788]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2d6a4f] dark:text-[#74c69d]">
                  {pagination.total.toLocaleString("id-ID")} total
                </span>
              )}
            </div>

            <PatientsTable
              patients={patients}
              onEditPatient={(id) => router.push(`/dashboard/patients/${id}/edit`)}
            />

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-5 py-3">
                <p className="text-muted-foreground text-xs tabular-nums">
                  Menampilkan {rangeStart.toLocaleString("id-ID")}–
                  {rangeEnd.toLocaleString("id-ID")} dari {pagination.total.toLocaleString("id-ID")}{" "}
                  pasien
                </p>
                <div className="[&>div]:mt-0">
                  <PatientsPagination pagination={pagination} onPageChange={handlePageChange} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
