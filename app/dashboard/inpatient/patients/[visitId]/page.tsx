"use client"

/**
 * Inpatient Patient Detail Page
 * Phase 1.3: Patient Detail View
 */

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatientDetail } from "@/hooks/use-patient-detail"
import { usePermission } from "@/hooks/use-permission"
import { IconArrowLeft, IconRefresh } from "@tabler/icons-react"
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

export default function PatientDetailPage() {
  const { visitId } = useParams<{ visitId: string }>()
  const router = useRouter()

  const { patientDetail, isLoading, refresh } = usePatientDetail(visitId)
  const { hasPermission } = usePermission()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
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

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {patientDetail.patient.patientName}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {patientDetail.patient.mrNumber} • {patientDetail.patient.visitNumber}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Patient Info Card */}
        <PatientInfoCard data={patientDetail} />

        {/* Bed Assignment History */}
        <BedAssignmentHistory
          visitId={visitId}
          patientName={patientDetail.patient.patientName}
          currentRoomNumber={patientDetail?.bedAssignment?.roomNumber}
          currentBedNumber={patientDetail?.bedAssignment?.bedNumber}
          onSuccess={refresh}
          history={patientDetail.bedAssignmentHistory}
        />

        <Separator />

        {/* Vital Signs History */}
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
              {hasPermission("inpatient:write") && (
                <RecordVitalsDialog
                  visitId={visitId}
                  patientName={patientDetail.patient.patientName}
                  onSuccess={refresh}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <VitalsHistoryTable vitals={patientDetail.vitals} onRefresh={refresh} />
          </CardContent>
        </Card>

        {/* CPPT History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>CPPT (Catatan Perkembangan Pasien Terintegrasi)</CardTitle>
                <CardDescription>
                  {patientDetail.cpptEntries.length > 0
                    ? `${patientDetail.cpptEntries.length} catatan CPPT`
                    : "Belum ada catatan CPPT"}
                </CardDescription>
              </div>
              {hasPermission("inpatient:write") && (
                <CPPTDialog
                  visitId={visitId}
                  patientName={patientDetail.patient.patientName}
                  onSuccess={refresh}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CPPTHistoryCard entries={patientDetail.cpptEntries} onRefresh={refresh} />
          </CardContent>
        </Card>

        <Separator />

        {/* Charts & Trends Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Grafik & Analisis</h2>
            <p className="text-muted-foreground text-sm">
              Visualisasi tren vital signs dan timeline CPPT untuk analisis klinis
            </p>
          </div>

          {/* Vitals Trend Chart */}
          <VitalsTrendChart vitals={patientDetail.vitals} />

          {/* CPPT Timeline */}
          <CPPTTimeline entries={patientDetail.cpptEntries} />
        </div>

        <Separator />

        {/* Material Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Penggunaan Alat Kesehatan</CardTitle>
                <CardDescription>
                  {patientDetail.materials.length > 0
                    ? `${patientDetail.materials.length} item alat kesehatan• Total: Rp ${new Intl.NumberFormat("id-ID").format(parseFloat(patientDetail.totalMaterialCost))}`
                    : "Belum ada penggunaan lat kesehatan"}
                </CardDescription>
              </div>
              {hasPermission("inpatient:write") && (
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
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Prescriptions Section */}
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
              {hasPermission("prescriptions:write") && (
                <CreatePrescriptionDialog
                  visitId={visitId}
                  patientName={patientDetail.patient.patientName}
                  onSuccess={refresh}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <PrescriptionsList prescriptions={patientDetail.prescriptions} onRefresh={refresh} />
          </CardContent>
        </Card>

        {/* Procedures Section */}
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
              {hasPermission("inpatient:write") && (
                <CreateProcedureDialog
                  visitId={visitId}
                  patientName={patientDetail.patient.patientName}
                  onSuccess={refresh}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ProceduresList procedures={patientDetail.procedures} onRefresh={refresh} />
          </CardContent>
        </Card>

        <Separator />
        {hasPermission("discharge:write") && (
          <CompleteDischargeDialog
            visitId={visitId}
            patientName={patientDetail.patient.patientName}
            onSuccess={refresh}
          />
        )}
      </div>
    </div>
  )
}
