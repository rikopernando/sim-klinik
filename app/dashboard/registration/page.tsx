"use client"

import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowLeft, UserPlus, Eye, List } from "lucide-react"

import { PatientSearch } from "@/components/patients/patient-search"
import { PatientRegistrationForm } from "@/components/patients/patient-registration-form"
import { VisitRegistrationForm } from "@/components/visits/visit-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Patient, RegisteredVisit } from "@/types/registration"

type RegistrationStep = "search" | "new-patient" | "visit-registration" | "success"

export default function RegistrationPage() {
  return (
    <PageGuard roles={["super_admin", "admin"]}>
      <RegistrationPageContent />
    </PageGuard>
  )
}

function RegistrationPageContent() {
  const router = useRouter()
  const [step, setStep] = useState<RegistrationStep>("search")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [registeredVisit, setRegisteredVisit] = useState<RegisteredVisit | null>(null)

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setStep("visit-registration")
  }

  const handleNewPatient = () => {
    setStep("new-patient")
  }

  const handlePatientRegistrationSuccess = (patient: Patient) => {
    setSelectedPatient(patient)
    setStep("visit-registration")
  }

  const handleVisitRegistrationSuccess = (visit: RegisteredVisit) => {
    setRegisteredVisit(visit)
    setStep("success")
  }

  const handleReset = () => {
    setStep("search")
    setSelectedPatient(null)
    setRegisteredVisit(null)
  }

  const handleNewRegistration = () => {
    setSelectedPatient(null)
    setRegisteredVisit(null)
    setStep("search")
  }

  const handleAssignBed = () => {
    const paramsObj = {
      mrNumber: registeredVisit?.patient?.mrNumber || "",
      visitNumber: registeredVisit?.visit?.visitNumber || "",
      assignBed: registeredVisit?.visit?.id || "",
      patientName: registeredVisit?.patient?.name || "",
    }

    const queryString = new URLSearchParams(paramsObj).toString()

    router.push(`/dashboard/inpatient/rooms?${queryString}`)
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pendaftaran Pasien</h1>
        <p className="text-muted-foreground">
          Cari pasien yang sudah terdaftar atau daftarkan pasien baru
        </p>
      </div>

      {/* Main Content */}
      {step === "search" && (
        <Card>
          <CardHeader>
            <CardTitle>Cari atau Daftar Pasien</CardTitle>
            <CardDescription>
              Gunakan pencarian untuk menemukan pasien yang sudah terdaftar, atau klik tombol
              &quot;Pasien Baru&quot; untuk mendaftarkan pasien baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientSearch onSelectPatient={handleSelectPatient} onNewPatient={handleNewPatient} />
          </CardContent>
        </Card>
      )}

      {step === "new-patient" && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pencarian
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="text-primary h-6 w-6" />
                <CardTitle>Pendaftaran Pasien Baru</CardTitle>
              </div>
              <CardDescription>
                Lengkapi formulir di bawah ini untuk mendaftarkan pasien baru. Proses terdiri dari 2
                langkah yang mudah diikuti.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientRegistrationForm
                onSuccess={handlePatientRegistrationSuccess}
                onCancel={handleReset}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === "visit-registration" && selectedPatient && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pencarian
          </Button>

          <VisitRegistrationForm
            patient={selectedPatient}
            onSuccess={handleVisitRegistrationSuccess}
            onCancel={handleReset}
          />
        </div>
      )}

      {step === "success" && registeredVisit && (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="space-y-6 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Pendaftaran Berhasil!</h2>
              <p className="text-muted-foreground">
                Pasien telah berhasil didaftarkan untuk kunjungan
              </p>
            </div>

            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail Kunjungan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nomor Kunjungan:</span>
                    <div className="text-primary text-lg font-bold">
                      {registeredVisit.visit?.visitNumber}
                    </div>
                  </div>
                  {registeredVisit.visit?.queueNumber && (
                    <div>
                      <span className="font-medium">Nomor Antrian:</span>
                      <div className="text-primary text-lg font-bold">
                        {registeredVisit.visit.queueNumber}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Nama Pasien:</span>
                    <div>{registeredVisit.patient?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium">No. RM:</span>
                    <div>{registeredVisit.patient?.mrNumber}</div>
                  </div>
                  <div>
                    <span className="font-medium">Jenis Kunjungan:</span>
                    <div className="capitalize">
                      <Badge>
                        {registeredVisit.visit?.visitType === "outpatient"
                          ? "Rawat Jalan"
                          : registeredVisit.visit?.visitType === "inpatient"
                            ? "Rawat Inap"
                            : "UGD"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Waktu Kedatangan:</span>
                    <div>
                      {new Date(registeredVisit.visit?.arrivalTime).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {/* Bed Assignment Button (Inpatient only) */}
              {registeredVisit.visit?.visitType === "inpatient" && (
                <Button onClick={handleAssignBed} size="lg" variant="secondary" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Alokasi Bed Sekarang
                </Button>
              )}

              <Button onClick={handleNewRegistration} size="lg" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Daftar Pasien Lain
              </Button>

              {registeredVisit.visit?.visitType === "outpatient" && (
                <Button
                  onClick={() => router.push("/dashboard/queue")}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Lihat Antrian
                </Button>
              )}

              <Button
                onClick={() => router.push("/dashboard/patients")}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Lihat Daftar Pasien
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="lg" className="gap-2">
                Cetak Kartu Antrian
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
