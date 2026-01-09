/**
 * Lab Orders Tab Component
 * Displays and manages lab orders for a medical record visit
 */

"use client"

import { LabOrdersList } from "@/components/laboratory/lab-orders-list"
import { CreateLabOrderDialog } from "@/components/laboratory/create-lab-order-dialog"

interface LabOrdersTabProps {
  visitId: string
  patientId: string
  isLocked: boolean
  onUpdate: () => Promise<void>
}

export function LabOrdersTab({ visitId, patientId, isLocked, onUpdate }: LabOrdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Order Lab Dialog */}
      {!isLocked && (
        <CreateLabOrderDialog visitId={visitId} patientId={patientId} onSuccess={onUpdate} />
      )}

      {/* Lab Orders List */}
      <LabOrdersList visitId={visitId} />
    </div>
  )
}
