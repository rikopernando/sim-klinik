"use client"

/**
 * Add New Patient Page
 * Dedicated page for creating new patient records
 */

import { useRouter } from "next/navigation"
import { PageGuard } from "@/components/auth/page-guard"
import { usePatientForm } from "@/hooks/use-patient-form"
import { PageHeader } from "@/components/patients/page-header"
import { PatientFormCard } from "@/components/patients/patient-form-card"
import { PatientSuccessCard } from "@/components/patients/patient-success-card"

function NewPatientPageContent() {
  const router = useRouter()
  const { pageState, registeredPatient, handleSuccess, handleReset } = usePatientForm()

  const navigateToList = () => router.push("/dashboard/patients")
  const navigateToRegistration = () => router.push("/dashboard/registration")

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <PageHeader
        title={pageState === "form" ? "Tambah Pasien Baru" : "Pasien Berhasil Didaftarkan"}
        description={
          pageState === "form"
            ? "Lengkapi formulir untuk mendaftarkan pasien baru"
            : "Data pasien telah tersimpan di sistem"
        }
        onBack={navigateToList}
      />

      {/* Form State */}
      {pageState === "form" && (
        <PatientFormCard onSuccess={handleSuccess} onCancel={navigateToList} />
      )}

      {/* Success State */}
      {pageState === "success" && registeredPatient && (
        <PatientSuccessCard
          patient={registeredPatient}
          onAddAnother={handleReset}
          onRegisterVisit={navigateToRegistration}
          onViewList={navigateToList}
        />
      )}
    </div>
  )
}

export default function NewPatientPage() {
  return (
    <PageGuard permissions={["patients:write"]}>
      <NewPatientPageContent />
    </PageGuard>
  )
}
