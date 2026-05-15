"use client"

import { useEffect, useState } from "react"
import { IconUserPlus, IconUsers } from "@tabler/icons-react"
import { PageGuard } from "@/components/auth/page-guard"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { TablePanel } from "@/components/ui/table-panel"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserTable } from "@/components/users/user-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { ChangeRoleDialog } from "@/components/users/change-role-dialog"
import { Pagination } from "@/components/users/pagination"
import { useUsers } from "@/hooks/use-users"
import { useRoles } from "@/hooks/use-roles"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string | null
  roleId: string | null
  createdAt: Date
}

export default function UsersPage() {
  return (
    <PageGuard roles={["super_admin"]}>
      <UsersPageContent />
    </PageGuard>
  )
}

function UsersPageContent() {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 400)
  const { users, pagination, isLoading, fetchUsers, deleteUser, refreshUsers } = useUsers()
  const { roles, fetchRoles } = useRoles()

  const isSearching = search !== debouncedSearch || isLoading

  useEffect(() => {
    fetchUsers(debouncedSearch, currentPage, 10)
    fetchRoles()
  }, [fetchUsers, fetchRoles, debouncedSearch, currentPage])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setRoleDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    const success = await deleteUser(userToDelete)
    if (success) {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      toast.success("User berhasil dihapus!")
    } else {
      toast.error("Gagal menghapus user!")
    }
  }

  const total = pagination?.total ?? 0
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * 10 + 1
  const rangeEnd = pagination ? Math.min(currentPage * 10, total) : 0

  return (
    <div>
      <PageHeader title="Manajemen User" description="Kelola user dan role sistem">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconUserPlus size={16} className="mr-1.5" />
          Tambah User
        </Button>
      </PageHeader>

      <div className="container mx-auto max-w-5xl space-y-4 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setCurrentPage(1)
            }}
            placeholder="Cari nama atau username..."
            isSearching={isSearching}
            className="max-w-sm flex-1"
          />
          {!isLoading && total > 0 && (
            <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
              <span className="text-foreground font-medium">{total.toLocaleString("id-ID")}</span>{" "}
              user
            </p>
          )}
        </div>

        <TablePanel
          label="Daftar User"
          total={total}
          isLoading={users.length === 0 && isLoading}
          loadingMessage="Memuat data user..."
          isEmpty={users.length === 0 && !isLoading}
          emptyIcon={<IconUsers size={22} className="text-[#52b788]" />}
          emptyTitle={search ? "User tidak ditemukan" : "Belum ada user"}
          emptyDescription={
            search ? `Tidak ada hasil untuk "${search}"` : "Mulai dengan menambahkan user baru"
          }
          emptyAction={
            !search ? (
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <IconUserPlus size={14} className="mr-1.5" />
                Tambah User
              </Button>
            ) : undefined
          }
          paginationRange={
            pagination && pagination.totalPages > 1
              ? `Menampilkan ${rangeStart.toLocaleString("id-ID")}–${rangeEnd.toLocaleString("id-ID")} dari ${total.toLocaleString("id-ID")} user`
              : undefined
          }
          pagination={
            pagination && pagination.totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            ) : undefined
          }
        >
          <UserTable
            users={users}
            onEdit={handleEdit}
            onChangeRole={handleChangeRole}
            onDelete={handleDelete}
          />
        </TablePanel>
      </div>

      <CreateUserDialog
        roles={roles}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refreshUsers()}
      />

      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => refreshUsers()}
      />

      <ChangeRoleDialog
        user={selectedUser}
        roles={roles}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onSuccess={() => refreshUsers()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. User akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
