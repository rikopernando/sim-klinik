/**
 * User Management Page
 * CRUD interface for managing users (Super Admin only)
 */

"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Item,
    ItemContent,
    ItemMedia,
    ItemTitle,
  } from "@/components/ui/item"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { UserTable } from "@/components/users/user-table";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { ChangeRoleDialog } from "@/components/users/change-role-dialog";
import { Pagination } from "@/components/users/pagination";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string | null;
    roleId: number | null;
    createdAt: Date;
}

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const { users, pagination, isLoading, error, fetchUsers, deleteUser, refreshUsers } = useUsers();
    const { roles, fetchRoles } = useRoles();

    // Fetch users and roles on mount
    useEffect(() => {
        fetchUsers(search, currentPage, 10);
        fetchRoles();
    }, [fetchUsers, fetchRoles, search, currentPage]);

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers(search, 1, 10);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle edit user
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    // Handle change role
    const handleChangeRole = (user: User) => {
        setSelectedUser(user);
        setRoleDialogOpen(true);
    };

    // Handle delete user
    const handleDelete = (userId: string) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!userToDelete) return;

        const success = await deleteUser(userToDelete);

        if (success) {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            toast.success("User berhasil dihapus!");
        } else {
            toast.error("Gagal menghapus user!");
        }
    };

    // Refresh data after successful operations
    const handleSuccess = () => {
        refreshUsers();
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen User</h1>
                    <p className="text-muted-foreground">
                        Kelola user dan role sistem
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <IconUserPlus size={20} className="mr-2" />
                    Tambah User
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="mb-6 border-red-500 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar User</CardTitle>
                    {users.length > 0 && !isLoading && (
                        <CardDescription>
                            Total: {pagination?.total || 0} user
                        </CardDescription>
                    )}
                    <CardAction>
                        <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                            <Input
                                placeholder="Cari berdasarkan nama atau username"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="min-w-[304px] pl-10"
                            />
                        </div>
                        </div>
                    </CardAction>
                </CardHeader>
                    {users.length === 0 && isLoading ? (
                         <div className="mx-auto flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
                         <Item variant="outline">
                           <ItemMedia>
                             <Spinner />
                           </ItemMedia>
                           <ItemContent>
                             <ItemTitle className="line-clamp-1">Memuat data user...</ItemTitle>
                           </ItemContent>
                         </Item>
                       </div>
                    ) : (
                        <CardContent>
                        <UserTable
                            users={users}
                            onEdit={handleEdit}
                            onChangeRole={handleChangeRole}
                            onDelete={handleDelete}
                        />
    
                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </CardContent>
                    )}
            </Card>

            {/* Create User Dialog */}
            <CreateUserDialog
                roles={roles}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleSuccess}
            />

            {/* Edit User Dialog */}
            <EditUserDialog
                user={selectedUser}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={handleSuccess}
            />

            {/* Change Role Dialog */}
            <ChangeRoleDialog
                user={selectedUser}
                roles={roles}
                open={roleDialogOpen}
                onOpenChange={setRoleDialogOpen}
                onSuccess={handleSuccess}
            />

            {/* Delete Confirmation Dialog */}
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
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
