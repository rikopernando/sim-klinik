/**
 * Medical Record Utility Functions
 */

/**
 * Format diagnosis type to Indonesian
 */
export function formatDiagnosisType(type: "primary" | "secondary"): string {
    return type === "primary" ? "Utama" : "Sekunder";
}

/**
 * Format medication route to Indonesian
 */
export function formatMedicationRoute(route: string): string {
    const routes: Record<string, string> = {
        oral: "Oral (Diminum)",
        topical: "Topikal (Oles)",
        injection: "Injeksi (Suntik)",
        inhalation: "Inhalasi (Hirup)",
        rectal: "Rektal",
        sublingual: "Sublingual",
    };
    return routes[route] || route;
}

/**
 * Get diagnosis type badge variant
 */
export function getDiagnosisTypeBadgeVariant(
    type: "primary" | "secondary"
): "default" | "secondary" {
    return type === "primary" ? "default" : "secondary";
}

/**
 * Check if medical record can be edited
 * Per feedback 4.12: Allow editing locked records until patient discharge
 * Currently always returns true since discharge flow is not yet fully implemented
 * TODO: Implement proper check against visit status when discharge module is complete
 */
export function canEditMedicalRecord(_isLocked: boolean): boolean {
    // Allow editing even if locked, until discharge flow is implemented
    // Once discharge is implemented, check if visit.status === "completed"
    return true;
}

/**
 * Check if prescription can be deleted
 */
export function canDeletePrescription(isLocked: boolean, isFulfilled: boolean): boolean {
    return !isLocked && !isFulfilled;
}

/**
 * Format ICD code (uppercase and trim)
 */
export function formatIcdCode(code: string): string {
    return code.trim().toUpperCase();
}
