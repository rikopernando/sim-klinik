/**
 * User Service
 * API calls for user management
 */

import axios, { AxiosError } from "axios"

/**
 * Extract error message from axios error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Check if the response has an error message
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    // Check for message in response data
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    // Fallback to status text
    if (error.response?.statusText) {
      return error.response.statusText
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unknown error occurred"
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
  role: string | null
  roleId: number | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FetchUsersResponse {
  users: User[]
  pagination: Pagination
}

export interface CreateUserData {
  name: string
  email: string
  username: string
  password: string
  roleId?: number
}

export interface UpdateUserData {
  name?: string
  email?: string
  username?: string
}

/**
 * Fetch users with pagination and search
 */
export async function fetchUsers(
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchUsersResponse> {
  try {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const response = await axios.get<FetchUsersResponse>(`/api/users?${params.toString()}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    const response = await axios.post<User>("/api/users", data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Update user information
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<User> {
  try {
    const response = await axios.put<User>(`/api/users/${userId}`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await axios.delete(`/api/users/${userId}`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Assign role to user
 */
export async function assignRole(userId: string, roleId: number): Promise<void> {
  try {
    await axios.put(`/api/users/${userId}/role`, { roleId })
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string): Promise<void> {
  try {
    await axios.delete(`/api/users/${userId}/role`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
