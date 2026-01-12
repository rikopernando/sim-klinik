/**
 * Inpatient Fields Component
 * Information display for inpatient visits
 * Note: Bed assignment is done separately after registration
 */

import { Info } from "lucide-react"

export function InpatientFields() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pasien Rawat Inap</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Setelah pendaftaran selesai, Anda akan diarahkan untuk mengalokasikan kamar dan bed
            untuk pasien ini.
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 Alokasi bed dapat dilakukan nanti jika belum ada kamar yang tersedia
          </p>
        </div>
      </div>
    </div>
  )
}
