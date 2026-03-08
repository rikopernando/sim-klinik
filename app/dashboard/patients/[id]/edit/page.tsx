"use client"

/**
 * Edit Patient Page
 * Page for editing existing patient information
 */

import { useEffect, useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/patients/page-header"
import { PatientEditForm } from "@/components/patients/patient-edit-form"
import { PatientSuccessCard } from "@/components/patients/patient-success-card"
import { Spinner } from "@/components/ui/spinner"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserCog } from "lucide-react"
import { type Patient } from "@/types/registration"

type PageState = "loading" | "form" | "success" | "error"

export default function EditPatientPage() {
  return (
    <PageGuard permissions={["patients:write"]}>
      <EditPatientPageContent />
    </PageGuard>
  )
}

function EditPatientPageContent() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [pageState, setPageState] = useState<PageState>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${patientId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch patient")
        }
        const data = await response.json()
        setPatient(data.data)
        setPageState("form")
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setPageState("error")
      }
    }

    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  const handleSuccess = (updatedPatient: Patient) => {
    setPatient(updatedPatient)
    setPageState("success")
  }

  const handleCancel = () => {
    router.push("/dashboard/patients")
  }

  const handleViewList = () => {
    router.push("/dashboard/patients")
  }

  const handleEditAgain = () => {
    setPageState("form")
  }

  const navigateToRegistration = () => {
    router.push("/dashboard/registration")
  }

  // Loading State
  if (pageState === "loading") {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <PageHeader
          title="Edit Data Pasien"
          description="Memuat data pasien..."
          onBack={handleCancel}
        />
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
      </div>
    )
  }

  // Error State
  if (pageState === "error" || !patient) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <PageHeader
          title="Edit Data Pasien"
          description="Terjadi kesalahan"
          onBack={handleCancel}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Pasien tidak ditemukan"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <PageHeader
        title={pageState === "form" ? "Edit Data Pasien" : "Data Pasien Berhasil Diperbarui"}
        description={
          pageState === "form"
            ? `Perbarui informasi untuk ${patient.name} (${patient.mrNumber})`
            : "Perubahan data pasien telah tersimpan di sistem"
        }
        onBack={handleCancel}
      />

      {/* Form State */}
      {pageState === "form" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="text-primary h-6 w-6" />
              <CardTitle>Form Edit Pasien</CardTitle>
            </div>
            <CardDescription>
              Perbarui data pasien sesuai kebutuhan. Semua perubahan akan tersimpan di sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientEditForm patient={patient} onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {pageState === "success" && (
        <PatientSuccessCard
          patient={patient}
          onAddAnother={handleEditAgain}
          onRegisterVisit={navigateToRegistration}
          onViewList={handleViewList}
          mode="edit"
        />
      )}
    </div>
  )
}
