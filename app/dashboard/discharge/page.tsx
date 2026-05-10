"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RefreshCw, UserCheck, Clock, BedDouble, Stethoscope, Zap } from "lucide-react"
import { PageGuard } from "@/components/auth/page-guard"
import { FinalDischargeDialog } from "@/components/inpatient/final-discharge-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useDischargeQueue } from "@/hooks/use-discharge-queue"
import { updateVisitStatus } from "@/lib/services/visits.service"
import { getErrorMessage } from "@/lib/utils/error"
import { cn } from "@/lib/utils"
import type { VisitHistoryItem } from "@/types/visit-history"

export default function DischargePage() {
  return (
    <PageGuard roles={["super_admin", "admin", "doctor", "cashier", "nurse", "receptionist"]}>
      <DischargeContent />
    </PageGuard>
  )
}

type VisitTypeFilter = "all" | "outpatient" | "inpatient" | "emergency"

const TABS: { value: VisitTypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "Semua", icon: <UserCheck className="h-3.5 w-3.5" /> },
  { value: "outpatient", label: "Rawat Jalan", icon: <Stethoscope className="h-3.5 w-3.5" /> },
  { value: "inpatient", label: "Rawat Inap", icon: <BedDouble className="h-3.5 w-3.5" /> },
  { value: "emergency", label: "UGD", icon: <Zap className="h-3.5 w-3.5" /> },
]

const VISIT_TYPE_META: Record<string, { label: string; color: string }> = {
  outpatient: {
    label: "Rawat Jalan",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  inpatient: {
    label: "Rawat Inap",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  emergency: {
    label: "UGD",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

function DischargeContent() {
  const { visits, isLoading, refresh, removeVisit } = useDischargeQueue()
  const [activeTab, setActiveTab] = useState<VisitTypeFilter>("all")

  const filtered =
    activeTab === "all" ? visits : visits.filter((v) => v.visit.visitType === activeTab)

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <UserCheck className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pasien Pulang</h1>
            <p className="text-muted-foreground text-sm">
              Konfirmasi kepulangan pasien yang telah menyelesaikan pembayaran
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <div className="bg-muted/40 inline-flex rounded-lg border p-0.5">
          {TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? visits.length
                : visits.filter((v) => v.visit.visitType === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      activeTab === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <VisitCard
              key={item.visit.id}
              item={item}
              onSuccess={() => removeVisit(item.visit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VisitCard({ item, onSuccess }: { item: VisitHistoryItem; onSuccess: () => void }) {
  const [isCompleting, setIsCompleting] = useState(false)
  const { visit, patient, poli, doctor } = item
  const meta = VISIT_TYPE_META[visit.visitType]

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await updateVisitStatus(visit.id, "completed")
      toast.success(`${patient.name} berhasil dipulangkan.`)
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsCompleting(false)
    }
  }

  const arrivalDate = new Date(visit.arrivalTime)
  const timeLabel = arrivalDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{patient.name}</span>
          <span className="text-muted-foreground font-mono text-xs">{patient.mrNumber}</span>
          <Badge variant="outline" className={cn("border-0 px-2 py-0.5 text-[11px]", meta?.color)}>
            {meta?.label ?? visit.visitType}
          </Badge>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-mono">{visit.visitNumber}</span>
          {poli && <span>· {poli.name}</span>}
          {doctor && <span>· dr. {doctor.name}</span>}
          {visit.visitType === "emergency" && visit.chiefComplaint && (
            <span className="truncate">· {visit.chiefComplaint}</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLabel}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {visit.visitType === "inpatient" ? (
          <FinalDischargeDialog
            visitId={visit.id}
            patientName={patient.name}
            onSuccess={onSuccess}
          />
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isCompleting}>
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                Selesaikan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Kepulangan</AlertDialogTitle>
                <AlertDialogDescription>
                  Tandai <strong>{patient.name}</strong> ({visit.visitNumber}) sebagai selesai dan
                  pulang? Kunjungan akan ditutup dan tidak dapat diubah.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleComplete}>Ya, Selesaikan</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card flex items-center justify-between gap-4 rounded-xl border p-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <UserCheck className="text-muted-foreground h-7 w-7" />
      </div>
      <p className="font-medium">Tidak ada pasien yang menunggu kepulangan</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Pasien yang sudah membayar akan muncul di sini untuk dikonfirmasi kepulangannya.
      </p>
    </div>
  )
}
