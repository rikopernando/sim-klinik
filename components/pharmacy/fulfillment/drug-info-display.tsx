/**
 * Drug Info Display Component
 * Displays prescription drug information
 */

import { memo } from "react"

interface DrugInfoDisplayProps {
  drugName: string
  genericName?: string | null
  quantity: number
  unit: string
}

export const DrugInfoDisplay = memo(function DrugInfoDisplay({
  drugName,
  genericName,
  quantity,
  unit,
}: DrugInfoDisplayProps) {
  return (
    <div className="bg-muted rounded-md p-3">
      <p className="text-muted-foreground text-sm font-medium">Obat</p>
      <p className="text-lg font-semibold">{drugName}</p>
      {genericName && <p className="text-muted-foreground text-sm">{genericName}</p>}
      <p className="mt-1 text-sm">
        Jumlah resep:{" "}
        <span className="font-semibold">
          {quantity} {unit}
        </span>
      </p>
    </div>
  )
})
