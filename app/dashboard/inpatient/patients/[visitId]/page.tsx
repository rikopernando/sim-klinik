"use client"

import { useParams, useRouter } from "next/navigation"
import { PageGuard } from "@/components/auth/page-guard"
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePatientDetail } from "@/hooks/use-patient-detail"
import { usePermission } from "@/hooks/use-permission"
import { PatientInfoCard } from "@/components/inpatient/patient-info-card"
import { VitalsHistoryTable } from "@/components/inpatient/vitals-history-table"
import { RecordVitalsDialog } from "@/components/inpatient/record-vitals-dialog"
import { CPPTHistoryCard } from "@/components/inpatient/cppt-history-card"
import { CPPTDialog } from "@/components/inpatient/cppt-dialog"
import { MaterialUsageCard } from "@/components/inpatient/material-usage-card"
import { RecordMaterialDialog } from "@/components/inpatient/record-material-dialog"
import { VitalsTrendChart } from "@/components/inpatient/vitals-trend-chart"
import { CPPTTimeline } from "@/components/inpatient/cppt-timeline"
import { CreatePrescriptionDialog } from "@/components/inpatient/create-prescription-dialog"
import { CreateProcedureDialog } from "@/components/inpatient/create-procedure-dialog"
import { PrescriptionsList } from "@/components/inpatient/prescriptions-list"
import { ProceduresList } from "@/components/inpatient/procedures-list"
import { CompleteDischargeDialog } from "@/components/inpatient/complete-discharge-dialog"
import { BedAssignmentHistory } from "@/components/inpatient/bed-assignment-history"
import { VisitLockBanner } from "@/components/inpatient/visit-lock-banner"
import { canFinishInpatient, VisitStatus } from "@/types/visit-status"
import { DischargeSummaryDialog } from "@/components/inpatient/discharge-summary-dialog"
import { DischargeSummaryCard } from "@/components/inpatient/discharge-summary-card"
import { FinalDischargeDialog } from "@/components/inpatient/final-discharge-dialog"
import { useSession } from "@/lib/auth-client"
import { CreateLabOrderDialog, LabOrdersList } from "@/components/laboratory"
import {
  LONG_STAY_WARNING_THRESHOLD,
  LONG_STAY_CRITICAL_THRESHOLD,
} from "@/lib/constants/inpatient"

const ROOM_TYPE_LABELS: Record<string, string> = {
  VIP: "VIP",
  "Class 1": "Kelas 1",
  "Class 2": "Kelas 2",
  "Class 3": "Kelas 3",
  ICU: "ICU",
  NICU: "NICU",
  Isolation: "Isolasi",
}

