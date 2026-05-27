"use client"

/**
 * Doctor Dashboard (H.3.3)
 * Patient queue, quick access to RME, and patient history
 */

import { PageGuard } from "@/components/auth/page-guard"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useDoctorDashboard } from "@/hooks/use-doctor-dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog"
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog"
import { QueueDateFilter } from "@/components/visits/queue-date-filter"
import { DoctorStatsSection } from "@/components/doctor/doctor-stats-section"
import { DoctorQueueTabs } from "@/components/doctor/doctor-queue-tabs"
import { DoctorStatsSkeleton } from "@/components/doctor/doctor-stats-skeleton"
import { DoctorQueueSkeleton } from "@/components/doctor/doctor-queue-skeleton"

export default function DoctorDashboard() {
  return (
    <PageGuard roles={["doctor", "super_admin", "admin"]}>
      <DoctorDashboardContent />
    </PageGuard>
  )
}

function DoctorDashboardContent() {
  const {
    stats,
    statsLoading,
    queueLoading,
    waitingQueue,
    inProgressQueue,
    unlockedQueue,
    selectedPatient,
    showHistory,
    startingExamination,
    error,
    lastRefresh,
    editVisitData,
    showEditDialog,
    handleRefreshAll,
    handleDateChange,
    handleStartExamination,
    handleOpenMedicalRecord,
    handleViewHistory,
    handleCloseHistory,
    handleEditVisit,
    handleEditDialogClose,
    handleEditSuccess,
  } = useDoctorDashboard()

  const [activeTab, setActiveTab] = useState("waiting")

  return (
    <div>
      <PageHeader title="Antrian Poli" description="Kelola antrian pasien dan rekam medis">
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <p className="text-muted-foreground text-sm">
              Diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-6 px-6 py-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {statsLoading ? (
          <DoctorStatsSkeleton />
        ) : (
          <DoctorStatsSection stats={stats} onTabChange={setActiveTab} />
        )}

        {queueLoading ? (
          <DoctorQueueSkeleton />
        ) : (
          <DoctorQueueTabs
            waitingQueue={waitingQueue}
            inProgressQueue={inProgressQueue}
            unlockedQueue={unlockedQueue}
            startingExamination={startingExamination}
            onStartExamination={handleStartExamination}
            onOpenMedicalRecord={handleOpenMedicalRecord}
            onViewHistory={handleViewHistory}
            onEditVisit={handleEditVisit}
            headerAction={<QueueDateFilter onDateChange={handleDateChange} />}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </div>

      {selectedPatient && (
        <MedicalRecordHistoryDialog
          open={showHistory}
          onOpenChange={handleCloseHistory}
          patientId={selectedPatient.id}
        />
      )}

      <EditVisitDialog
        open={showEditDialog}
        onOpenChange={handleEditDialogClose}
        visitData={editVisitData}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
