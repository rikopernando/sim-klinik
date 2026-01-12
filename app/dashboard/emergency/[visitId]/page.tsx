/**
 * Emergency Room Medical Record Page
 * Specialized medical record interface for emergency cases
 *
 * Refactored for better readability, modularity, and performance
 */

"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useERVisit } from "@/hooks/use-er-visit"
import { ERVisitHeader } from "@/components/emergency/er-visit-header"
import { ERMedicalRecordForm } from "@/components/emergency/er-medical-record-form"

export default function ERMedicalRecordPage() {
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()

  // Use custom hook for all ER visit operations
  const { visit, isLoading, error, isEmergencyVisit } = useERVisit({ visitId })

  /**
   * Handle successful save - navigate back to ER queue
   */
  const handleSuccess = () => {
    router.push("/dashboard/emergency")
  }

  /**
   * Navigate back to ER queue
   */
  const handleBack = () => {
    router.push("/dashboard/emergency")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">Memuat data pasien UGD...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !visit) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Data kunjungan tidak ditemukan"}</AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Antrian UGD
        </Button>
      </div>
    )
  }

  // Verify this is an emergency visit
  if (!isEmergencyVisit) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kunjungan ini bukan kunjungan UGD. Silakan gunakan halaman rekam medis reguler.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Antrian UGD
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Antrian UGD
      </Button>

      {/* Patient & Visit Header */}
      <ERVisitHeader visit={visit} />

      {/* ER Medical Record Form */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Medis UGD</CardTitle>
          <CardDescription>Dokumentasi pemeriksaan dan tindakan gawat darurat</CardDescription>
        </CardHeader>
        <CardContent>
          <ERMedicalRecordForm
            visitId={visitId}
            patientName={visit.patient.name}
            triageStatus={visit.triageStatus || "green"}
            onSave={(isDraft) => {
              if (!isDraft) {
                // If it's not a draft (i.e., it's locked), navigate back to queue
                handleSuccess()
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
