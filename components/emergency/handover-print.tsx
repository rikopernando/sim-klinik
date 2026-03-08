"use client"

/**
 * Handover Print Component
 * Printable handover document for receiving department
 */

import { forwardRef } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export interface HandoverPrintData {
  patient: {
    name: string
    mrNumber: string
    nik: string | null
    gender: "male" | "female" | null
    birthDate: string | null
    phone: string | null
  }
  visit: {
    visitNumber: string
    arrivalTime: string
    triageStatus: "red" | "yellow" | "green" | null
    chiefComplaint: string | null
  }
  vitals?: {
    temperature: number | null
    bloodPressureSystolic: number | null
    bloodPressureDiastolic: number | null
    pulse: number | null
    respiratoryRate: number | null
    oxygenSaturation: number | null
    consciousness: string | null
  }
  diagnoses?: Array<{
    icdCode: string
    description: string
    isPrimary: boolean
  }>
  handover: {
    fromDepartment: string
    toDepartment: string
    toUnit: string // Poli name or Room name
    notes: string | null
    handoverTime: Date
    handoverBy: string
  }
  clinicalSummary?: {
    briefHistory: string | null
    treatmentGiven: string | null
    currentCondition: string | null
    pendingTasks: string | null
  }
}

interface HandoverPrintProps {
  data: HandoverPrintData
}

function getTriageLabel(status: "red" | "yellow" | "green" | null): string {
  switch (status) {
    case "red":
      return "MERAH - Gawat Darurat"
    case "yellow":
      return "KUNING - Urgent"
    case "green":
      return "HIJAU - Non-Urgent"
    default:
      return "Belum Triage"
  }
}

