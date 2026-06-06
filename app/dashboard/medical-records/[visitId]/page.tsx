/**
 * Medical Record Page
 * Main page for viewing and editing electronic medical records
 *
 * Refactored for better readability, modularity, and performance
 * Each tab now fetches its own data lazily when activated
 */

"use client"

import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { useMedicalRecord } from "@/hooks/use-medical-record"
import { MedicalRecordHeader } from "@/components/medical-records/medical-record-header"
import { MedicalRecordActions } from "@/components/medical-records/medical-record-actions"
import { MedicalRecordTabs } from "@/components/medical-records/medical-record-tabs"
import { PatientContextStrip } from "@/components/medical-records/patient-context-strip"

export default function MedicalRecordPage() {
  return (
    <PageGuard permissions={["medical_records:read"]}>
      <MedicalRecordPageContent />
    </PageGuard>
  )
}

function MedicalRecordPageContent() {
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("soap")

  // Use custom hook for core medical record operations
  // Diagnoses, procedures, and prescriptions are fetched lazily by their respective tabs
  const {
    coreData,
    isLocked,
    isDraft,
    isLoading,
    isSaving,
    isLocking,
    error,
    saveDraft,
    lockRecord,
    unlockRecord,
    updateRecord,
  } = useMedicalRecord({ visitId })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">Memuat rekam medis...</p>
        </div>
      </div>
    )
  }

  // Error state (no data loaded)
  if (error && !coreData) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    )
  }

  // No data state
  if (!coreData) {
    return null
  }

  // Check if visit is cancelled
  const isCancelled = coreData.visit.status === "cancelled"

  // Treat cancelled visits as locked (read-only)
  const isReadOnly = isLocked || isCancelled

  // Handle lock action
  const handleLock = async (billingAdjustment?: number, adjustmentNote?: string) => {
    await lockRecord(billingAdjustment, adjustmentNote)
  }

  return (
    <div>
      {/* Header with visit info and status badges */}
      <MedicalRecordHeader visit={coreData.visit} isLocked={isLocked} isDraft={isDraft} />

      {/* Patient context strip */}
      <PatientContextStrip patient={coreData.patient} visit={coreData.visit} />

      {/* Locked state banner */}
      {isLocked && (
        <div className="border-b border-amber-200 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-950/20">
          <div className="container mx-auto flex max-w-6xl items-center gap-2 px-6 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Rekam medis ini dikunci — hanya dapat dilihat, tidak dapat diubah
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl space-y-6 px-6 py-6">
        {/* Cancelled Visit Banner */}
        {isCancelled && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="destructive">Dibatalkan</Badge>
              Kunjungan ini telah dibatalkan. Data rekam medis hanya dapat dilihat dan tidak dapat
              diubah.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert (shows errors during operations) */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions bar + Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Catatan Medis</p>
              <p className="text-muted-foreground text-sm">
                Dokumentasi pemeriksaan dan tindakan medis
              </p>
            </div>
            {!isCancelled && (
              <MedicalRecordActions
                isLocked={isLocked}
                isSaving={isSaving}
                isLocking={isLocking}
                lastSavedAt={coreData.medicalRecord.updatedAt}
                canTransfer={
                  coreData.visit.visitType === "outpatient" &&
                  coreData.visit.status === "in_examination"
                }
                patientName={coreData.patient.name}
                onSave={saveDraft}
                onLock={handleLock}
                onUnlock={unlockRecord}
              />
            )}
          </div>

          <MedicalRecordTabs
            coreData={coreData}
            activeTab={activeTab}
            isLocked={isReadOnly}
            onTabChange={setActiveTab}
            onUpdateRecord={updateRecord}
          />
        </div>
      </div>
    </div>
  )
}
