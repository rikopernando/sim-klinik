/**
 * Medical Record Service
 * Service layer for medical records operations
 */

import { MedicalRecordData, MedicalRecordFormData, MedicalRecord, Diagnosis, Prescription, Procedure, } from "@/types/medical-record";
import axios from "axios";
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
 * Lock a medical record with optional billing adjustment
 */
export async function lockMedicalRecord(
    id: number,
    userId: string,
    billingAdjustment?: number,
    adjustmentNote?: string
): Promise<MedicalRecord> {
    const response = await axios.post<{ data: MedicalRecord }>("/api/medical-records/lock", {
        id,
        userId,
        billingAdjustment,
        adjustmentNote
    });
    return response.data.data;
}

/**
 * Unlock a medical record
 */
export async function unlockMedicalRecord(id: number): Promise<MedicalRecord> {
    const response = await axios.post<{ data: MedicalRecord }>("/api/medical-records/unlock", { id });
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
 * Update a diagnosis
 */
export async function updateDiagnosis(id: number, data: {
    icd10Code?: string;
    description?: string;
    diagnosisType?: "primary" | "secondary";
}): Promise<Diagnosis> {
    const response = await axios.patch<{ data: Diagnosis }>("/api/medical-records/diagnoses", { id, ...data });
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
    serviceId?: number;
    icd9Code: string;
    description: string;
    performedBy?: string;
    notes?: string;
}): Promise<Procedure> {
    const response = await axios.post<{ data: Procedure }>("/api/medical-records/procedures", data);
    return response.data.data;
}

/**
 * Update a procedure
 */
export async function updateProcedure(id: number, data: {
    serviceId?: number;
    icd9Code?: string;
    description?: string;
    performedBy?: string;
    notes?: string;
}): Promise<Procedure> {
    const response = await axios.patch<{ data: Procedure }>("/api/medical-records/procedures", { id, ...data });
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
 * Update a prescription
 */
export async function updatePrescription(id: number, data: {
    drugId?: number;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
    route?: string;
}): Promise<Prescription> {
    const response = await axios.patch<{ data: Prescription }>("/api/medical-records/prescriptions", { id, ...data });
    return response.data.data;
}

/**
 * Delete a prescription
 */
export async function deletePrescription(id: number): Promise<void> {
    await axios.delete(`/api/medical-records/prescriptions?id=${id}`);
}
