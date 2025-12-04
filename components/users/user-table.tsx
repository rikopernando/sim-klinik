/**
 * User Table Component
 * Displays users in a table with actions
 */

"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IconTrash, IconUserEdit, IconKey } from "@tabler/icons-react"
import { ROLE_INFO } from "@/types/rbac"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string | null
  roleId: string | null
  createdAt: Date
}

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onChangeRole: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserTable({ users, onEdit, onChangeRole, onDelete }: UserTableProps) {
  const getRoleBadgeColor = (roleName: string | null) => {
    if (!roleName) return "bg-gray-500"
    const roleInfo = ROLE_INFO[roleName as keyof typeof ROLE_INFO]
    return roleInfo?.color || "bg-gray-500"
  }

  if (users.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">Tidak ada user ditemukan</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Terdaftar</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>
              {user.role ? (
                <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                  {ROLE_INFO[user.role as keyof typeof ROLE_INFO]?.label || user.role}
                </Badge>
              ) : (
                <Badge variant="outline">No Role</Badge>
              )}
            </TableCell>
            <TableCell>{format(new Date(user.createdAt), "dd MMM yyyy")}</TableCell>
            <TableCell className="text-right">
              <TooltipProvider>
                <div className="flex justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                        <IconUserEdit size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit User</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => onChangeRole(user)}>
                        <IconKey size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ubah Role</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(user.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hapus User</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
