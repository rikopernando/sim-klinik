/**
 * Billing Patient Info Component
 * Display patient and visit information with payment status
 */

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPaymentStatusConfig } from "@/lib/billing/billing-utils"
import type { BillingWithDetails } from "@/types/billing"

interface BillingPatientInfoProps {
  billing: BillingWithDetails
}

export function BillingPatientInfo({ billing }: BillingPatientInfoProps) {
  const statusConfig = getPaymentStatusConfig(billing.paymentStatus)
  console.log({ statusConfig })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{billing.patient?.name || "N/A"}</CardTitle>
            <CardDescription>
              RM: {billing.patient?.mrNumber || "N/A"} | Visit:{" "}
              {billing.visit?.visitNumber || "N/A"}
            </CardDescription>
          </div>
          <Badge className={statusConfig?.badge}>{statusConfig?.label}</Badge>
        </div>
      </CardHeader>
    </Card>
  )
}
