/**
 * API Service - Common utilities for all API services
 */

import axios, { AxiosError } from "axios"
import { type ResponseError } from "@/types/api"

/**
 * Custom error class for API service errors
 */
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = "ApiServiceError"
  }
}

/**
 * Generic API error handler
 * Transforms Axios errors into user-friendly ApiServiceError
 * @param error - The error to handle
 * @throws ApiServiceError with user-friendly message and status code
 */
export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ResponseError>
    const message = axiosError.response?.data?.message || axiosError.message || "An error occurred"
    const statusCode = axiosError.response?.status

    throw new ApiServiceError(message, statusCode, error)
  }

  throw new ApiServiceError("An unexpected error occurred", undefined, error)
}
