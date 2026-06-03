"use client"

import { useCallback, useState } from "react"
import { Lock, History } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog"
import { Visit } from "@/types/medical-record"

interface MedicalRecordHeaderProps {
  isLocked: boolean
  isDraft: boolean
  visit: Visit
}

export function MedicalRecordHeader({ visit, isLocked, isDraft }: MedicalRecordHeaderProps) {
  const [showHistory, setShowHistory] = useState(false)

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false)
  }, [])

  return (
    <>
      <PageHeader title="Rekam Medis Elektronik" description={`Kunjungan #${visit.visitNumber}`}>
        {isLocked && (
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Terkunci
          </Badge>
        )}
        {isDraft && !isLocked && <Badge variant="outline">Draft</Badge>}
        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
          <History className="mr-1.5 h-3.5 w-3.5" />
          Riwayat
        </Button>
      </PageHeader>

      {visit.patientId && (
        <MedicalRecordHistoryDialog
          open={showHistory}
          onOpenChange={handleCloseHistory}
          patientId={visit.patientId}
        />
      )}
    </>
  )
}
