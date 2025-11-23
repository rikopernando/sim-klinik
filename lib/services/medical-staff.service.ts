/**
 * Medical Staff Service
 * Handle medical staff (doctors and nurses) related API operations
 */

import axios from "axios";

export interface MedicalStaff {
    id: string;
    name: string;
    email: string;
    roleName: string;
}

interface GetMedicalStaffResponse {
    success: boolean;
    data: MedicalStaff[];
}

/**
 * Fetch all medical staff (doctors and nurses) from the API
 * @returns Promise<MedicalStaff[]>
 */
export async function getMedicalStaff(): Promise<MedicalStaff[]> {
    try {
        const { data } = await axios.get<GetMedicalStaffResponse>("/api/medical-staff");
        return data.data || [];
    } catch (error) {
        console.error("Error in getMedicalStaff service:", error);

        // Re-throw with more context
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.message ||
                "Failed to fetch medical staff"
            );
        }

        throw error;
    }
}

/**
 * Get medical staff by ID
 * @param id - Staff ID
 * @returns Promise<MedicalStaff | null>
 */
export async function getMedicalStaffById(id: string): Promise<MedicalStaff | null> {
    try {
        const staff = await getMedicalStaff();
        return staff.find(s => s.id === id) || null;
    } catch (error) {
        console.error("Error in getMedicalStaffById service:", error);
        throw error;
    }
}

/**
 * Format medical staff name with role
 * @param staff - Medical staff object
 * @returns Formatted name with role
 */
export function formatMedicalStaffName(staff: MedicalStaff): string {
    const roleLabel = staff.roleName === "doctor" ? "Dr." : "Ns.";
    return `${roleLabel} ${staff.name}`;
}
