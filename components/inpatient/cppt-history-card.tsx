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
}

export function CPPTHistoryCard({ entries, onRefresh }: CPPTHistoryCardProps) {
  return <CPPTHistory entries={entries} onRefresh={onRefresh} />
}
