/**
 * CPPT History Card Component
 * Displays history of CPPT (Integrated Progress Notes) entries
 * Enhanced with delete functionality and role-based styling
 */

"use client"

import { CPPT } from "@/types/inpatient"
import { CPPTHistory } from "./cppt-history"

interface CPPTHistoryCardProps {
  entries: CPPT[]
  onRefresh?: () => void
  isLocked?: boolean
}

export function CPPTHistoryCard({ entries, onRefresh, isLocked = false }: CPPTHistoryCardProps) {
  return <CPPTHistory entries={entries} onRefresh={onRefresh} isLocked={isLocked} />
}
