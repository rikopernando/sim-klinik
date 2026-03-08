"use client"

/**
 * ER Print Summary Component
 * Printable summary of ER patient visit for medical records
 */

import { forwardRef } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export interface ERPrintSummaryData {
  patient: {
    name: string
    mrNumber: string
    nik: string | null
    gender: "male" | "female" | null
    birthDate: string | null
    address: string | null
    phone: string | null
  }
  visit: {
    visitNumber: string
    arrivalTime: string
    triageStatus: "red" | "yellow" | "green" | null
    chiefComplaint: string | null
    disposition: string | null
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
  medicalRecord?: {
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
  }
  diagnoses?: Array<{
    icdCode: string
    description: string
    isPrimary: boolean
  }>
  procedures?: Array<{
    icdCode: string
    description: string
  }>
  prescriptions?: Array<{
    drugName: string
    dosage: string | null
    frequency: string
    quantity: number
    instructions: string | null
  }>
  printedAt: Date
  printedBy: string
}

interface ERPrintSummaryProps {
  data: ERPrintSummaryData
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

function getDispositionLabel(disposition: string | null): string {
  switch (disposition) {
    case "discharged":
      return "Pulang"
    case "admitted":
      return "Rawat Inap"
    case "referred":
      return "Rujuk"
    case "observation":
      return "Observasi"
    default:
      return "-"
  }
}

export const ERPrintSummary = forwardRef<HTMLDivElement, ERPrintSummaryProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 text-black print:p-4">
      {/* Header */}
      <div className="mb-6 border-b-2 border-black pb-4 text-center">
        <h1 className="text-2xl font-bold">RINGKASAN KUNJUNGAN UGD</h1>
        <p className="text-sm">Klinik Sim-Klinik</p>
      </div>

      {/* Patient Information */}
      <div className="mb-6">
        <h2 className="mb-2 border-b font-bold">DATA PASIEN</h2>
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
          <div className="col-span-2">
            <span className="font-medium">Alamat:</span> {data.patient.address || "-"}
          </div>
        </div>
      </div>

      {/* Visit Information */}
      <div className="mb-6">
        <h2 className="mb-2 border-b font-bold">DATA KUNJUNGAN</h2>
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
          <div>
            <span className="font-medium">Disposisi:</span>{" "}
            {getDispositionLabel(data.visit.disposition)}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Keluhan Utama:</span> {data.visit.chiefComplaint || "-"}
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      {data.vitals && (
        <div className="mb-6">
          <h2 className="mb-2 border-b font-bold">TANDA VITAL</h2>
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

      {/* SOAP Notes */}
      {data.medicalRecord && (
        <div className="mb-6">
          <h2 className="mb-2 border-b font-bold">CATATAN MEDIS (SOAP)</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Subjective:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.medicalRecord.subjective || "-"}</p>
            </div>
            <div>
              <span className="font-medium">Objective:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.medicalRecord.objective || "-"}</p>
            </div>
            <div>
              <span className="font-medium">Assessment:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.medicalRecord.assessment || "-"}</p>
            </div>
            <div>
              <span className="font-medium">Plan:</span>
              <p className="ml-4 whitespace-pre-wrap">{data.medicalRecord.plan || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {data.diagnoses && data.diagnoses.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b font-bold">DIAGNOSIS</h2>
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

      {/* Procedures */}
      {data.procedures && data.procedures.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b font-bold">TINDAKAN</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left">Kode ICD-9</th>
                <th className="py-1 text-left">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {data.procedures.map((proc, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{proc.icdCode}</td>
                  <td className="py-1">{proc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescriptions */}
      {data.prescriptions && data.prescriptions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 border-b font-bold">RESEP OBAT</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left">Nama Obat</th>
                <th className="py-1 text-left">Dosis</th>
                <th className="py-1 text-left">Frekuensi</th>
                <th className="py-1 text-left">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.prescriptions.map((rx, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">{rx.drugName}</td>
                  <td className="py-1">{rx.dosage || "-"}</td>
                  <td className="py-1">{rx.frequency}</td>
                  <td className="py-1">{rx.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <div>
            <p>Dicetak: {format(data.printedAt, "dd MMM yyyy, HH:mm", { locale: idLocale })}</p>
            <p>Oleh: {data.printedBy}</p>
          </div>
          <div className="text-right">
            <p className="mb-12">Dokter Penanggung Jawab</p>
            <p>(_____________________)</p>
          </div>
        </div>
      </div>
    </div>
  )
})

ERPrintSummary.displayName = "ERPrintSummary"
