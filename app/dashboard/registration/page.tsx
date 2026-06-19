"use client"

import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowLeft, UserPlus, Eye, List, Printer } from "lucide-react"

import { PatientSearch } from "@/components/patients/patient-search"
import { PatientRegistrationForm } from "@/components/patients/patient-registration-form"
import { VisitRegistrationForm } from "@/components/visits/visit-registration-form"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Patient, RegisteredVisit } from "@/types/registration"

type RegistrationStep = "search" | "new-patient" | "visit-registration" | "success"

// Change 1: renamed "Cari Pasien" → "Data Pasien"
const STEPS = [{ label: "Data Pasien" }, { label: "Data Kunjungan" }, { label: "Selesai" }]

function getActiveStepIndex(step: RegistrationStep): number {
  if (step === "search" || step === "new-patient") return 0
  if (step === "visit-registration") return 1
  return 2
}

function StepIndicator({ step }: { step: RegistrationStep }) {
  const activeIndex = getActiveStepIndex(step)
  // Change 6: on success, activeIndex is 2, so all steps show as complete
  const isComplete = step === "success"
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = isComplete || i < activeIndex
        const active = !isComplete && i === activeIndex
        return (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-primary ring-primary text-white ring-2 ring-offset-2"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn("h-px w-8 transition-colors", done ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Change 4: print preview modal
function PrintQueueDialog({
  open,
  onOpenChange,
  registeredVisit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  registeredVisit: RegisteredVisit
}) {
  const visitTypeLabel =
    registeredVisit.visit?.visitType === "outpatient"
      ? "Rawat Jalan"
      : registeredVisit.visit?.visitType === "inpatient"
        ? "Rawat Inap"
        : "UGD"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pratinjau Kartu Antrian</DialogTitle>
        </DialogHeader>

        {/* Print styles: hide everything except #print-card when printing */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #print-queue-card, #print-queue-card * { visibility: visible; }
            #print-queue-card {
              position: fixed;
              top: 0; left: 0;
              width: 100%;
              padding: 2rem;
            }
          }
        `}</style>

        <div id="print-queue-card" className="bg-card rounded-xl border p-6 text-center">
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
            Nomor Antrian
          </p>
          <p className="text-primary mb-4 text-5xl font-bold tabular-nums">
            {registeredVisit.visit?.queueNumber ?? registeredVisit.visit?.visitNumber}
          </p>

          <div className="border-t pt-4 text-left">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Nama</span>
                <span className="text-right font-medium">{registeredVisit.patient?.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">No. RM</span>
                <span className="font-medium">{registeredVisit.patient?.mrNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">No. Kunjungan</span>
                <span className="font-medium">{registeredVisit.visit?.visitNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Jenis</span>
                <span className="font-medium">{visitTypeLabel}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Waktu</span>
                <span className="font-medium">
                  {new Date(registeredVisit.visit?.arrivalTime).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Cetak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
  const [printOpen, setPrintOpen] = useState(false)

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
    router.push(`/dashboard/inpatient/rooms?${new URLSearchParams(paramsObj).toString()}`)
  }

  // Change 2: reusable back button wrapped in AlertDialog confirmation
  const BackButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="-ml-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pencarian
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kembali ke pencarian?</AlertDialogTitle>
          <AlertDialogDescription>
            Data yang sudah diisi akan hilang. Yakin ingin kembali?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Ya, Kembali</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div>
      <PageHeader
        title="Pendaftaran Pasien"
        description="Cari pasien yang sudah terdaftar atau daftarkan pasien baru"
      />

      <div className="container mx-auto max-w-4xl space-y-6 px-6 py-6">
        {/* Change 6: always show step indicator (shows all ✓ on success) */}
        {/* Change 3: patient context next to indicator on visit-registration step */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <StepIndicator step={step} />
          {step === "visit-registration" && selectedPatient && (
            <p className="text-muted-foreground text-sm">
              Mendaftarkan:{" "}
              <span className="text-foreground font-medium">{selectedPatient.name}</span>
            </p>
          )}
        </div>

        {step === "search" && (
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Cari atau Daftar Pasien</h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Gunakan pencarian untuk menemukan pasien yang sudah terdaftar, atau klik tombol
                &quot;Pasien Baru&quot; untuk mendaftarkan pasien baru
              </p>
            </div>
            <PatientSearch onSelectPatient={handleSelectPatient} onNewPatient={handleNewPatient} />
          </div>
        )}

        {step === "new-patient" && (
          <div className="space-y-4">
            <BackButton />
            <div className="bg-card rounded-xl border shadow-sm">
              <div className="flex items-center gap-3 border-b px-6 py-4">
                <div className="bg-primary/15 flex h-8 w-8 items-center justify-center rounded-full">
                  <UserPlus className="text-primary h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Pendaftaran Pasien Baru</h2>
                  <p className="text-muted-foreground text-xs">
                    Lengkapi formulir di bawah ini untuk mendaftarkan pasien baru
                  </p>
                </div>
              </div>
              <div className="p-6">
                <PatientRegistrationForm
                  onSuccess={handlePatientRegistrationSuccess}
                  onCancel={handleReset}
                />
              </div>
            </div>
          </div>
        )}

        {step === "visit-registration" && selectedPatient && (
          <div className="space-y-4">
            <BackButton />
            <VisitRegistrationForm
              patient={selectedPatient}
              onSuccess={handleVisitRegistrationSuccess}
              onCancel={handleReset}
            />
          </div>
        )}

        {step === "success" && registeredVisit && (
          <>
            <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm dark:border-green-900 dark:bg-green-950/40">
              <div className="p-8">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/60">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Pendaftaran Berhasil!</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Pasien telah berhasil didaftarkan untuk kunjungan
                  </p>
                </div>

                <div className="mb-8 rounded-lg border border-green-200 bg-white/70 p-5 dark:border-green-800 dark:bg-green-950/50">
                  <h3 className="mb-4 text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">
                    Detail Kunjungan
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground text-xs">Nomor Kunjungan</p>
                      <p className="text-primary mt-0.5 text-lg font-bold">
                        {registeredVisit.visit?.visitNumber}
                      </p>
                    </div>
                    {registeredVisit.visit?.queueNumber && (
                      <div>
                        <p className="text-muted-foreground text-xs">Nomor Antrian</p>
                        <p className="text-primary mt-0.5 text-lg font-bold">
                          {registeredVisit.visit.queueNumber}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Nama Pasien</p>
                      <p className="mt-0.5 font-medium">{registeredVisit.patient?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">No. Rekam Medis</p>
                      <p className="mt-0.5 font-medium">{registeredVisit.patient?.mrNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Jenis Kunjungan</p>
                      <div className="mt-0.5">
                        <Badge variant="secondary">
                          {registeredVisit.visit?.visitType === "outpatient"
                            ? "Rawat Jalan"
                            : registeredVisit.visit?.visitType === "inpatient"
                              ? "Rawat Inap"
                              : "UGD"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Waktu Kedatangan</p>
                      <p className="mt-0.5 font-medium">
                        {new Date(registeredVisit.visit?.arrivalTime).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change 5: clear button hierarchy */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {registeredVisit.visit?.visitType === "inpatient" && (
                    <Button onClick={handleAssignBed} size="lg" className="gap-2">
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
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat Antrian
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push("/dashboard/patients")}
                    variant="outline"
                    className="gap-2"
                  >
                    <List className="h-4 w-4" />
                    Lihat Daftar Pasien
                  </Button>
                  <Button onClick={() => setPrintOpen(true)} variant="ghost" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Cetak Kartu Antrian
                  </Button>
                </div>
              </div>
            </div>

            {/* Change 4: print preview dialog */}
            <PrintQueueDialog
              open={printOpen}
              onOpenChange={setPrintOpen}
              registeredVisit={registeredVisit}
            />
          </>
        )}
      </div>
    </div>
  )
}
