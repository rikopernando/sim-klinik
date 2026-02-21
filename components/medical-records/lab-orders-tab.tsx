/**
 * Lab Orders Tab Component
 * Displays and manages lab orders for a medical record visit
 * Uses lazy loading - fetches its own data when the tab is activated
 */

"use client"

import { LabOrdersList } from "@/components/laboratory/lab-orders-list"
import { CreateLabOrderDialog } from "@/components/laboratory/create-lab-order-dialog"
import { useLabOrders } from "@/hooks/use-lab-orders"

interface LabOrdersTabProps {
  visitId: string
  patientId: string
  isLocked: boolean
}

export function LabOrdersTab({ visitId, patientId, isLocked }: LabOrdersTabProps) {
  const { refetch } = useLabOrders({
    initialFilters: { visitId },
    autoFetch: false, // LabOrdersList handles its own fetching
    defaultToToday: false, // Show all orders for this visit, not just today
  })

  return (
    <div className="space-y-6">
      {/* Order Lab Dialog */}
      {!isLocked && (
        <CreateLabOrderDialog visitId={visitId} patientId={patientId} onSuccess={refetch} />
      )}

      {/* Lab Orders List */}
      <LabOrdersList showSubtotal visitId={visitId} />
    </div>
  )
}
