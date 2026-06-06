"use client"

import { useState, useCallback, useMemo } from "react"

import { AutocompleteTextarea } from "@/components/ui/autocomplete-textarea"
import { type MedicalRecord } from "@/types/medical-record"
import { canEditMedicalRecord } from "@/lib/utils/medical-record"
import {
  SUBJECTIVE_SUGGESTIONS,
  OBJECTIVE_SUGGESTIONS,
  ASSESSMENT_SUGGESTIONS,
  PLAN_SUGGESTIONS,
} from "@/lib/medical/soap-suggestions"

import { SectionCard } from "./section-card"

interface SoapFormProps {
  medicalRecord: MedicalRecord
  onUpdate: (updates: Partial<MedicalRecord>) => void
  isLocked: boolean
}

interface SoapSection {
  key: keyof Pick<MedicalRecord, "soapSubjective" | "soapObjective" | "soapAssessment" | "soapPlan">
  title: string
  label: string
  description: string
  placeholder: string
  rows: number
  suggestions: Array<{ value: string; label: string; category?: string }>
}

const SOAP_SECTIONS: SoapSection[] = [
  {
    key: "soapSubjective",
    title: "S - Subjective (Keluhan Subjektif)",
    label: "S",
    description: "Keluhan pasien, riwayat penyakit sekarang, dan informasi yang disampaikan pasien",
    placeholder: "Ketik untuk melihat saran keluhan umum pasien...",
    rows: 5,
    suggestions: SUBJECTIVE_SUGGESTIONS,
  },
  {
    key: "soapObjective",
    title: "O - Objective (Pemeriksaan Objektif)",
    label: "O",
    description: "Hasil pemeriksaan fisik, tanda vital, dan temuan objektif lainnya",
    placeholder: "Ketik untuk melihat saran hasil pemeriksaan fisik...",
    rows: 5,
    suggestions: OBJECTIVE_SUGGESTIONS,
  },
  {
    key: "soapAssessment",
    title: "A - Assessment (Analisis/Diagnosis)",
    label: "A",
    description: "Analisis klinis dan diagnosis kerja berdasarkan data subjektif dan objektif",
    placeholder: "Ketik untuk melihat saran diagnosis umum...",
    rows: 4,
    suggestions: ASSESSMENT_SUGGESTIONS,
  },
  {
    key: "soapPlan",
    title: "P - Plan (Rencana Tindakan)",
    label: "P",
    description: "Rencana terapi, tindakan, edukasi, dan follow-up",
    placeholder: "Ketik untuk melihat saran rencana terapi...",
    rows: 5,
    suggestions: PLAN_SUGGESTIONS,
  },
]

export function SoapForm({ medicalRecord, onUpdate, isLocked }: SoapFormProps) {
  const [localData, setLocalData] = useState({
    soapSubjective: medicalRecord.soapSubjective || "",
    soapObjective: medicalRecord.soapObjective || "",
    soapAssessment: medicalRecord.soapAssessment || "",
    soapPlan: medicalRecord.soapPlan || "",
  })

  const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked])

  const handleChange = useCallback(
    (field: keyof typeof localData, value: string) => {
      setLocalData((prev) => ({ ...prev, [field]: value }))
      onUpdate({ [field]: value })
    },
    [onUpdate]
  )

  return (
    <div className="space-y-6">
      {SOAP_SECTIONS.map((section) => (
        <SectionCard key={section.key} title={section.title} description={section.description}>
          <AutocompleteTextarea
            multiValue
            value={localData[section.key]}
            onChange={(e) => handleChange(section.key, e.target.value)}
            placeholder={section.placeholder}
            rows={section.rows}
            disabled={!canEdit}
            className={!canEdit ? "bg-muted" : ""}
            suggestions={section.suggestions}
          />
        </SectionCard>
      ))}
    </div>
  )
}
