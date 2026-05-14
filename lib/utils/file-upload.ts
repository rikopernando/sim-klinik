/**
 * File Upload Utilities
 * Handle file uploads to Supabase Storage for lab attachments
 */

import { supabase, LAB_ATTACHMENTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase"
import {
  ALLOWED_FILE_TYPES,
  getAllowedMimeTypes,
  getAttachmentType,
  validateFileSize,
  formatFileSize,
} from "@/lib/utils/file-helpers"
import { AttachmentType } from "@/types/lab"

export { ALLOWED_FILE_TYPES, getAllowedMimeTypes, getAttachmentType, validateFileSize, formatFileSize }

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase()
}

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

