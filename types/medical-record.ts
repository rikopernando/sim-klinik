/**
 * Medical Record Types
 */

export interface MedicalRecord {
    id: number;
    visitId: number;
    doctorId: string;
    soapSubjective: string | null;
    soapObjective: string | null;
    soapAssessment: string | null;
    soapPlan: string | null;
    physicalExam: string | null;
    laboratoryResults: string | null;
    radiologyResults: string | null;
    isLocked: boolean;
    isDraft: boolean;
    lockedAt: Date | null;
    lockedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Diagnosis {
    id: number;
    medicalRecordId: number;
    icd10Code: string;
    description: string;
    diagnosisType: "primary" | "secondary";
    createdAt: Date;
}

export interface Procedure {
    id: number;
    medicalRecordId: number;
    icd9Code: string;
    description: string;
    performedBy: string | null;
    performedByName: string | null;
    performedAt: Date;
    notes: string | null;
    createdAt: Date;
}

export interface Prescription {
    id: number;
    medicalRecordId: number;
    drugId: number;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string | null;
    quantity: number;
    instructions: string | null;
    route: string | null;
    isFulfilled: boolean;
    fulfilledBy: string | null;
    fulfilledAt: Date | null;
    dispensedQuantity: number | null;
    inventoryId: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MedicalRecordData {
    medicalRecord: MedicalRecord;
    diagnoses: Diagnosis[];
    procedures: Procedure[];
    prescriptions: Prescription[];
}

export const DIAGNOSIS_TYPES = [
    { value: "primary", label: "Diagnosis Utama" },
    { value: "secondary", label: "Diagnosis Sekunder" },
] as const;

export const MEDICATION_ROUTES = [
    { value: "oral", label: "Oral (Diminum)" },
    { value: "topical", label: "Topikal (Oles)" },
    { value: "injection", label: "Injeksi (Suntik)" },
    { value: "inhalation", label: "Inhalasi (Hirup)" },
    { value: "rectal", label: "Rektal" },
    { value: "sublingual", label: "Sublingual" },
] as const;
