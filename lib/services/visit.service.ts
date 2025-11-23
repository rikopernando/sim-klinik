/**
 * Visit Service - Handles all visit-related API calls
 */

import axios from "axios";
import { type VisitFormData, type RegisteredVisit } from "@/types/registration";

/**
 * Register a new visit
 */
export async function registerVisit(
    patientId: number,
    data: VisitFormData
): Promise<RegisteredVisit> {
    const payload = {
        patientId,
        visitType: data.visitType,
        poliId: data.poliId ? parseInt(data.poliId) : undefined,
        doctorId: data.doctorId || undefined,
        triageStatus: data.triageStatus,
        chiefComplaint: data.chiefComplaint,
        roomId: data.roomId ? parseInt(data.roomId) : undefined,
        notes: data.notes,
    };

    const response = await axios.post<{ data: RegisteredVisit }>(
        "/api/visits",
        payload
    );

    return response.data.data;
}

/**
 * Get queue for specific visit type
 */
export async function getQueue(visitType?: string) {
    const response = await axios.get("/api/visits", {
        params: visitType ? { visitType } : undefined,
    });

    return response.data.data || [];
}

/**
 * Update visit status
 */
export async function updateVisitStatus(
    visitId: number,
    newStatus: string,
    reason?: string
): Promise<void> {
    await axios.patch("/api/visits/status", {
        visitId,
        newStatus,
        reason,
    });
}
