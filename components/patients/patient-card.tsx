"use client"

import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDateShort, calculateAge } from "@/lib/utils/date"
import { type RegisteredPatient } from "@/types/registration"

interface PatientCardProps {
  patient: RegisteredPatient
  onClick?: () => void
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <div
      className="hover:bg-accent bg-card cursor-pointer rounded-xl border px-4 py-3 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{patient.name}</h3>
            {patient.gender && (
              <Badge variant="outline" className="text-xs">
                {patient.gender === "male" ? "L" : "P"}
              </Badge>
            )}
            {patient.insuranceType && (
              <Badge variant="secondary" className="text-xs">
                {patient.insuranceType}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-0.5 text-xs">
            <span>
              <span className="font-medium">No. RM</span>: {patient.mrNumber}
            </span>
            <span>
              <span className="font-medium">NIK</span>: {patient.nik}
            </span>
            <span>
              <span className="font-medium">TTL</span>: {formatDateShort(patient.dateOfBirth)}
              {patient.dateOfBirth && ` (${calculateAge(patient.dateOfBirth)} th)`}
            </span>
            <span>
              <span className="font-medium">Telp</span>: {patient.phone}
            </span>
          </div>
        </div>
        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
      </div>
    </div>
  )
}
