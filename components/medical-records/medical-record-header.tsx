/**
 * Medical Record Header Component
 * Displays title, visit information, and status badges
 */

import { useCallback, useState } from "react"
import { Lock, History } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog"
import { QueuePatient } from "@/hooks/use-doctor-queue"
import { Visit } from "@/types/medical-record"

interface MedicalRecordHeaderProps {
  visitId: number
  isLocked: boolean
  isDraft: boolean
  visit: Visit
}

export function MedicalRecordHeader({
  visit,
  visitId,
  isLocked,
  isDraft,
}: MedicalRecordHeaderProps) {
  const [showHistory, setShowHistory] = useState(false)

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false)
  }, [])

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rekam Medis Elektronik</h1>
        <p className="text-muted-foreground">Kunjungan #{visitId}</p>
      </div>
      <div className="flex gap-2">
        {isLocked && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Terkunci
          </Badge>
        )}
        {isDraft && !isLocked && <Badge variant="outline">Draft</Badge>}
        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
          <History className="mr-1 h-4 w-4" />
          Riwayat
        </Button>
      </div>

      {/* Medical Record History Dialog */}
      {visit.patientId && (
        <MedicalRecordHistoryDialog
          open={showHistory}
          onOpenChange={handleCloseHistory}
          patientId={visit.patientId}
          // patientName={visit.patientName}
        />
      )}
    </div>
  )
}
