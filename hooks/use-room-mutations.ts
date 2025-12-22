/**
 * Room Mutations Hook
 * Handles create, update, and delete operations for rooms
 */

import { useState } from "react"
import { toast } from "sonner"
import type { RoomCreateInput, RoomUpdateInput } from "@/types/rooms"
import { createRoom, updateRoom, deleteRoom } from "@/lib/services/rooms.service"
import { getErrorMessage } from "@/lib/utils/error"

export function useRoomMutations(onSuccess?: () => void) {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Create a new room
   */
  const create = async (data: RoomCreateInput) => {
    setIsCreating(true)
    try {
      await createRoom(data)
      toast.success("Kamar berhasil ditambahkan")
      onSuccess?.()
    } catch (error) {
      console.error("Error creating room:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Update an existing room
   */
  const update = async (id: string, data: RoomUpdateInput) => {
    setIsUpdating(true)
    try {
      await updateRoom(id, data)
      toast.success("Kamar berhasil diperbarui")
      onSuccess?.()
    } catch (error) {
      console.error("Error updating room:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Delete a room
   */
  const remove = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteRoom(id)
      toast.success("Kamar berhasil dihapus")
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isDeleting,
    isLoading: isCreating || isUpdating || isDeleting,
  }
}
