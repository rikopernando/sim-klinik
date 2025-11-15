"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { type MedicalRecord } from "@/types/medical-record";
import { canEditMedicalRecord } from "@/lib/utils/medical-record";
import { SectionCard } from "./section-card";

interface SoapFormProps {
    medicalRecord: MedicalRecord;
    onUpdate: (updates: Partial<MedicalRecord>) => void;
    onSave: (data: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => Promise<void>;
    isLocked: boolean;
}

interface SoapSection {
    key: keyof Pick<MedicalRecord, "soapSubjective" | "soapObjective" | "soapAssessment" | "soapPlan">;
    title: string;
    label: string;
    description: string;
    placeholder: string;
    rows: number;
}

const SOAP_SECTIONS: SoapSection[] = [
    {
        key: "soapSubjective",
        title: "S - Subjective (Keluhan Subjektif)",
        label: "S",
        description: "Keluhan pasien, riwayat penyakit sekarang, dan informasi yang disampaikan pasien",
        placeholder: "Contoh: Pasien mengeluh demam sejak 3 hari yang lalu, disertai batuk dan pilek...",
        rows: 5,
    },
    {
        key: "soapObjective",
        title: "O - Objective (Pemeriksaan Objektif)",
        label: "O",
        description: "Hasil pemeriksaan fisik, tanda vital, dan temuan objektif lainnya",
        placeholder:
            "Contoh: TD: 120/80 mmHg, Nadi: 88x/menit, Suhu: 38.5°C, RR: 20x/menit\nPemeriksaan Fisik: Kepala/Leher: Faring hiperemis...",
        rows: 5,
    },
    {
        key: "soapAssessment",
        title: "A - Assessment (Analisis/Diagnosis)",
        label: "A",
        description: "Analisis klinis dan diagnosis kerja berdasarkan data subjektif dan objektif",
        placeholder: "Contoh: ISPA (Infeksi Saluran Pernapasan Atas)\nDiagnosis banding: Influenza, Common Cold",
        rows: 4,
    },
    {
        key: "soapPlan",
        title: "P - Plan (Rencana Tindakan)",
        label: "P",
        description: "Rencana terapi, tindakan, edukasi, dan follow-up",
        placeholder:
            "Contoh: \n1. Terapi: Lihat resep\n2. Edukasi: Istirahat cukup, minum air putih 8 gelas/hari\n3. Kontrol: 3 hari lagi jika belum membaik",
        rows: 5,
    },
];

export function SoapForm({ medicalRecord, onUpdate, onSave, isLocked }: SoapFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [localData, setLocalData] = useState({
        soapSubjective: medicalRecord.soapSubjective || "",
        soapObjective: medicalRecord.soapObjective || "",
        soapAssessment: medicalRecord.soapAssessment || "",
        soapPlan: medicalRecord.soapPlan || "",
    });

    const canEdit = canEditMedicalRecord(isLocked);

    const handleChange = (field: keyof typeof localData, value: string) => {
        setLocalData((prev) => ({ ...prev, [field]: value }));
        onUpdate({ [field]: value });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(localData);
        } catch (error) {
            // Error handling is done in parent
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {SOAP_SECTIONS.map((section) => (
                <SectionCard
                    key={section.key}
                    title={section.title}
                    description={section.description}
                >
                    <Textarea
                        value={localData[section.key]}
                        onChange={(e) => handleChange(section.key, e.target.value)}
                        placeholder={section.placeholder}
                        rows={section.rows}
                        disabled={!canEdit}
                        className={!canEdit ? "bg-muted" : ""}
                    />
                </SectionCard>
            ))}

            {/* Save Button */}
            {canEdit && (
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan SOAP
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
