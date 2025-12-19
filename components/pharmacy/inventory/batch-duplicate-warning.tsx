/**
 * Batch Duplicate Warning Component
 * Displays warning when batch number already exists
 */

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DuplicateBatchCheck } from "@/types/inventory"

interface BatchDuplicateWarningProps {
  duplicateCheck: DuplicateBatchCheck
}

export function BatchDuplicateWarning({ duplicateCheck }: BatchDuplicateWarningProps) {
  if (!duplicateCheck.exists || !duplicateCheck.batch) {
    return null
  }

  const { batch } = duplicateCheck

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Batch sudah ada!</AlertTitle>
      <AlertDescription>
        <p className="mt-1 text-sm">
          Batch <strong>{batch.batchNumber}</strong> untuk obat ini sudah ada dengan stok{" "}
          <strong>
            {batch.stockQuantity.toLocaleString("id-ID")} {batch.drug.unit}
          </strong>
          .
        </p>
        <p className="mt-2 text-xs">
          Jika ini adalah penambahan stok untuk batch yang sama, pastikan nomor batch benar. Atau
          gunakan nomor batch berbeda jika ini batch baru.
        </p>
      </AlertDescription>
    </Alert>
  )
}
