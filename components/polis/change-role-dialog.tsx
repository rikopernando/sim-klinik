/**
 * Change Role Dialog Component
 * Form to change user role
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLE_INFO } from "@/types/rbac"
import * as userService from "@/lib/services/user.service"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  roleId: string | null
}

interface Role {
  id: string
  name: string
}

interface ChangeRoleDialogProps {
  user: User | null
  roles: Role[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ChangeRoleDialog({
  user,
  roles,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")

  useEffect(() => {
    if (user) {
      setSelectedRole(user.roleId?.toString() || "")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedRole) return

    setIsSubmitting(true)
    setError(null)

    try {
      await userService.assignRole(user.id, parseInt(selectedRole))
      onOpenChange(false)
      toast.success("Role berhasil diubah!")
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change role"
      setError(errorMessage)
      toast.error(`Gagal mengubah role: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Role</DialogTitle>
          <DialogDescription>Pilih role baru untuk {user.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {ROLE_INFO[role.name as keyof typeof ROLE_INFO]?.label || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedRole}>
              {isSubmitting ? "Menyimpan..." : "Simpan Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
