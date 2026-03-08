"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, RefreshCw, Clock, User, Pencil, X, MoreHorizontal, Bed } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
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
  refreshInterval?: number // milliseconds
  date?: string // YYYY-MM-DD format
  dateFrom?: string // YYYY-MM-DD format
  dateTo?: string // YYYY-MM-DD format
}

export function QueueDisplay({
  poliId,
  visitType = "outpatient",
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  date,
  dateFrom,
  dateTo,
}: QueueDisplayProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Edit/Cancel/Transfer dialogs state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null)
  const [editVisitData, setEditVisitData] = useState<EditVisitData | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      // Get visits that are waiting in queue
      // Include: registered, waiting, in_examination
      const params = new URLSearchParams({
        visitType,
      })

      if (poliId) {
        params.append("poliId", poliId.toString())
      }

      // Add date filters
      if (date) {
        params.append("date", date)
      } else if (dateFrom || dateTo) {
        if (dateFrom) params.append("dateFrom", dateFrom)
        if (dateTo) params.append("dateTo", dateTo)
      }

      const response = await fetch(`/api/visits?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch queue")
      }

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTriageBadge = (status: string | null) => {
    if (!status) return null

    const colors = {
      red: "bg-red-500 hover:bg-red-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600",
      green: "bg-green-500 hover:bg-green-600",
    }

    const labels = {
      red: "Merah",
      yellow: "Kuning",
      green: "Hijau",
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    // Use actual visit status info from the system
    const statusInfo = VISIT_STATUS_INFO[status as VisitStatus]

    if (!statusInfo) {
      // Fallback for unknown status
      return <Badge variant="secondary">{status}</Badge>
    }

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

  const handleDialogSuccess = () => {
    fetchQueue()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Antrian Pasien</h3>
          <p className="text-muted-foreground text-sm">
            Terakhir diperbarui: {lastUpdate.toLocaleTimeString("id-ID")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 text-sm">{error}</div>
      )}

      {/* Loading State */}
      {isLoading && queue.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && queue.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Tidak ada pasien dalam antrian</p>
            <p className="text-muted-foreground text-sm">Antrian kosong untuk saat ini</p>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      {!isLoading && queue.length > 0 && (
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-md px-4 py-2 text-sm font-medium">
            Total Antrian: {queue.length} pasien
          </div>

          {queue.map((item, index) => (
            <Card
              key={item.visit.id}
              className={cn(
                "py-0 transition-all hover:shadow-md",
                index === 0 && "border-primary ring-primary/20 ring-2"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* Queue Number */}
                    {item.visit.queueNumber && (
                      <div className="bg-primary text-primary-foreground flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg text-2xl font-bold">
                        {item.visit.queueNumber}
                      </div>
                    )}

                    {/* Patient Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{item.patient?.name}</h4>
                        {item.patient?.gender && (
                          <Badge variant="outline" className="text-xs">
                            {item.patient.gender === "male" ? "L" : "P"}
                          </Badge>
                        )}
                        {visitType === "emergency" && getTriageBadge(item.visit.triageStatus)}
                      </div>

                      <div className="text-muted-foreground text-sm">
                        <div>No. RM: {item.patient?.mrNumber}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Kedatangan: {formatTime(item.visit.arrivalTime)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge and Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.visit.status)}
                      {/* Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Kunjungan
                          </DropdownMenuItem>
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
                    {index === 0 && <Badge className="bg-blue-500">Sekarang</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Visit Dialog */}
      <EditVisitDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        visitData={editVisitData}
        onSuccess={handleDialogSuccess}
      />

      {/* Cancel Visit Dialog */}
      <CancelVisitDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        queueItem={selectedItem}
        onSuccess={handleDialogSuccess}
      />

      {/* Transfer to Inpatient Dialog */}
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
