"use client"

/**
 * Patients List Page
 * View and manage all registered patients
 */

import { useRouter } from "next/navigation"
import { IconUserPlus, IconSearch } from "@tabler/icons-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { usePatients } from "@/hooks/use-patients"
import { PatientsTable } from "@/components/patients/patients-table"
import { PatientsPagination } from "@/components/patients/patients-pagination"

export default function PatientsPage() {
  const router = useRouter()
  const { patients, loading, searchQuery, pagination, setSearchQuery, handlePageChange } =
    usePatients()

  const handleNewPatient = () => {
    router.push("/dashboard/patients/new")
  }

  const handleEditPatient = (patientId: number) => {
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
        <Button onClick={handleNewPatient}>
          <IconUserPlus size={20} className="mr-2" />
          Pasien Baru
        </Button>
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
          <div className="mx-auto flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Item variant="outline">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">Memuat data pasien...</ItemTitle>
              </ItemContent>
            </Item>
          </div>
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
