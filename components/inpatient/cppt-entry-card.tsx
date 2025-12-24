/**
 * CPPT Entry Card Component
 * Displays a single CPPT entry with role-based styling
 */

"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { id as localeId } from "date-fns/locale"
import {
  IconUser,
  IconStethoscope,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
}

export function CPPTEntryCard({ entry, onRefresh }: CPPTEntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canDelete = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const timeDiff = now.getTime() - created.getTime()
    const oneHour = 3600000 // 1 hour in milliseconds
    return timeDiff <= oneHour
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
    <Card
      className={`${
        isDoctor
          ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
          : "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isDoctor ? (
              <IconStethoscope className="h-5 w-5 text-blue-600" />
            ) : (
              <IconUser className="h-5 w-5 text-green-600" />
            )}
            <div>
              <CardTitle className="text-base">
                {entry.authorName || "Unknown User"}
                <Badge variant={isDoctor ? "default" : "secondary"} className="ml-2">
                  {isDoctor ? "Dokter" : "Perawat"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasSOAP && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <IconChevronUp className="h-4 w-4" />
                ) : (
                  <IconChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {canDelete(entry.createdAt) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={deletingId === entry.id}>
                    <IconTrash className="h-4 w-4 text-red-600" />
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
      </CardHeader>
      <CardContent className="space-y-3">
        {/* SOAP Format for Doctors (Expandable) */}
        {isDoctor && hasSOAP && expanded && (
          <div className="space-y-3 border-t pt-3">
            {entry.subjective && (
              <div>
                <p className="text-sm font-semibold text-blue-700">S - Subjective</p>
                <p className="text-muted-foreground text-sm">{entry.subjective}</p>
              </div>
            )}
            {entry.objective && (
              <div>
                <p className="text-sm font-semibold text-blue-700">O - Objective</p>
                <p className="text-muted-foreground text-sm">{entry.objective}</p>
              </div>
            )}
            {entry.assessment && (
              <div>
                <p className="text-sm font-semibold text-blue-700">A - Assessment</p>
                <p className="text-muted-foreground text-sm">{entry.assessment}</p>
              </div>
            )}
            {entry.plan && (
              <div>
                <p className="text-sm font-semibold text-blue-700">P - Plan</p>
                <p className="text-muted-foreground text-sm">{entry.plan}</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Note */}
        <div>
          <p className="text-sm font-semibold">Catatan Perkembangan</p>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{entry.progressNote}</p>
        </div>

        {/* Instructions */}
        {entry.instructions && (
          <div className="border-t pt-3">
            <p className="text-sm font-semibold">Instruksi Khusus</p>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {entry.instructions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
