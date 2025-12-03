/**
 * Patient Allergy Alert Component
 * Displays patient allergies in a warning card
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface PatientAllergyAlertProps {
  allergies: string
}

export function PatientAllergyAlert({ allergies }: PatientAllergyAlertProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          Alergi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-900">{allergies}</p>
      </CardContent>
    </Card>
  )
}
