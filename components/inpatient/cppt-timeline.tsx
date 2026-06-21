"use client"

import { useState, useMemo } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { IconClock, IconChevronDown, IconChevronUp, IconNotes, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { deleteCPPTEntry } from "@/lib/services/inpatient.service"
import { CPPT } from "@/types/inpatient"

interface CPPTTimelineProps {
  entries: CPPT[]
  onRefresh?: () => void
  isLocked?: boolean
}

type DateRange = "24h" | "3d" | "7d" | "all"

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "24 Jam" },
  { value: "3d", label: "3 Hari" },
  { value: "7d", label: "7 Hari" },
  { value: "all", label: "Semua" },
]

const canDelete = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() <= 3_600_000

export function CPPTTimeline({ entries, onRefresh, isLocked = false }: CPPTTimelineProps) {
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    if (dateRange === "all") return sorted
    const rangeMs = { "24h": 86_400_000, "3d": 259_200_000, "7d": 604_800_000 }[dateRange]
    return sorted.filter((e) => new Date(e.createdAt).getTime() >= Date.now() - rangeMs)
  }, [entries, dateRange])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteCPPTEntry(deleteId)
      toast.success("Catatan CPPT berhasil dihapus")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting CPPT entry:", error)
      if (error instanceof Error && error.message.includes("time window")) {
        toast.error("Catatan CPPT hanya dapat dihapus dalam 1 jam setelah dibuat")
      } else {
        toast.error("Gagal menghapus catatan CPPT")
      }
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <IconNotes className="text-muted-foreground/30 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Belum ada catatan CPPT</p>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Date range selector */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{filteredEntries.length} entri</p>
          <div className="flex gap-1 rounded-lg border p-0.5">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  dateRange === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground text-sm">
              Tidak ada data dalam rentang waktu ini
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="bg-border absolute top-0 bottom-0 left-6 w-0.5" />

            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const isDoctor = entry.authorRole === "doctor"
                const hasSOAP =
                  entry.subjective || entry.objective || entry.assessment || entry.plan
                const isExpanded = expandedIds.has(entry.id)
                const showDelete = canDelete(entry.createdAt) && !isLocked

                return (
                  <div key={entry.id} className="relative pl-14">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "border-background absolute top-2.5 left-4 h-4 w-4 rounded-full border-4",
                        isDoctor ? "bg-blue-500" : "bg-emerald-500"
                      )}
                    />

                    <div className="rounded-lg border bg-card p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">
                              {entry.authorName || "Unknown User"}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                isDoctor
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                              )}
                            >
                              {isDoctor ? "Dokter" : "Perawat"}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                            <IconClock className="h-3 w-3" />
                            <span>
                              {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: localeId,
                              })}
                            </span>
                            <span>·</span>
                            <span>
                              {formatDistanceToNow(new Date(entry.createdAt), {
                                addSuffix: true,
                                locale: localeId,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {hasSOAP && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleExpanded(entry.id)}
                            >
                              {isExpanded ? (
                                <IconChevronUp className="h-4 w-4" />
                              ) : (
                                <IconChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {showDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-destructive/10 hover:text-destructive h-7 w-7 p-0"
                              onClick={() => setDeleteId(entry.id)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* SOAP (expandable) */}
                      {hasSOAP && isExpanded && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {entry.subjective && (
                            <div>
                              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                S — Subjective
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {entry.subjective}
                              </p>
                            </div>
                          )}
                          {entry.objective && (
                            <div>
                              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                O — Objective
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {entry.objective}
                              </p>
                            </div>
                          )}
                          {entry.assessment && (
                            <div>
                              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                A — Assessment
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {entry.assessment}
                              </p>
                            </div>
                          )}
                          {entry.plan && (
                            <div>
                              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                P — Plan
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs">{entry.plan}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress Note */}
                      <div className="mt-3">
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          Catatan Perkembangan
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs whitespace-pre-wrap">
                          {entry.progressNote}
                        </p>
                      </div>

                      {/* Instructions */}
                      {entry.instructions && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                            Instruksi Khusus
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs whitespace-pre-wrap">
                            {entry.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catatan CPPT?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan CPPT yang dihapus tidak dapat dikembalikan. Tindakan ini hanya dapat
              dilakukan dalam 1 jam setelah dibuat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
