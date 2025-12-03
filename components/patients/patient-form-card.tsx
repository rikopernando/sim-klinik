"use client"

/**
 * Patient Form Card Component
 * Wrapper for patient registration form with header
 */

import { UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientRegistrationForm } from "@/components/patients/patient-registration-form"
import { Patient } from "@/types/registration"

interface PatientFormCardProps {
  onSuccess: (patient: Patient) => void
  onCancel: () => void
}

export function PatientFormCard({ onSuccess, onCancel }: PatientFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="text-primary h-6 w-6" />
          <CardTitle>Form Pendaftaran Pasien</CardTitle>
        </div>
        <CardDescription>
          Masukkan data pasien baru. Form ini terdiri dari 2 langkah yang mudah diikuti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PatientRegistrationForm onSuccess={onSuccess} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}
