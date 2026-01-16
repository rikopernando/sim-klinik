/**
 * ER Visit Header Component
 * Displays patient information, visit details, and disposition in ER medical record page
 */

"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTriageLabel, getTriageBadgeColor } from "@/lib/emergency/triage-utils"
import { getDispositionOptions } from "@/lib/emergency/disposition-utils"
import type { DispositionType } from "@/types/emergency"

interface Patient {
  id: string
  name: string
  mrNumber: string
  nik: string | null
  gender: string
}

interface Visit {
  id: string
  visitNumber: string
  visitType: string
  triageStatus: "red" | "yellow" | "green" | null
  chiefComplaint: string | null
  status: string
  disposition: DispositionType | null
  patient: Patient
}

interface ERVisitHeaderProps {
  visit: Visit
}

/**
 * Displays patient and visit information header for ER medical record
 * Includes editable disposition field
 */
export function ERVisitHeader({ visit }: ERVisitHeaderProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_examination":
        return "Dalam Pemeriksaan"
      case "registered":
        return "Terdaftar"
      case "waiting":
        return "Menunggu"
      case "examined":
        return "Sudah Diperiksa"
      case "ready_for_billing":
        return "Siap Billing"
      case "completed":
        return "Selesai"
      default:
        return status
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "male":
        return "Laki-laki"
      case "female":
        return "Perempuan"
      default:
        return gender
    }
  }

  const dispositionOptions = getDispositionOptions()

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Patient Information */}
          <div className="space-y-2">
            <CardTitle className="text-2xl">{visit.patient.name}</CardTitle>

            {/* Patient Details */}
            <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">No. RM:</span>
                <span className="font-mono">{visit.patient.mrNumber}</span>
              </div>

              {visit.patient.nik && (
                <>
                  <span>|</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">NIK:</span>
                    <span className="font-mono">{visit.patient.nik}</span>
                  </div>
                </>
              )}

              <span>|</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">Jenis Kelamin:</span>
                <span>{getGenderLabel(visit.patient.gender)}</span>
              </div>
            </div>

            {/* Visit Number */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium">No. Kunjungan:</span>
              <span className="font-mono">{visit.visitNumber}</span>
            </div>
          </div>

          {/* Visit Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive" className="text-xs">
              UGD
            </Badge>

            {visit.triageStatus && (
              <Badge
                variant="outline"
                className={`${getTriageBadgeColor(visit.triageStatus)} text-xs`}
              >
                {getTriageLabel(visit.triageStatus)}
              </Badge>
            )}

            <Badge variant="outline" className="text-xs">
              {getStatusLabel(visit.status)}
            </Badge>
          </div>
        </div>

        {/* Chief Complaint */}
        {visit.chiefComplaint && (
          <div className="bg-muted mt-4 rounded-md p-3">
            <p className="text-muted-foreground text-sm font-medium">Keluhan Utama:</p>
            <p className="mt-1 text-sm">{visit.chiefComplaint}</p>
          </div>
        )}

        {visit.disposition && (
          <div className="mt-4 rounded-md border p-3">
            <p className="text-muted-foreground mt-2 text-xs">
              {dispositionOptions.find((o) => o.value === visit.disposition)?.description}
            </p>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
