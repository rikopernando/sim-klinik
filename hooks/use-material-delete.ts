/**
 * useMaterialDelete Hook
 * Custom hook for material deletion logic
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useMaterials } from "@/hooks/use-materials"
import type { MaterialUsage } from "@/types/inpatient"

interface UseMaterialDeleteOptions {
  onSuccess?: () => void
}

interface UseMaterialDeleteReturn {
  deleteDialogOpen: boolean
  materialToDelete: MaterialUsage | null
  isDeleting: boolean
  canDelete: (usedAt: string) => boolean // Changed from createdAt to usedAt
  handleDeleteClick: (material: MaterialUsage) => void
  handleConfirmDelete: () => Promise<void>
  handleCancelDelete: () => void
}

export function useMaterialDelete({
  onSuccess,
}: UseMaterialDeleteOptions = {}): UseMaterialDeleteReturn {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<MaterialUsage | null>(null)
  const { deleteUsage, isDeleting } = useMaterials()

  // Check if material can be deleted (within 1 hour from usedAt)
  // Use usedAt as the "truth value" - when the material was actually used
  const canDelete = useCallback((usedAt: string): boolean => {
    const used = new Date(usedAt)
    const now = new Date()
    const hoursSinceUsage = (now.getTime() - used.getTime()) / (1000 * 60 * 60)

    // Allow deletion within 1 hour of usage
    return hoursSinceUsage <= 1
  }, [])

  // Handle delete button click
  const handleDeleteClick = useCallback((material: MaterialUsage) => {
    setMaterialToDelete(material)
    setDeleteDialogOpen(true)
  }, [])

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (!materialToDelete) return

    try {
      await deleteUsage(materialToDelete.id)
      toast.success("Material berhasil dihapus")
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
      onSuccess?.()
    } catch (error) {
      toast.error("Gagal menghapus material", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
      })
    }
  }, [materialToDelete, deleteUsage, onSuccess])

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setMaterialToDelete(null)
  }, [])

  return {
    deleteDialogOpen,
    materialToDelete,
    isDeleting,
    canDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  }
}
