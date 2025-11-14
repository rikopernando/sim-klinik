// Registration Module Types

export interface Patient {
    id: number;
    mrNumber: string;
    nik: string | null;
    name: string;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    insuranceType: string | null;
}

export interface PatientFormData {
    nik: string;
    name: string;
    dateOfBirth?: Date;
    gender: "male" | "female";
    bloodType?: string;
    phone?: string;
    address?: string;
    email?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    insuranceType?: string;
    insuranceNumber?: string;
    allergies?: string;
}

export interface VisitFormData {
    visitType: "outpatient" | "inpatient" | "emergency";
    poliId?: string;
    doctorId?: string;
    triageStatus?: "red" | "yellow" | "green";
    chiefComplaint?: string;
    roomId?: string;
    notes?: string;
}

export interface RegisteredPatient {
    id: number;
    mrNumber: string;
    name: string;
    nik: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    address: string | null;
    insuranceType: string | null;
}

export interface RegisteredVisit {
    visit: {
        id: number;
        visitNumber: string;
        queueNumber?: string;
        visitType: string;
        arrivalTime: string;
    };
    patient: {
        id: number;
        mrNumber: string;
        name: string;
    };
}

export interface Poli {
    id: number;
    name: string;
    code: string;
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const INSURANCE_TYPES = [
    { value: "BPJS", label: "BPJS Kesehatan" },
    { value: "Asuransi Swasta", label: "Asuransi Swasta" },
    { value: "Umum", label: "Umum (Cash)" },
] as const;

export const TRIAGE_STATUS = [
    { value: "red", label: "Merah", description: "Gawat Darurat", color: "bg-red-500" },
    { value: "yellow", label: "Kuning", description: "Mendesak", color: "bg-yellow-500" },
    { value: "green", label: "Hijau", description: "Tidak Mendesak", color: "bg-green-500" },
] as const;
