/**
 * User Service
 * API calls for user management
 */

import axios from "axios";

export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: string | null;
    roleId: number | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface FetchUsersResponse {
    users: User[];
    pagination: Pagination;
}

export interface CreateUserData {
    name: string;
    email: string;
    username: string;
    password: string;
    roleId?: number;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    username?: string;
}

/**
 * Fetch users with pagination and search
 */
export async function fetchUsers(
    search?: string,
    page: number = 1,
    limit: number = 10
): Promise<FetchUsersResponse> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await axios.get<FetchUsersResponse>(`/api/users?${params.toString()}`);
    return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
    const response = await axios.post<User>("/api/users", data);
    return response.data;
}

/**
 * Update user information
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const response = await axios.put<User>(`/api/users/${userId}`, data);
    return response.data;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
    await axios.delete(`/api/users/${userId}`);
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleId: number): Promise<void> {
    await axios.put(`/api/users/${userId}/role`, { roleId });
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string): Promise<void> {
    await axios.delete(`/api/users/${userId}/role`);
}
