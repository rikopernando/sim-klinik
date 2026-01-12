/**
 * Assign Bed Dialog Component
 * Allows nurses/admin to assign patients to available beds
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BedAssignmentWithDetails } from "@/types/inpatient"

import { BedAssignmentCard } from "./bed-assignment-card"

interface BedAssigmentDialogProps {
  open: boolean
  assignments: BedAssignmentWithDetails[]
  onOpenChange: (open: boolean) => void
}

export function BedAssigmentDialog({ open, assignments, onOpenChange }: BedAssigmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-h-165 max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pasien di Kamar ini</DialogTitle>
          <DialogDescription>{assignments.length} pasien terdaftar dikamar ini</DialogDescription>
        </DialogHeader>
        <BedAssignmentCard assignments={assignments} />
      </DialogContent>
    </Dialog>
  )
}
