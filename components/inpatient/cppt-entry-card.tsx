"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { id as localeId } from "date-fns/locale"
import { IconTrash, IconChevronDown, IconChevronUp } from "@tabler/icons-react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteCPPTEntry } from "@/lib/services/inpatient.service"
import { CPPT } from "@/types/inpatient"

interface CPPTEntryCardProps {
  entry: CPPT
  onRefresh?: () => void
  isLocked?: boolean
}

export function CPPTEntryCard({ entry, onRefresh, isLocked = false }: CPPTEntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canDelete = (createdAt: string) => {
    return Date.now() - new Date(createdAt).getTime() <= 3_600_000
  }

  const handleDelete = async (cpptId: string) => {
    try {
      setDeletingId(cpptId)
      await deleteCPPTEntry(cpptId)
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
      setDeletingId(null)
    }
  }

  const isDoctor = entry.authorRole === "doctor"
  const hasSOAP = entry.subjective || entry.objective || entry.assessment || entry.plan

  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{entry.authorName || "Unknown User"}</span>
            <Badge
              variant="outline"
              className={
                isDoctor
                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
              }
            >
              {isDoctor ? "Dokter" : "Perawat"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasSOAP && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0"
            >
              {expanded ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
          {canDelete(entry.createdAt) && !isLocked && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive h-7 w-7 p-0"
                  disabled={deletingId === entry.id}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
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
                  <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* SOAP (expandable) */}
      {hasSOAP && expanded && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {entry.subjective && (
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                S — Subjective
              </p>
              <p className="mt-0.5 text-sm">{entry.subjective}</p>
            </div>
          )}
          {entry.objective && (
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                O — Objective
              </p>
              <p className="mt-0.5 text-sm">{entry.objective}</p>
            </div>
          )}
          {entry.assessment && (
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                A — Assessment
              </p>
              <p className="mt-0.5 text-sm">{entry.assessment}</p>
            </div>
          )}
          {entry.plan && (
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                P — Plan
              </p>
              <p className="mt-0.5 text-sm">{entry.plan}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Note */}
      <div className="mt-3 border-t pt-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Catatan Perkembangan
        </p>
        <p className="mt-0.5 text-sm whitespace-pre-wrap">{entry.progressNote}</p>
      </div>

      {/* Instructions */}
      {entry.instructions && (
        <div className="mt-3 border-t pt-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Instruksi Khusus
          </p>
          <p className="mt-0.5 text-sm whitespace-pre-wrap">{entry.instructions}</p>
        </div>
      )}
    </div>
  )
}
