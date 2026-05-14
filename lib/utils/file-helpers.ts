import { AttachmentType } from "@/types/lab"

export const ALLOWED_FILE_TYPES: Record<AttachmentType, string[]> = {
  PDF: ["application/pdf"],
  JPEG: ["image/jpeg", "image/jpg"],
  PNG: ["image/png"],
  DICOM: ["application/dicom", "application/x-dicom", "image/dicom"],
}

export function getAllowedMimeTypes(): string[] {
  return Object.values(ALLOWED_FILE_TYPES).flat()
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase()
}

export function getAttachmentType(file: File): AttachmentType | null {
  for (const [type, mimeTypes] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (mimeTypes.includes(file.type)) {
      return type as AttachmentType
    }
  }
  const extension = getFileExtension(file.name)
  if (extension === ".pdf") return "PDF"
  if ([".jpg", ".jpeg"].includes(extension)) return "JPEG"
  if (extension === ".png") return "PNG"
  if ([".dcm", ".dicom"].includes(extension)) return "DICOM"
  return null
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const type = getAttachmentType(file)
  if (!type) return { valid: false, error: "Tipe file tidak didukung" }
  const maxSizeMB = type === "PDF" || type === "DICOM" ? 50 : 10
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Ukuran file melebihi batas maksimal ${maxSizeMB}MB` }
  }
  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
