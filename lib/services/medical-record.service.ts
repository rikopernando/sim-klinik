/**
 * Medical Record Service
 * Service layer for medical records operations
 */

import axios from "axios";

// Types
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
    performedAt: Date;
    notes: string | null;
    createdAt: Date;
}

export interface Prescription {
    id: number;
    medicalRecordId: number;
    drugId: number;
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

export interface MedicalRecordFormData {
    visitId: number;
    soapSubjective?: string;
    soapObjective?: string;
    soapAssessment?: string;
    soapPlan?: string;
    physicalExam?: string;
    laboratoryResults?: string;
    radiologyResults?: string;
    isDraft?: boolean;
}

/**
 * Get medical record by visit ID
 */
export async function getMedicalRecordByVisit(visitId: number): Promise<MedicalRecordData> {
    const response = await axios.get<{ data: MedicalRecordData }>(`/api/medical-records?visitId=${visitId}`);
    return response.data.data;
}

/**
 * Get all medical records for a patient
 */
export async function getPatientMedicalRecords(patientId: number): Promise<MedicalRecordData[]> {
    const response = await axios.get<{ data: MedicalRecordData[] }>(`/api/medical-records?patientId=${patientId}`);
    return response.data.data;
}

/**
 * Create a new medical record
 */
export async function createMedicalRecord(data: MedicalRecordFormData): Promise<MedicalRecord> {
    const response = await axios.post<{ data: MedicalRecord }>("/api/medical-records", data);
    return response.data.data;
}

/**
 * Update a medical record
 */
export async function updateMedicalRecord(id: number, data: Partial<MedicalRecordFormData>): Promise<MedicalRecord> {
    const response = await axios.patch<{ data: MedicalRecord }>("/api/medical-records", { id, ...data });
    return response.data.data;
}

/**
 * Lock a medical record
 */
export async function lockMedicalRecord(id: number, userId: string): Promise<MedicalRecord> {
    const response = await axios.post<{ data: MedicalRecord }>("/api/medical-records/lock", { id, userId });
    return response.data.data;
}

/**
 * Add a diagnosis to a medical record
 */
export async function addDiagnosis(data: {
    medicalRecordId: number;
    icd10Code: string;
    description: string;
    diagnosisType?: "primary" | "secondary";
}): Promise<Diagnosis> {
    const response = await axios.post<{ data: Diagnosis }>("/api/medical-records/diagnoses", data);
    return response.data.data;
}

/**
 * Delete a diagnosis
 */
export async function deleteDiagnosis(id: number): Promise<void> {
    await axios.delete(`/api/medical-records/diagnoses?id=${id}`);
}

/**
 * Add a procedure to a medical record
 */
export async function addProcedure(data: {
    medicalRecordId: number;
    icd9Code: string;
    description: string;
    performedBy?: string;
    notes?: string;
}): Promise<Procedure> {
    const response = await axios.post<{ data: Procedure }>("/api/medical-records/procedures", data);
    return response.data.data;
}

/**
 * Delete a procedure
 */
export async function deleteProcedure(id: number): Promise<void> {
    await axios.delete(`/api/medical-records/procedures?id=${id}`);
}

/**
 * Add a prescription to a medical record
 */
export async function addPrescription(data: {
    medicalRecordId: number;
    drugId: number;
    dosage: string;
    frequency: string;
    duration?: string;
    quantity: number;
    instructions?: string;
    route?: string;
}): Promise<Prescription> {
    const response = await axios.post<{ data: Prescription }>("/api/medical-records/prescriptions", data);
    return response.data.data;
}

/**
 * Delete a prescription
 */
export async function deletePrescription(id: number): Promise<void> {
    await axios.delete(`/api/medical-records/prescriptions?id=${id}`);
}
