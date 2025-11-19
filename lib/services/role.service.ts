/**
 * Role Service
 * API calls for role management
 */

import axios from "axios";

export interface Role {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Fetch all roles
 */
export async function fetchRoles(): Promise<Role[]> {
    const response = await axios.get<{ roles: Role[] }>("/api/roles");
    return response.data.roles;
}
