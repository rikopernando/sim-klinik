"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InpatientPatient } from "@/types/inpatient"
import { PatientListRow } from "@/components/inpatient/patient-list-row"
import { cn } from "@/lib/utils"
import {
  LONG_STAY_WARNING_THRESHOLD,
  LONG_STAY_CRITICAL_THRESHOLD,
} from "@/lib/constants/inpatient"

const ROOM_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  VIP: {
    label: "VIP",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  "Class 1": {
    label: "Kelas 1",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  "Class 2": {
    label: "Kelas 2",
    className: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  "Class 3": {
    label: "Kelas 3",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  ICU: { label: "ICU", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  NICU: {
    label: "NICU",
    className: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  Isolation: {
    label: "Isolasi",
    className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
}

function MobilePatientCard({
  patient,
  onClick,
}: {
  patient: InpatientPatient
  onClick: (visitId: string) => void
}) {
  const days = patient.daysInHospital
  const isWarning = days >= LONG_STAY_WARNING_THRESHOLD && days < LONG_STAY_CRITICAL_THRESHOLD
  const isCritical = days >= LONG_STAY_CRITICAL_THRESHOLD
  const roomType = ROOM_TYPE_CONFIG[patient.roomType] ?? {
    label: patient.roomType,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <div
      onClick={() => onClick(patient.visitId)}
      className="hover:bg-muted/30 active:bg-muted/50 cursor-pointer px-6 py-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{patient.patientName}</p>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs">{patient.mrNumber}</p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              "font-mono text-2xl leading-none font-bold",
              isCritical
                ? "text-destructive"
                : isWarning
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
            )}
          >
            {days}
          </span>
          <p className="text-muted-foreground text-xs">hari</p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs font-semibold">
          {patient.roomNumber}
        </span>
        <span className="text-muted-foreground text-xs">Bed {patient.bedNumber}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            roomType.className
          )}
        >
          {roomType.label}
        </span>
      </div>
    </div>
  )
}

interface PatientListTableProps {
  patients: InpatientPatient[]
}

function PatientListTableComponent({ patients }: PatientListTableProps) {
  const router = useRouter()

  const handleRowClick = (visitId: string) => {
    router.push(`/dashboard/inpatient/patients/${visitId}`)
  }

  return (
    <>
      {/* Mobile card list — shown below sm */}
      <div className="divide-y sm:hidden">
        {patients.map((patient) => (
          <MobilePatientCard key={patient.visitId} patient={patient} onClick={handleRowClick} />
        ))}
      </div>

      {/* Tablet / desktop table — hidden below sm */}
      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                No. RM
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Nama Pasien
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Kamar / Bed
              </TableHead>
              <TableHead className="hidden text-xs font-semibold tracking-wider uppercase sm:table-cell">
                Tipe
              </TableHead>
              <TableHead className="hidden text-xs font-semibold tracking-wider uppercase md:table-cell">
                Tanggal Masuk
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Hari Rawat
              </TableHead>
              <TableHead className="hidden text-xs font-semibold tracking-wider uppercase sm:table-cell">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <PatientListRow key={patient.visitId} patient={patient} onClick={handleRowClick} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export const PatientListTable = memo(PatientListTableComponent)
