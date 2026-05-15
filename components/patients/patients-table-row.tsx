"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getGenderLabel } from "@/lib/utils/patient"
import { formatDateShort } from "@/lib/utils/date"

interface Patient {
  id: string
  mrNumber: string
  nik: string | null
  name: string
  gender: string | null
  dateOfBirth: string | null
  phone: string | null
  insuranceType: string | null
}

interface PatientsTableRowProps {
  patient: Patient
  onEdit: (patientId: string) => void
}

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return <span className="text-muted-foreground text-xs">—</span>
  const isMale = gender === "male" || gender === "L"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isMale
          ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
      )}
    >
      {getGenderLabel(gender)}
    </span>
  )
}

function InsuranceBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>

  const upper = type.toUpperCase()
  const isBpjs = upper.includes("BPJS")
  const isUmum = upper === "UMUM"

  const style = isBpjs
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    : isUmum
      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", style)}
    >
      {type}
    </span>
  )
}

export function PatientsTableRow({ patient, onEdit }: PatientsTableRowProps) {
  return (
    <TableRow className="group transition-colors">
      <TableCell className="py-3">
        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
          {patient.mrNumber}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground py-3 font-mono text-xs">
        {patient.nik || "—"}
      </TableCell>
      <TableCell className="py-3 leading-tight font-medium">{patient.name}</TableCell>
      <TableCell className="py-3">
        <GenderBadge gender={patient.gender} />
      </TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">
        {formatDateShort(patient.dateOfBirth) || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground py-3 text-sm">{patient.phone || "—"}</TableCell>
      <TableCell className="py-3">
        <InsuranceBadge type={patient.insuranceType} />
      </TableCell>
      <TableCell className="pr-4 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onEdit(patient.id)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
