"use client"

import { format } from "date-fns"
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
import { cn } from "@/lib/utils"
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

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
        No Role
      </span>
    )
  }
  const roleInfo = ROLE_INFO[role as keyof typeof ROLE_INFO]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white",
        roleInfo?.color || "bg-gray-500"
      )}
    >
      {roleInfo?.label || role}
    </span>
  )
}

export function UserTable({ users, onEdit, onChangeRole, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">Tidak ada user ditemukan</div>
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Nama</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Email</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Username
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">Role</TableHead>
            <TableHead className="text-xs font-semibold tracking-wider uppercase">
              Terdaftar
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-semibold tracking-wider uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="group transition-colors">
              <TableCell className="py-3 font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">{user.email}</TableCell>
              <TableCell className="text-muted-foreground py-3 font-mono text-xs">
                {user.username}
              </TableCell>
              <TableCell className="py-3">
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm">
                {format(new Date(user.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(user)}
                      >
                        <IconUserEdit size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit User</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onChangeRole(user)}
                      >
                        <IconKey size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ubah Role</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-destructive h-7 w-7 p-0"
                        onClick={() => onDelete(user.id)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Hapus User</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}
