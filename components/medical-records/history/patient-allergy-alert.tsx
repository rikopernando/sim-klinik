/**
 * Patient Allergy Alert Component
 * Displays patient allergies in a warning card
 */

import { AlertCircle } from "lucide-react"

interface PatientAllergyAlertProps {
  allergies: string
}

export function PatientAllergyAlert({ allergies }: PatientAllergyAlertProps) {
  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900/50 dark:bg-yellow-950/20">
      <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Alergi
      </div>
      <p className="mt-1 text-sm text-yellow-900 dark:text-yellow-300">{allergies}</p>
    </div>
  )
}
