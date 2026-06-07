import { DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { PrescriptionQueueItem } from "@/types/pharmacy"

interface BulkFulfillmentHeaderProps {
  selectedGroup: PrescriptionQueueItem | null
}

const VISIT_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  outpatient: { label: "Rawat Jalan", className: "bg-blue-50 text-blue-700 border-blue-200" },
  inpatient: {
    label: "Rawat Inap",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  emergency: { label: "UGD", className: "bg-red-50 text-red-700 border-red-200" },
}

export function BulkFulfillmentHeader({ selectedGroup }: BulkFulfillmentHeaderProps) {
  if (!selectedGroup) {
    return <DialogTitle>Proses Resep</DialogTitle>
  }

  const visitBadge = VISIT_TYPE_BADGE[selectedGroup.visit.visitType] ?? VISIT_TYPE_BADGE.outpatient

  return (
    <div className="space-y-3">
      <DialogTitle>Proses Resep</DialogTitle>
      <div className="bg-muted/30 space-y-1.5 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{selectedGroup.patient.name}</p>
          <span className="text-muted-foreground text-xs">·</span>
          <p className="text-muted-foreground text-xs">MR: {selectedGroup.patient.mrNumber}</p>
          <Badge variant="outline" className={`text-xs font-medium ${visitBadge.className}`}>
            {visitBadge.label}
          </Badge>
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          <span>
            Kunjungan:{" "}
            <span className="text-foreground font-medium">{selectedGroup.visit.visitNumber}</span>
          </span>
          {selectedGroup.doctor && (
            <span>
              Dokter:{" "}
              <span className="text-foreground font-medium">{selectedGroup.doctor.name}</span>
            </span>
          )}
          <span>
            Total resep:{" "}
            <span className="text-foreground font-medium">
              {selectedGroup.prescriptions.length}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
