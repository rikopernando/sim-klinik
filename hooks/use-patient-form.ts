/**
 * Custom Hook for Patient Form State Management
 * Manages form state and success flow
 */

import { useState, useCallback } from "react";
import { Patient } from "@/types/registration";

type PageState = "form" | "success";

interface UsePatientFormResult {
    pageState: PageState;
    registeredPatient: Patient | null;
    handleSuccess: (patient: Patient) => void;
    handleReset: () => void;
}

export function usePatientForm(): UsePatientFormResult {
    const [pageState, setPageState] = useState<PageState>("form");
    const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

    const handleSuccess = useCallback((patient: Patient) => {
        setRegisteredPatient(patient);
        setPageState("success");
    }, []);

    const handleReset = useCallback(() => {
        setRegisteredPatient(null);
        setPageState("form");
    }, []);

    return {
        pageState,
        registeredPatient,
        handleSuccess,
        handleReset,
    };
}
