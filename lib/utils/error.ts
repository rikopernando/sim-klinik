/**
 * Error handling utilities
 */

import axios from "axios";

interface ValidationError {
    message: string;
}

interface ApiErrorResponse {
    error?: string;
    details?: ValidationError[];
}

/**
 * Extract user-friendly error message from API error
 * @param error - Error object from API call
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        // Handle validation errors
        if (error.response?.data?.details) {
            const validationErrors = error.response.data.details
                .map((err) => err.message)
                .join(", ");
            return `Validasi gagal: ${validationErrors}`;
        }

        // Handle general API errors
        if (error.response?.data?.error) {
            return error.response.data.error;
        }

        // Handle network errors
        if (error.message) {
            return error.message;
        }
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback error message
    return "Terjadi kesalahan. Silakan coba lagi.";
}

/**
 * Check if error is a validation error
 * @param error - Error object
 * @returns True if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    return (
        axios.isAxiosError<ApiErrorResponse>(error) &&
        !!error.response?.data?.details &&
        Array.isArray(error.response.data.details)
    );
}

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns True if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    return axios.isAxiosError(error) && !error.response;
}
