/**
 * Doctor Dashboard Queue Tabs
 */

import { DashboardSection, ListWidget } from "@/components/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QueueItem, QueuePatient } from "@/types/dashboard"
import { Clock, Activity, FileText, Users, Stethoscope } from "lucide-react"

interface DoctorQueueTabsProps {
  waitingQueue: QueueItem[]
  inProgressQueue: QueueItem[]
  unlockedQueue: QueueItem[]
  startingExamination: string | null
  onStartExamination: (visitId: string) => void
  onOpenMedicalRecord: (visitId: string) => void
  onViewHistory: (patient: QueuePatient | null) => void
}

export function DoctorQueueTabs({
  waitingQueue,
  inProgressQueue,
  unlockedQueue,
  startingExamination,
  onStartExamination,
  onOpenMedicalRecord,
  onViewHistory,
}: DoctorQueueTabsProps) {
  return (
    <DashboardSection title="Antrian Pasien" description="Daftar pasien yang perlu ditangani">
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waiting">Menunggu ({waitingQueue.length})</TabsTrigger>
          <TabsTrigger value="in_progress">Sedang Diperiksa ({inProgressQueue.length})</TabsTrigger>
          <TabsTrigger value="unlocked">RME Belum Dikunci ({unlockedQueue.length})</TabsTrigger>
        </TabsList>

        {/* Waiting Queue */}
        <TabsContent value="waiting">
          <ListWidget
            title="Pasien Menunggu"
            icon={Clock}
            items={waitingQueue.map((item) => ({
              id: item.visit.id,
              title: item.patient?.name || "Unknown Patient",
              subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"} • Queue: ${item.visit.queueNumber || "-"}`,
              icon: Users,
              badge: {
                label: item.visit.visitType === "emergency" ? "UGD" : "Rawat Jalan",
                variant: item.visit.visitType === "emergency" ? "destructive" : "outline",
              },
              action: {
                label: startingExamination === item.visit.id ? "Memulai..." : "Mulai",
                onClick: () => onStartExamination(item.visit.id),
                disabled: startingExamination !== null,
              },
            }))}
            emptyMessage="Tidak ada pasien dalam antrian"
            maxHeight="450px"
            onItemClick={(item) => {
              const queueItem = waitingQueue.find((q) => q.visit.id === item.id)
              if (queueItem) {
                onViewHistory(queueItem.patient)
              }
            }}
          />
        </TabsContent>

        {/* In Progress Queue */}
        <TabsContent value="in_progress">
          <ListWidget
            title="Sedang Diperiksa"
            icon={Activity}
            items={inProgressQueue.map((item) => ({
              id: item.visit.id,
              title: item.patient?.name || "Unknown Patient",
              subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"}`,
              icon: Stethoscope,
              badge: {
                label: "Dalam Pemeriksaan",
                variant: "default",
              },
              action: {
                label: "Lanjutkan",
                onClick: () => onOpenMedicalRecord(item.visit.id),
              },
            }))}
            emptyMessage="Tidak ada pasien yang sedang diperiksa"
            maxHeight="450px"
            onItemClick={(item) => {
              const queueItem = inProgressQueue.find((q) => q.visit.id === item.id)
              if (queueItem) {
                onViewHistory(queueItem.patient)
              }
            }}
          />
        </TabsContent>

        {/* Unlocked Medical Records */}
        <TabsContent value="unlocked">
          <ListWidget
            title="RME Belum Dikunci"
            icon={FileText}
            items={unlockedQueue.map((item) => ({
              id: item.visit.id,
              title: item.patient?.name || "Unknown Patient",
              subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"}`,
              icon: FileText,
              badge: {
                label: "Belum Dikunci",
                variant: "destructive",
              },
              action: {
                label: "Kunci RME",
                onClick: () => onOpenMedicalRecord(item.visit.id),
              },
            }))}
            emptyMessage="Semua RME sudah dikunci"
            maxHeight="450px"
            onItemClick={(item) => {
              onOpenMedicalRecord(item?.id as string)
            }}
          />
        </TabsContent>
      </Tabs>
    </DashboardSection>
  )
}
