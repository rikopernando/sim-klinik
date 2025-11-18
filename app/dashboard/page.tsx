/**
 * Role-Based Dashboard Home
 * Redirects to appropriate dashboard based on user role
 */

import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/rbac/session";
import { ROLE_INFO } from "@/types/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
    const user = await getCurrentUserWithRole();

    // If no user, redirect to sign in
    if (!user) {
        redirect("/sign-in");
    }

    // If no role assigned, show warning
    if (!user.role) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-orange-500 bg-orange-50">
                    <CardHeader>
                        <CardTitle>No Role Assigned</CardTitle>
                        <CardDescription>
                            Your account does not have a role assigned yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Please contact your administrator to assign you a role before you can access
                            the system.
                        </p>
                        <div className="mt-4">
                            <p className="text-xs font-medium">User Information:</p>
                            <p className="text-xs text-muted-foreground">Email: {user.email}</p>
                            <p className="text-xs text-muted-foreground">Name: {user.name}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const roleInfo = ROLE_INFO[user.role];

    // Dashboard home - show role info and quick stats
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Selamat datang, {user.name}
                </p>
            </div>

            {/* Role Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Informasi Role
                        <Badge className={`${roleInfo.color} text-white`}>
                            {roleInfo.label}
                        </Badge>
                    </CardTitle>
                    <CardDescription>{roleInfo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm font-medium">Permissions:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {user.permissions.slice(0, 5).map((permission) => (
                                    <Badge key={permission} variant="outline">
                                        {permission}
                                    </Badge>
                                ))}
                                {user.permissions.length > 5 && (
                                    <Badge variant="outline">
                                        +{user.permissions.length - 5} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats - Different for each role */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.role === "super_admin" && <SuperAdminStats />}
                {user.role === "admin" && <AdminStats />}
                {user.role === "doctor" && <DoctorStats />}
                {user.role === "nurse" && <NurseStats />}
                {user.role === "pharmacist" && <PharmacistStats />}
                {user.role === "cashier" && <CashierStats />}
                {user.role === "receptionist" && <ReceptionistStats />}
            </div>
        </div>
    );
}

// Role-specific stat components
function SuperAdminStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">48</p>
                    <p className="text-xs text-muted-foreground">active users</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">99.8%</p>
                    <p className="text-xs text-muted-foreground">uptime</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Rp 250jt</p>
                    <p className="text-xs text-muted-foreground">bulan ini</p>
                </CardContent>
            </Card>
        </>
    );
}

function DoctorStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Antrian Pasien Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">pasien menunggu</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Pasien Selesai</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">pasien hari ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">RME Belum Dikunci</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">rekam medis</p>
                </CardContent>
            </Card>
        </>
    );
}

function NurseStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Pasien Rawat Inap</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">pasien aktif</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Kamar Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-xs text-muted-foreground">kamar kosong</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Vital Signs Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">pasien belum dicek</p>
                </CardContent>
            </Card>
        </>
    );
}

function PharmacistStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Resep Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">7</p>
                    <p className="text-xs text-muted-foreground">resep belum diambil</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Obat Hampir Habis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">item perlu restock</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Obat Kadaluarsa</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">dalam 30 hari</p>
                </CardContent>
            </Card>
        </>
    );
}

function CashierStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tagihan Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">15</p>
                    <p className="text-xs text-muted-foreground">belum dibayar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Total Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Rp 8.5jt</p>
                    <p className="text-xs text-muted-foreground">pendapatan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tunai</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Rp 5.2jt</p>
                    <p className="text-xs text-muted-foreground">kas hari ini</p>
                </CardContent>
            </Card>
        </>
    );
}

function ReceptionistStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Kunjungan Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">45</p>
                    <p className="text-xs text-muted-foreground">total kunjungan</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Pasien Baru</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">registrasi baru</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Antrian Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">sedang menunggu</p>
                </CardContent>
            </Card>
        </>
    );
}

function AdminStats() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Total Kunjungan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">45</p>
                    <p className="text-xs text-muted-foreground">hari ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Pendapatan</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">Rp 8.5jt</p>
                    <p className="text-xs text-muted-foreground">hari ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Hunian Kamar</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">80%</p>
                    <p className="text-xs text-muted-foreground">24/30 kamar terisi</p>
                </CardContent>
            </Card>
        </>
    );
}