const VISIT_STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  registered: { label: "Terdaftar", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  waiting: { label: "Menunggu", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300" },
  in_examination: { label: "Dalam Perawatan", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  examined: { label: "Selesai Diperiksa", className: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  ready_for_billing: { label: "Siap Tagihan", className: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  billed: { label: "Sudah Ditagih", className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" },
  paid: { label: "Lunas", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  completed: { label: "Selesai", className: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
  cancelled: { label: "Dibatalkan", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
}

export default function PatientDetailPage() {
  return (
    <PageGuard permissions={["inpatient:read"]}>
      <PatientDetailPageContent />
    </PageGuard>
  )
}

function PatientDetailPageContent() {
  const { data: session } = useSession()
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()

  const { patientDetail, isLoading, refresh } = usePatientDetail(visitId)
  const { hasPermission } = usePermission()

  const isCancelled = patientDetail?.patient.status === "cancelled"

  const isLocked =
    patientDetail?.patient.status === "billed" ||
    patientDetail?.patient.status === "ready_for_billing" ||
    patientDetail?.patient.status === "completed" ||
    isCancelled

  const isAbleToFillTheDischargeSummary =
    !patientDetail?.dischargeSummary &&
    !isLocked &&
    hasPermission("inpatient:write") &&
    session?.user?.role === "doctor"

  if (isLoading) {
    return (
      <div>
        <div className="border-b">
          <div className="container mx-auto max-w-5xl px-6 pt-6 pb-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl space-y-6 px-6 py-6">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!patientDetail) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Data pasien tidak ditemukan</p>
        <Button onClick={() => router.push("/dashboard/inpatient/patients")}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Pasien
        </Button>
      </div>
    )
  }

  const statusConfig = VISIT_STATUS_DISPLAY[patientDetail.patient.status]

  return (
    <div>
      {/* Header — same pattern as PageHeader */}
      <div className="border-b">
        <div className="container mx-auto max-w-5xl px-6 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="bg-primary mt-1 h-6 w-1 shrink-0 rounded-full" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {patientDetail.patient.patientName}
                  </h1>
                  {statusConfig && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusConfig.className
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {patientDetail.patient.mrNumber} • {patientDetail.patient.visitNumber}
                </p>
                {patientDetail.bedAssignment && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-muted-foreground text-xs">
                      <span className="font-mono font-semibold text-foreground">
                        {patientDetail.bedAssignment.roomNumber}
                      </span>
                      {" · Bed "}
                      <span className="text-foreground">
                        {patientDetail.bedAssignment.bedNumber}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">
                      {ROOM_TYPE_LABELS[patientDetail.bedAssignment.roomType] ??
                        patientDetail.bedAssignment.roomType}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        patientDetail.daysInHospital >= LONG_STAY_CRITICAL_THRESHOLD
                          ? "text-destructive"
                          : patientDetail.daysInHospital >= LONG_STAY_WARNING_THRESHOLD
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {patientDetail.daysInHospital} hari rawat
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button onClick={refresh} variant="outline" size="sm">
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Cancelled Visit Banner */}
        {isCancelled && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="destructive">Dibatalkan</Badge>
              Kunjungan rawat inap ini telah dibatalkan. Data hanya dapat dilihat dan tidak dapat
              diubah.
            </AlertDescription>
          </Alert>
        )}

        {/* Lock Banner */}
        {!isCancelled && (
          <VisitLockBanner
            visitStatus={patientDetail.patient.status}
            visitId={visitId}
            patientName={patientDetail.patient.patientName}
            onUnlockSuccess={refresh}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="summary">
          <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-transparent p-0">
            {(
              [
                { value: "summary", label: "Ringkasan" },
                { value: "clinical", label: "Klinis" },
                { value: "treatments", label: "Tindakan & Obat" },
                { value: "discharge", label: "Pemulangan" },
              ] as const
            ).map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-b-primary data-[state=active]:border-t-transparent data-[state=active]:border-r-transparent data-[state=active]:border-l-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab 1: Ringkasan */}
          <TabsContent value="summary" className="mt-4 space-y-6">
            <PatientInfoCard data={patientDetail} />
            <BedAssignmentHistory
              visitId={visitId}
              patientName={patientDetail.patient.patientName}
              currentRoomNumber={patientDetail?.bedAssignment?.roomNumber}
              currentBedNumber={patientDetail?.bedAssignment?.bedNumber}
              onSuccess={refresh}
              history={patientDetail.bedAssignmentHistory}
            />
          </TabsContent>

          {/* Tab 2: Klinis */}
          <TabsContent value="clinical" className="mt-4 space-y-6">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Riwayat Tanda Vital</CardTitle>
                    <CardDescription>
                      {patientDetail.vitals.length > 0
                        ? `${patientDetail.vitals.length} rekaman tanda vital`
                        : "Belum ada rekaman tanda vital"}
                    </CardDescription>
                  </div>
                  {hasPermission("inpatient:write") && !isLocked && (
                    <RecordVitalsDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <VitalsHistoryTable
                  vitals={patientDetail.vitals}
                  onRefresh={refresh}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>

            {/* CPPT */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>CPPT</CardTitle>
                    <CardDescription>
                      {patientDetail.cpptEntries.length > 0
                        ? `${patientDetail.cpptEntries.length} catatan perkembangan pasien`
                        : "Belum ada catatan CPPT"}
                    </CardDescription>
                  </div>
                  {hasPermission("inpatient:write") && !isLocked && (
                    <CPPTDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CPPTHistoryCard
                  entries={patientDetail.cpptEntries}
                  onRefresh={refresh}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Grafik & Analisis</CardTitle>
                <CardDescription>
                  Visualisasi tren vital signs dan timeline CPPT untuk analisis klinis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <VitalsTrendChart vitals={patientDetail.vitals} />
                <CPPTTimeline entries={patientDetail.cpptEntries} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Tindakan & Obat */}
          <TabsContent value="treatments" className="mt-4 space-y-6">
            {/* Material Usage */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Penggunaan Alat Kesehatan</CardTitle>
                    <CardDescription>
                      {patientDetail.materials.length > 0
                        ? `${patientDetail.materials.length} item alat kesehatan · Total: Rp ${new Intl.NumberFormat("id-ID").format(parseFloat(patientDetail.totalMaterialCost))}`
                        : "Belum ada penggunaan alat kesehatan"}
                    </CardDescription>
                  </div>
                  {hasPermission("inpatient:write") && !isLocked && (
                    <RecordMaterialDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <MaterialUsageCard
                  materials={patientDetail.materials}
                  totalCost={patientDetail.totalMaterialCost}
                  onRefresh={refresh}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resep Obat</CardTitle>
                    <CardDescription>
                      {patientDetail.prescriptions.length > 0
                        ? `${patientDetail.prescriptions.length} resep obat`
                        : "Belum ada resep obat"}
                    </CardDescription>
                  </div>
                  {hasPermission("prescriptions:write") && !isLocked && (
                    <CreatePrescriptionDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <PrescriptionsList
                  prescriptions={patientDetail.prescriptions}
                  onRefresh={refresh}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>

            {/* Procedures */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tindakan Medis</CardTitle>
                    <CardDescription>
                      {patientDetail.procedures.length > 0
                        ? `${patientDetail.procedures.length} tindakan medis`
                        : "Belum ada tindakan medis"}
                    </CardDescription>
                  </div>
                  {hasPermission("inpatient:write") && !isLocked && (
                    <CreateProcedureDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ProceduresList
                  procedures={patientDetail.procedures}
                  onRefresh={refresh}
                  isLocked={isLocked}
                />
              </CardContent>
            </Card>

            {/* Laboratory Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pemeriksaan Laboratorium & Radiologi</CardTitle>
                    <CardDescription>Order pemeriksaan penunjang diagnostik</CardDescription>
                  </div>
                  {hasPermission("inpatient:write") && !isLocked && (
                    <CreateLabOrderDialog
                      visitId={visitId}
                      patientId={patientDetail.patient.patientId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <LabOrdersList showSubtotal visitId={visitId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Pemulangan */}
          <TabsContent value="discharge" className="mt-4 space-y-6">
            {/* Discharge Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ringkasan Medis Pulang</CardTitle>
                    <CardDescription>
                      {patientDetail.dischargeSummary
                        ? "Resume medis telah dibuat dan visit telah terkunci"
                        : "Resume medis diperlukan sebelum pasien dapat dipulangkan"}
                    </CardDescription>
                  </div>
                  {isAbleToFillTheDischargeSummary && (
                    <DischargeSummaryDialog
                      visitId={visitId}
                      patientName={patientDetail.patient.patientName}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </CardHeader>
              {!patientDetail.dischargeSummary && (
                <CardContent>
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Ringkasan medis pulang belum dibuat. Dokter harus mengisi ringkasan medis
                    sebelum pasien dapat dipulangkan.
                  </p>
                </CardContent>
              )}
            </Card>

            {patientDetail.dischargeSummary && (
              <DischargeSummaryCard dischargeSummary={patientDetail.dischargeSummary} />
            )}

            {/* Complete Discharge */}
            {canFinishInpatient(patientDetail.patient.status as VisitStatus) &&
              hasPermission("discharge:write") && (
                <CompleteDischargeDialog
                  visitId={visitId}
                  patientName={patientDetail.patient.patientName}
                  onSuccess={refresh}
                />
              )}

            {/* Final Discharge */}
            {patientDetail.dischargeSummary &&
              patientDetail.patient.status === "paid" &&
              hasPermission("discharge:write") && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Pemulangan Pasien</h2>
                    <p className="text-muted-foreground text-sm">
                      Pastikan pembayaran telah lunas sebelum memulangkan pasien
                    </p>
                  </div>
                  <FinalDischargeDialog
                    visitId={visitId}
                    patientName={patientDetail.patient.patientName}
                    roomNumber={patientDetail.bedAssignment?.roomNumber}
                    bedNumber={patientDetail.bedAssignment?.bedNumber}
                    onSuccess={refresh}
                  />
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
