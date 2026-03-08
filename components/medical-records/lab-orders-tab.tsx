/**
 * Lab Orders Tab Component
 * Displays and manages lab orders for a medical record visit
 * Uses lazy loading - fetches its own data when the tab is activated
 */

"use client"

import { useRef } from "react"
import { LabOrdersList, LabOrdersListRef } from "@/components/laboratory/lab-orders-list"
import { CreateLabOrderDialog } from "@/components/laboratory/create-lab-order-dialog"

interface LabOrdersTabProps {
  visitId: string
  patientId: string
  isLocked: boolean
}

export function LabOrdersTab({ visitId, patientId, isLocked }: LabOrdersTabProps) {
  const labOrdersListRef = useRef<LabOrdersListRef>(null)

  const handleOrderCreated = () => {
    labOrdersListRef.current?.refetch()
  }

  return (
    <div className="space-y-6">
      {/* Order Lab Dialog */}
      {!isLocked && (
        <CreateLabOrderDialog
          visitId={visitId}
          patientId={patientId}
          onSuccess={handleOrderCreated}
        />
      )}

      {/* Lab Orders List */}
      <LabOrdersList ref={labOrdersListRef} showSubtotal visitId={visitId} />
    </div>
  )
}
