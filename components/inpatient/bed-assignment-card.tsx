/**
 * Bed Assignment Card Component
 * Displays current bed assignments for a room
 */

import { User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BedAssignmentWithDetails } from "@/types/inpatient"

interface BedAssignmentCardProps {
  assignments: BedAssignmentWithDetails[]
}

export function BedAssignmentCard({ assignments }: BedAssignmentCardProps) {
  // Show only active assignments (not discharged)
  const activeAssignments = assignments.filter((a) => !a.assignment.dischargedAt)

  if (activeAssignments.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg border border-dashed p-3">
        <p className="text-muted-foreground text-center text-sm">Tidak ada pasien di kamar ini</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activeAssignments.map((item) => {
        const { assignment, patient } = item
        const daysStayed = assignment.assignedAt
          ? Math.floor(
              (new Date().getTime() - new Date(assignment.assignedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0

        return (
          <div key={assignment.id} className="bg-muted/50 space-y-2 rounded-lg border p-3">
            {/* Patient Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{patient?.name || "N/A"}</p>
                  <p className="text-muted-foreground text-xs">MR: {patient?.mrNumber || "N/A"}</p>
                </div>
              </div>
              <Badge variant="secondary">Bed {assignment.bedNumber}</Badge>
            </div>

            {/* Admission Info */}
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              <span>
                {daysStayed === 0
                  ? "Baru masuk hari ini"
                  : `${daysStayed} hari ${daysStayed === 1 ? "" : ""}`}
              </span>
            </div>

            {/* Notes */}
            {assignment.notes && (
              <p className="text-muted-foreground text-xs italic">{assignment.notes}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
