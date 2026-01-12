/**
 * File Upload Utilities
 * Handle file uploads to Supabase Storage for lab attachments
 */

import { supabase, LAB_ATTACHMENTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase"
import { AttachmentType } from "@/types/lab"

/**
 * Allowed file types and their MIME types
 */
export const ALLOWED_FILE_TYPES: Record<AttachmentType, string[]> = {
  PDF: ["application/pdf"],
  JPEG: ["image/jpeg", "image/jpg"],
  PNG: ["image/png"],
  DICOM: ["application/dicom", "application/x-dicom", "image/dicom"],
}

/**
 * Get all allowed MIME types as flat array
 */
export function getAllowedMimeTypes(): string[] {
  return Object.values(ALLOWED_FILE_TYPES).flat()
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase()
}

/**
 * Determine attachment type from file MIME type or extension
 */
export function getAttachmentType(file: File): AttachmentType | null {
  // Check MIME type first
  for (const [type, mimeTypes] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (mimeTypes.includes(file.type)) {
      return type as AttachmentType
    }
  }

  // Fallback to file extension
  const extension = getFileExtension(file.name)
  if (extension === ".pdf") return "PDF"
  if ([".jpg", ".jpeg"].includes(extension)) return "JPEG"
  if (extension === ".png") return "PNG"
  if ([".dcm", ".dicom"].includes(extension)) return "DICOM"

  return null
}

/**
 * Validate file size (max 10MB for images, 50MB for PDFs/DICOM)
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const type = getAttachmentType(file)

  if (!type) {
    return { valid: false, error: "Tipe file tidak didukung" }
  }

  const maxSizeMB = type === "PDF" || type === "DICOM" ? 50 : 10
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename for uploaded file
 */
function generateUniqueFilename(orderId: string, originalFilename: string): string {
  const timestamp = Date.now()
  const extension = getFileExtension(originalFilename)
  const sanitizedName = originalFilename
    .replace(extension, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 50)

  return `${orderId}/${timestamp}-${sanitizedName}${extension}`
}

/**
 * Upload lab result attachment to Supabase Storage
 *
 * @param file - File to upload
 * @param orderId - Lab order ID for organizing files
 * @returns Public URL of uploaded file or null if upload fails
 */
export async function uploadLabAttachment(
  file: File,
  orderId: string
): Promise<{ url: string; type: AttachmentType } | { error: string }> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase tidak dikonfigurasi. Harap hubungi administrator untuk mengaktifkan fitur upload file.",
    }
  }

  // Validate file type
  const attachmentType = getAttachmentType(file)
  if (!attachmentType) {
    return {
      error: "Tipe file tidak didukung. Hanya file PDF, JPEG, PNG, dan DICOM yang diperbolehkan.",
    }
  }

  // Validate file size
  const sizeValidation = validateFileSize(file)
  if (!sizeValidation.valid) {
    return { error: sizeValidation.error! }
  }

  try {
    // Generate unique filename
    const filename = generateUniqueFilename(orderId, file.name)
    const filePath = `${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(LAB_ATTACHMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return { error: `Gagal mengunggah file: ${error.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(LAB_ATTACHMENTS_BUCKET).getPublicUrl(data.path)

    return {
      url: publicUrl,
      type: attachmentType,
    }
  } catch (error) {
    console.error("File upload error:", error)
    return { error: "Terjadi kesalahan saat mengunggah file. Silakan coba lagi." }
  }
}

/**
 * Delete lab attachment from Supabase Storage
 *
 * @param fileUrl - Public URL of the file to delete
 * @returns Success status
 */
export async function deleteLabAttachment(fileUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, cannot delete file")
    return false
  }

  try {
    // Extract file path from public URL
    // Format: https://[project].supabase.co/storage/v1/object/public/lab-attachments/[path]
    const pathMatch = fileUrl.match(/lab-attachments\/(.+)$/)
    if (!pathMatch) {
      console.error("Invalid file URL format")
      return false
    }

    const filePath = pathMatch[1]

    const { error } = await supabase.storage.from(LAB_ATTACHMENTS_BUCKET).remove([filePath])

    if (error) {
      console.error("Supabase delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("File delete error:", error)
    return false
  }
}

/**
 * Format file size for display (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
