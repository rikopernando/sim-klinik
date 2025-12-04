"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateShort, calculateAge } from "@/lib/utils/date"
import { type RegisteredPatient } from "@/types/registration"

interface PatientCardProps {
  patient: RegisteredPatient
  onClick?: () => void
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <Card className="hover:bg-accent cursor-pointer py-0 transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{patient.name}</h3>
            {patient.gender && (
              <Badge variant="outline" className="text-xs">
                {patient.gender === "male" ? "L" : "P"}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground grid grid-cols-1 gap-x-4 gap-y-1 text-sm md:grid-cols-2">
            <div className="grid grid-cols-4 md:col-span-1">
              <span className="col-span-1 font-medium">No. RM</span>
              <span className="col-span-3">: {patient.mrNumber}</span>
            </div>
            <div className="grid grid-cols-4 md:col-span-1">
              <span className="col-span-1 font-medium">NIK</span>
              <span className="col-span-3">: {patient.nik}</span>
            </div>
            <div className="grid grid-cols-4 md:col-span-1">
              <span className="col-span-1 font-medium">TTL</span>
              <span className="col-span-3">
                : {formatDateShort(patient.dateOfBirth)}
                {patient.dateOfBirth && ` (${calculateAge(patient.dateOfBirth)} th)`}
              </span>
            </div>
            <div className="grid grid-cols-4 md:col-span-1">
              <span className="col-span-1 font-medium">Telp</span>
              <span className="col-span-3">: {patient.phone}</span>
            </div>
          </div>
          {patient.insuranceType && (
            <Badge variant="secondary" className="mt-1">
              {patient.insuranceType}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
