/**
 * CPPT History Component
 * Timeline view of all CPPT entries for a patient
 */

"use client"

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
      <div className="text-muted-foreground py-8 text-center">Belum ada catatan CPPT tercatat</div>
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
