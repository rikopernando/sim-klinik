"use client"

/**
 * Patients List Page
 * View and manage all registered patients
 */

import { useRouter } from "next/navigation"
import { PageGuard } from "@/components/auth/page-guard"
import { IconUserPlus, IconSearch } from "@tabler/icons-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  const { patients, loading, searchQuery, pagination, setSearchQuery, handlePageChange } =
    usePatients()

  const handleNewPatient = () => {
    router.push("/dashboard/patients/new")
  }

  const handleEditPatient = (patientId: string) => {
    router.push(`/dashboard/patients/${patientId}/edit`)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Pasien</h1>
          <p className="text-muted-foreground">Kelola data pasien yang terdaftar</p>
        </div>

        {hasPermission("patients:write") && (
          <Button onClick={handleNewPatient}>
            <IconUserPlus size={20} className="mr-2" />
            Pasien Baru
          </Button>
        )}
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pasien</CardTitle>
          {patients.length > 0 && !loading && (
            <CardDescription>Total: {pagination.total} pasien</CardDescription>
          )}
          <CardAction>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
                  size={20}
                />
                <Input
                  placeholder="Cari berdasarkan nama, NIK, atau RM"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-w-[304px] pl-10"
                />
              </div>
            </div>
          </CardAction>
        </CardHeader>
        {patients.length === 0 && loading ? (
          <Loader message="Memuat data pasien..." />
        ) : (
          <CardContent>
            <PatientsTable patients={patients} onEditPatient={handleEditPatient} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <PatientsPagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
