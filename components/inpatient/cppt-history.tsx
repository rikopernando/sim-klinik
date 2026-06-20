/**
 * CPPT History Component
 * Timeline view of all CPPT entries for a patient
 */

"use client"

import { IconNotes } from "@tabler/icons-react"
import { CPPT } from "@/types/inpatient"
import { CPPTEntryCard } from "./cppt-entry-card"

interface CPPTHistoryProps {
  entries: CPPT[]
  onRefresh?: () => void
  isLocked?: boolean
}

export function CPPTHistory({ entries, onRefresh, isLocked = false }: CPPTHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <IconNotes className="text-muted-foreground/30 mb-3 h-10 w-10" />
        <p className="text-muted-foreground text-sm">Belum ada catatan CPPT</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <CPPTEntryCard key={entry.id} entry={entry} onRefresh={onRefresh} isLocked={isLocked} />
      ))}
    </div>
  )
}