export const HandoverPrint = forwardRef<HTMLDivElement, HandoverPrintProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 text-black print:p-4">
      {/* Header */}
      <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <h1 className="text-2xl font-bold">FORMULIR HANDOVER PASIEN</h1>
        <p className="text-sm">Klinik Sim-Klinik</p>
        <p className="mt-2 text-lg font-semibold">
          {data.handover.fromDepartment} → {data.handover.toDepartment}
        </p>
      </div>

      {/* Handover Info */}
      <div className="mb-6 rounded border-2 border-gray-800 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Dari Unit:</span> {data.handover.fromDepartment}
          </div>
          <div>
            <span className="font-medium">Ke Unit:</span> {data.handover.toUnit}
          </div>
          <div>
            <span className="font-medium">Waktu Handover:</span>{" "}
            {format(data.handover.handoverTime, "dd MMM yyyy, HH:mm", { locale: idLocale })}
          </div>
          <div>
            <span className="font-medium">Petugas:</span> {data.handover.handoverBy}
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="mb-2 border-b-2 border-gray-800 font-bold">IDENTITAS PASIEN</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Nama:</span> {data.patient.name}
          </div>
          <div>
            <span className="font-medium">No. RM:</span> {data.patient.mrNumber}
          </div>
          <div>
            <span className="font-medium">NIK:</span> {data.patient.nik || "-"}
          </div>
          <div>
            <span className="font-medium">Jenis Kelamin:</span>{" "}
            {data.patient.gender === "male"
              ? "Laki-laki"
              : data.patient.gender === "female"
                ? "Perempuan"
                : "-"}
          </div>
          <div>
            <span className="font-medium">Tanggal Lahir:</span>{" "}
            {data.patient.birthDate
              ? format(new Date(data.patient.birthDate), "dd MMMM yyyy", { locale: idLocale })
              : "-"}
          </div>
          <div>
            <span className="font-medium">Telepon:</span> {data.patient.phone || "-"}
          </div>
        </div>
      </div>

      {/* Visit & Triage Info */}
      <div className="mb-6">
        <h2 className="mb-2 border-b-2 border-gray-800 font-bold">INFORMASI KUNJUNGAN UGD</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">No. Kunjungan:</span> {data.visit.visitNumber}
          </div>
          <div>
            <span className="font-medium">Waktu Kedatangan:</span>{" "}
            {format(new Date(data.visit.arrivalTime), "dd MMM yyyy, HH:mm", { locale: idLocale })}
          </div>
          <div>
            <span className="font-medium">Status Triage:</span>{" "}
            {getTriageLabel(data.visit.triageStatus)}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Keluhan Utama:</span> {data.visit.chiefComplaint || "-"}
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      {data.vitals && (
        <div className="mb-6">
          <h2 className="mb-2 border-b-2 border-gray-800 font-bold">TANDA VITAL TERAKHIR</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Suhu:</span>{" "}
              {data.vitals.temperature ? `${data.vitals.temperature}°C` : "-"}
            </div>
            <div>
              <span className="font-medium">Tekanan Darah:</span>{" "}
              {data.vitals.bloodPressureSystolic && data.vitals.bloodPressureDiastolic
                ? `${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg`
                : "-"}
            </div>
            <div>
              <span className="font-medium">Nadi:</span>{" "}
              {data.vitals.pulse ? `${data.vitals.pulse} x/menit` : "-"}
            </div>
            <div>
              <span className="font-medium">Respirasi:</span>{" "}
              {data.vitals.respiratoryRate ? `${data.vitals.respiratoryRate} x/menit` : "-"}
            </div>
            <div>
              <span className="font-medium">SpO2:</span>{" "}
              {data.vitals.oxygenSaturation ? `${data.vitals.oxygenSaturation}%` : "-"}
            </div>
            <div>
              <span className="font-medium">Kesadaran:</span> {data.vitals.consciousness || "-"}
            </div>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {data.diagnoses && data.diagnoses.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b-2 border-gray-800 font-bold">DIAGNOSIS</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left">Kode ICD-10</th>
                <th className="py-1 text-left">Deskripsi</th>
                <th className="py-1 text-left">Jenis</th>
              </tr>
            </thead>
            <tbody>
              {data.diagnoses.map((dx, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{dx.icdCode}</td>
                  <td className="py-1">{dx.description}</td>
                  <td className="py-1">{dx.isPrimary ? "Utama" : "Sekunder"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clinical Summary */}
      {data.clinicalSummary && (
        <div className="mb-6">
          <h2 className="mb-2 border-b-2 border-gray-800 font-bold">RINGKASAN KLINIS</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Riwayat Singkat:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.clinicalSummary.briefHistory || "-"}</p>
            </div>
            <div>
              <span className="font-medium">Tindakan yang Diberikan:</span>
              <p className="ml-4 whitespace-pre-wrap">
                {data.clinicalSummary.treatmentGiven || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium">Kondisi Saat Ini:</span>
              <p className="ml-4 whitespace-pre-wrap">
                {data.clinicalSummary.currentCondition || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium">Tugas Tertunda/Perlu Dilanjutkan:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.clinicalSummary.pendingTasks || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Handover Notes */}
      {data.handover.notes && (
        <div className="mb-6">
          <h2 className="mb-2 border-b-2 border-gray-800 font-bold">CATATAN HANDOVER</h2>
          <p className="text-sm whitespace-pre-wrap">{data.handover.notes}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-8 border-t-2 border-gray-800 pt-4">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="text-center">
            <p className="font-medium">Yang Menyerahkan</p>
            <p className="text-xs text-gray-600">(Unit {data.handover.fromDepartment})</p>
            <div className="mt-16 border-b border-black" />
            <p className="mt-1">Nama & Tanda Tangan</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Yang Menerima</p>
            <p className="text-xs text-gray-600">(Unit {data.handover.toUnit})</p>
            <div className="mt-16 border-b border-black" />
            <p className="mt-1">Nama & Tanda Tangan</p>
          </div>
        </div>
      </div>

      {/* Print Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          Dokumen ini dicetak pada {format(new Date(), "dd MMM yyyy, HH:mm", { locale: idLocale })}
        </p>
      </div>
    </div>
  )
})

HandoverPrint.displayName = "HandoverPrint"
