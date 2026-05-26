"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, RefreshCw, Clock, User, Pencil, X, MoreHorizontal, Bed } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { VISIT_STATUS_INFO, type VisitStatus } from "@/types/visit-status"
import { QueueItem } from "@/types/dashboard"

import { EditVisitData, EditVisitDialog } from "./edit-visit-dialog"
import { CancelVisitDialog } from "./cancel-visit-dialog"
import { TransferToInpatientDialog } from "./transfer-to-inpatient-dialog"

interface QueueDisplayProps {
  poliId?: number
  visitType?: "outpatient" | "inpatient" | "emergency"
  autoRefresh?: boolean
  refreshInterval?: number
  date?: string
  dateFrom?: string
  dateTo?: string
}

function getWaitMinutes(arrivalTime: string): number {
  return Math.floor((Date.now() - new Date(arrivalTime).getTime()) / 60000)
}

function formatWait(minutes: number): string {
  if (minutes < 1) return "Baru tiba"
  if (minutes < 60) return `${minutes} mnt`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}j ${m}m` : `${h} jam`
}

const TRIAGE_BORDER: Record<string, string> = {
  red: "border-l-4 border-l-red-500",
  yellow: "border-l-4 border-l-yellow-500",
  green: "border-l-4 border-l-green-500",
}

// Status-based card background tints
const STATUS_BG: Partial<Record<VisitStatus, string>> = {
  in_examination: "bg-blue-50/60 dark:bg-blue-950/20",
  examined: "bg-purple-50/60 dark:bg-purple-950/20",
}

export function QueueDisplay({
  poliId,
  visitType = "outpatient",
  autoRefresh = true,
  refreshInterval = 30000,
  date,
  dateFrom,
  dateTo,
}: QueueDisplayProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null)
  const [editVisitData, setEditVisitData] = useState<EditVisitData | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      const params = new URLSearchParams({ visitType })
      if (poliId) params.append("poliId", poliId.toString())
      if (date) {
        params.append("date", date)
      } else if (dateFrom || dateTo) {
        if (dateFrom) params.append("dateFrom", dateFrom)
        if (dateTo) params.append("dateTo", dateTo)
      }

      const response = await fetch(`/api/visits?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch queue")

      const data = await response.json()
      setQueue(data.data)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError("Gagal memuat antrian. Silakan refresh.")
      console.error("Queue fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [poliId, visitType, date, dateFrom, dateTo])

  useEffect(() => {
    fetchQueue()
    if (autoRefresh) {
      const interval = setInterval(fetchQueue, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [poliId, visitType, autoRefresh, refreshInterval, fetchQueue, date, dateFrom, dateTo])

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  const getTriageBadge = (status: string | null) => {
    if (!status) return null
    const colors = {
      red: "bg-red-500 hover:bg-red-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600",
      green: "bg-green-500 hover:bg-green-600",
    }
    const labels = { red: "Merah", yellow: "Kuning", green: "Hijau" }
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = VISIT_STATUS_INFO[status as VisitStatus]
    if (!statusInfo) return <Badge variant="secondary">{status}</Badge>
    return (
      <Badge className={cn(statusInfo.bgColor, statusInfo.color, "border-0")} variant="outline">
        {statusInfo.label}
      </Badge>
    )
  }

  const handleEditClick = (item: QueueItem) => {
    const data: EditVisitData = {
      visit: {
        id: item.visit.id,
        visitNumber: item.visit.visitNumber,
        visitType: item.visit.visitType,
        status: item.visit.status,
        queueNumber: item.visit.queueNumber,
        poliId: item.visit.poliId,
        doctorId: item.visit.doctorId,
      },
      patient: {
        id: item.visit.patientId,
        mrNumber: item.patient?.mrNumber || "",
        name: item.patient?.name || "",
      },
    }
    setEditVisitData(data)
    setEditDialogOpen(true)
  }

  const handleCancelClick = (item: QueueItem) => {
    setSelectedItem(item)
    setCancelDialogOpen(true)
  }

  const handleTransferClick = (item: QueueItem) => {
    setSelectedItem(item)
    setTransferDialogOpen(true)
  }

  const handleDialogSuccess = () => fetchQueue()

  const emptyStateText =
    visitType === "inpatient"
      ? "Tidak ada pasien rawat inap aktif"
      : "Tidak ada pasien dalam antrian"

  const emptyStateSubtext =
    visitType === "inpatient"
      ? "Belum ada pasien yang sedang dirawat"
      : "Antrian kosong untuk saat ini"

  return (
    <div className="space-y-4">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Diperbarui: {lastUpdate.toLocaleTimeString("id-ID")}
        </p>
        <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Loading State */}
      {isLoading && queue.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && queue.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <User className="text-muted-foreground/40 h-10 w-10" />
          <p className="font-medium">{emptyStateText}</p>
          <p className="text-muted-foreground text-sm">{emptyStateSubtext}</p>
        </div>
      )}

      {/* Queue List */}
      {!isLoading && queue.length > 0 && (
        <div className="space-y-2">
          {/* Count bar */}
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-primary h-2 w-2 rounded-full" />
            <span className="text-muted-foreground">Total antrian:</span>
            <span className="font-semibold">{queue.length} pasien</span>
          </div>

          {queue.map((item, index) => {
            const waitMins = getWaitMinutes(item.visit.arrivalTime)
            const isLongWait = waitMins >= 30
            const triageBorder =
              visitType === "emergency" && item.visit.triageStatus
                ? (TRIAGE_BORDER[item.visit.triageStatus] ?? "")
                : ""
            const statusBg = STATUS_BG[item.visit.status as VisitStatus] ?? ""

            return (
              <div
                key={item.visit.id}
                className={cn(
                  "bg-card rounded-xl border px-4 py-3 shadow-sm transition-all",
                  index === 0 && !statusBg ? "border-primary/40 bg-primary/5" : "",
                  statusBg,
                  triageBorder,
                  !statusBg && index !== 0 ? "hover:shadow-md" : ""
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Queue Number */}
                    {item.visit.queueNumber && (
                      <div className="bg-primary text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-base font-bold tabular-nums">
                        {item.visit.queueNumber}
                      </div>
                    )}

                    {/* Patient Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{item.patient?.name}</h4>
                        {item.patient?.gender && (
                          <Badge variant="outline" className="text-xs">
                            {item.patient.gender === "male" ? "L" : "P"}
                          </Badge>
                        )}
                        {visitType === "emergency" && getTriageBadge(item.visit.triageStatus)}
                        {index === 0 && (
                          <span className="rounded-full bg-[#74c69d] px-2 py-0.5 text-xs font-medium text-white">
                            Sekarang
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs">
                        <span>No. RM: {item.patient?.mrNumber}</span>
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(item.visit.arrivalTime)}</span>
                        <span>·</span>
                        <span
                          className={cn(
                            "font-medium",
                            isLongWait
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatWait(waitMins)}
                        </span>
                        {/* Poli / Doctor info */}
                        {item.poli?.name && (
                          <>
                            <span>·</span>
                            <span className="text-foreground/70 font-medium">{item.poli.name}</span>
                          </>
                        )}
                        {item.doctor?.name && (
                          <>
                            <span>·</span>
                            <span>{item.doctor.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + quick edit + more actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {getStatusBadge(item.visit.status)}
                    {/* Quick edit button — always visible */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Aksi lainnya</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {visitType === "outpatient" && (
                          <DropdownMenuItem onClick={() => handleTransferClick(item)}>
                            <Bed className="mr-2 h-4 w-4" />
                            Transfer ke Rawat Inap
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleCancelClick(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Batalkan Kunjungan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <EditVisitDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        visitData={editVisitData}
        onSuccess={handleDialogSuccess}
      />
      <CancelVisitDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        queueItem={selectedItem}
        onSuccess={handleDialogSuccess}
      />
      {selectedItem && (
        <TransferToInpatientDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          visitId={selectedItem.visit.id}
          patientName={selectedItem.patient?.name || ""}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  )
}
