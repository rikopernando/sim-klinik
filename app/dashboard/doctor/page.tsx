"use client"

/**
 * Doctor Dashboard (H.3.3)
 * Patient queue, quick access to RME, and patient history
 */

import { PageGuard } from "@/components/auth/page-guard"
import { AlertCircle } from "lucide-react"
import { useDoctorDashboard } from "@/hooks/use-doctor-dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog"
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog"
import { QueueDateFilter } from "@/components/visits/queue-date-filter"
import { DoctorHeader } from "@/components/doctor/doctor-header"
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
    // State
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

    // Handlers
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

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <DoctorHeader lastRefresh={lastRefresh} onRefresh={handleRefreshAll} />

      {/* Statistics Section */}
      {statsLoading ? <DoctorStatsSkeleton /> : <DoctorStatsSection stats={stats} />}

      {/* Patient Queue Section */}
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
        />
      )}

      {/* Medical Record History Dialog */}
      {selectedPatient && (
        <MedicalRecordHistoryDialog
          open={showHistory}
          onOpenChange={handleCloseHistory}
          patientId={selectedPatient.id}
        />
      )}

      {/* Edit Visit Dialog */}
      <EditVisitDialog
        open={showEditDialog}
        onOpenChange={handleEditDialogClose}
        visitData={editVisitData}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
