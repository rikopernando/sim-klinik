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
 */
export function canEditMedicalRecord(isLocked: boolean): boolean {
    return !isLocked;
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
