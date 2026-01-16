/**
 * Emergency Room Medical Record Page
 * Specialized medical record interface for emergency cases
 *
 * Features:
 * - ER-specific SOAP documentation
 * - Diagnosis (ICD-10) entry
 * - Prescription management
 * - Procedure documentation
 * - Lab orders integration
 * - Disposition management (required before locking)
 * - Billing preview
 */

"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useERVisit } from "@/hooks/use-er-visit"
import { useMedicalRecord } from "@/hooks/use-medical-record"
import { ERVisitHeader } from "@/components/emergency/er-visit-header"
import { ERMedicalRecordActions } from "@/components/emergency/er-medical-record-actions"
import { MedicalRecordTabs } from "@/components/medical-records/medical-record-tabs"
import type { DispositionType } from "@/types/emergency"

export default function ERMedicalRecordPage() {
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("soap")

  // Use ER visit hook for visit data
  const {
    visit,
    isLoading: isLoadingVisit,
    error: visitError,
    isEmergencyVisit,
    updateVisit,
  } = useERVisit({ visitId })

  // Use medical record hook for medical record operations
  const {
    recordData,
    isLocked,
    isLoading: isLoadingRecord,
    isSaving,
    isLocking,
    error: recordError,
    loadMedicalRecord,
    saveSOAP,
    saveDraft,
    lockRecord,
    unlockRecord,
    updateRecord,
  } = useMedicalRecord({ visitId })

  /**
   * Navigate back to ER queue
   */
  const handleBack = useCallback(() => {
    router.push("/dashboard/emergency")
  }, [router])

  /**
   * Handle lock action with disposition
   * Disposition is required before locking ER medical record
   */
  const handleLock = useCallback(
    async (disposition: DispositionType, billingAdjustment?: number, adjustmentNote?: string) => {
      try {
        // First update disposition on the visit
        await updateVisit({ disposition })

        // Then lock the medical record
        await lockRecord(billingAdjustment, adjustmentNote)

        toast.success("Rekam medis berhasil dikunci")

        // Navigate back to queue after locking
        setTimeout(() => {
          handleBack()
        }, 1000)
      } catch {
        toast.error("Gagal mengunci rekam medis")
      }
    },
    [updateVisit, lockRecord, handleBack]
  )

  // Loading state (visit or medical record)
  if (isLoadingVisit || isLoadingRecord) {
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
  const error = visitError || recordError
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

      {/* Patient & Visit Header with Disposition */}
      <ERVisitHeader visit={visit} />

      {/* Error Alert (shows errors during operations) */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catatan Medis UGD</CardTitle>
              <CardDescription>
                Dokumentasi lengkap pemeriksaan, diagnosis, resep, dan tindakan gawat darurat
              </CardDescription>
            </div>

            {/* Action Buttons with Disposition (Save Draft / Lock & Finish / Unlock) */}
            {recordData && (
              <ERMedicalRecordActions
                isLocked={isLocked}
                isSaving={isSaving}
                isLocking={isLocking}
                currentDisposition={visit.disposition as DispositionType | null}
                onSave={saveDraft}
                onLock={handleLock}
                onUnlock={unlockRecord}
              />
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Medical Record Tabs (SOAP, Diagnosis, Prescription, Procedure, Lab Orders) */}
          {recordData ? (
            <MedicalRecordTabs
              recordData={recordData}
              activeTab={activeTab}
              isLocked={isLocked}
              onTabChange={setActiveTab}
              onUpdate={loadMedicalRecord}
              onUpdateRecord={updateRecord}
              onSaveSOAP={saveSOAP}
            />
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <p>Belum ada catatan medis. Mulai dengan mengisi SOAP.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
