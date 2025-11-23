/**
 * Custom hook for managing medical record data and operations
 */

import { useState, useEffect, useCallback } from "react";
import {
    getMedicalRecordByVisit,
    createMedicalRecord,
    updateMedicalRecord,
    lockMedicalRecord,
} from "@/lib/services/medical-record.service";
import { updateVisitStatus } from "@/lib/services/visit.service";
import { getErrorMessage } from "@/lib/utils/error";
import { type MedicalRecordData } from "@/types/medical-record";
import { type VisitStatus } from "@/types/visit-status";

interface UseMedicalRecordOptions {
    visitId: number;
}

interface UseMedicalRecordReturn {
    // Data
    recordData: MedicalRecordData | null;
    isLocked: boolean;
    isDraft: boolean;

    // Loading states
    isLoading: boolean;
    isSaving: boolean;
    isLocking: boolean;

    // Error handling
    error: string | null;
    clearError: () => void;

    // Operations
    loadMedicalRecord: () => Promise<void>;
    saveSOAP: (soapData: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => Promise<void>;
    saveDraft: () => Promise<void>;
    lockRecord: (userId: string) => Promise<void>;
    updateRecord: (updates: Partial<MedicalRecordData["medicalRecord"]>) => void;
}

export function useMedicalRecord({ visitId }: UseMedicalRecordOptions): UseMedicalRecordReturn {
    const [recordData, setRecordData] = useState<MedicalRecordData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMedicalRecord = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getMedicalRecordByVisit(visitId);
            setRecordData(data);

            // Auto-update visit status to "in_examination" when doctor opens medical record
            // This represents that the doctor has called the patient and started examination
            const currentStatus = data.visit.status as VisitStatus;

            if (currentStatus === "registered" || currentStatus === "waiting") {
                try {
                    await updateVisitStatus(visitId, "in_examination");
                } catch (statusErr) {
                    // Log error but don't block the medical record loading
                    console.error("Failed to update visit status to in_examination:", statusErr);
                }
            }
            // If already in_examination or beyond, do nothing
        } catch (err) {
            // If medical record doesn't exist, create a new one
            if (err instanceof Error && err.message.includes("404")) {
                try {
                    await createMedicalRecord({
                        visitId,
                        isDraft: true,
                    });
                    // Reload after creation
                    const data = await getMedicalRecordByVisit(visitId);
                    setRecordData(data);

                    // Auto-update visit status to "in_examination" when creating new medical record
                    const currentStatus = data.visit.status as VisitStatus;

                    if (currentStatus === "registered" || currentStatus === "waiting") {
                        try {
                            await updateVisitStatus(visitId, "in_examination");
                        } catch (statusErr) {
                            console.error("Failed to update visit status to in_examination:", statusErr);
                        }
                    }
                    // If already in_examination or beyond, do nothing
                } catch (createErr) {
                    setError(getErrorMessage(createErr));
                }
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setIsLoading(false);
        }
    }, [visitId]);

    useEffect(() => {
        loadMedicalRecord();
    }, [loadMedicalRecord]);

    const saveDraft = useCallback(async () => {
        if (!recordData) return;

        try {
            setIsSaving(true);
            setError(null);

            await updateMedicalRecord(recordData.medicalRecord.id, {
                isDraft: true,
            });

            // Reload to get updated data
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [recordData, loadMedicalRecord]);

    const lockRecord = useCallback(async (userId: string) => {
        if (!recordData) return;

        try {
            setIsLocking(true);
            setError(null);

            await lockMedicalRecord(recordData.medicalRecord.id, userId);

            // Reload to get updated data
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setIsLocking(false);
        }
    }, [recordData, loadMedicalRecord]);

    const saveSOAP = useCallback(async (soapData: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => {
        if (!recordData) return;

        try {
            setError(null);
            await updateMedicalRecord(recordData.medicalRecord.id, soapData);
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        }
    }, [recordData, loadMedicalRecord]);

    const updateRecord = useCallback((updates: Partial<MedicalRecordData["medicalRecord"]>) => {
        if (!recordData) return;

        setRecordData({
            ...recordData,
            medicalRecord: {
                ...recordData.medicalRecord,
                ...updates,
            },
        });
    }, [recordData]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Data
        recordData,
        isLocked: recordData?.medicalRecord.isLocked ?? false,
        isDraft: recordData?.medicalRecord.isDraft ?? true,

        // Loading states
        isLoading,
        isSaving,
        isLocking,

        // Error handling
        error,
        clearError,

        // Operations
        loadMedicalRecord,
        saveSOAP,
        saveDraft,
        lockRecord,
        updateRecord,
    };
}
