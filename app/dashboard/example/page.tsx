"use client";

/**
 * Example Dashboard using Dashboard Framework (H.3.1)
 * Demonstrates usage of reusable dashboard components
 */

import {
    DashboardGrid,
    DashboardSection,
    StatWidget,
    ListWidget,
    TableWidget,
    ChartWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
    Users,
    Activity,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ExampleDashboard() {
    // Example data
    const recentActivities = [
        {
            id: 1,
            title: "New patient registered",
            subtitle: "John Doe - MR123456",
            icon: Users,
            badge: { label: "New", variant: "default" as const },
        },
        {
            id: 2,
            title: "Medical record completed",
            subtitle: "Jane Smith - Visit #789",
            icon: CheckCircle,
            badge: { label: "Done", variant: "secondary" as const },
        },
        {
            id: 3,
            title: "Prescription pending",
            subtitle: "Patient ABC - 3 medications",
            icon: AlertCircle,
            badge: { label: "Pending", variant: "destructive" as const },
        },
    ];

    const tableData = [
        { name: "John Doe", mrNumber: "MR001", visitType: "Outpatient", status: "Completed" },
        { name: "Jane Smith", mrNumber: "MR002", visitType: "Inpatient", status: "Active" },
        { name: "Bob Johnson", mrNumber: "MR003", visitType: "Emergency", status: "In Progress" },
    ];

    const tableColumns = [
        { header: "Nama", accessorKey: "name" },
        { header: "No. RM", accessorKey: "mrNumber" },
        { header: "Jenis Kunjungan", accessorKey: "visitType" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge
                    variant={
                        row.status === "Completed"
                            ? "secondary"
                            : row.status === "Active"
                            ? "default"
                            : "outline"
                    }
                >
                    {row.status}
                </Badge>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Example Dashboard</h1>
                    <p className="text-muted-foreground">
                        Demonstrasi dashboard framework yang dapat digunakan kembali
                    </p>
                </div>
                <Button>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Reports
                </Button>
            </div>

            {/* Stats Section */}
            <DashboardSection title="Key Metrics" description="Overview statistik hari ini">
                <DashboardGrid columns={4}>
                    <StatWidget
                        title="Total Pasien"
                        value={245}
                        subtitle="pasien terdaftar"
                        icon={Users}
                        iconColor="text-blue-500"
                        trend={{ value: 12, label: "dari bulan lalu", isPositive: true }}
                    />
                    <StatWidget
                        title="Kunjungan Hari Ini"
                        value={48}
                        subtitle="kunjungan aktif"
                        icon={Activity}
                        iconColor="text-green-500"
                        badge={{ label: "Live", variant: "default" }}
                    />
                    <StatWidget
                        title="Pendapatan"
                        value="Rp 12.5jt"
                        subtitle="total hari ini"
                        icon={DollarSign}
                        iconColor="text-yellow-500"
                        trend={{ value: 8, label: "dari kemarin", isPositive: true }}
                    />
                    <StatWidget
                        title="Rata-rata Waktu"
                        value="25 min"
                        subtitle="waktu tunggu"
                        icon={Clock}
                        iconColor="text-purple-500"
                        trend={{ value: 5, label: "dari kemarin", isPositive: false }}
                    />
                </DashboardGrid>
            </DashboardSection>

            {/* Content Section */}
            <DashboardSection title="Recent Activity & Patient Queue">
                <DashboardGrid columns={2}>
                    {/* List Widget */}
                    <ListWidget
                        title="Aktivitas Terkini"
                        description="Aktivitas sistem dalam 1 jam terakhir"
                        icon={Activity}
                        items={recentActivities}
                        maxHeight="350px"
                        headerAction={
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        }
                    />

                    {/* Table Widget */}
                    <TableWidget
                        title="Antrian Pasien"
                        description="Daftar pasien hari ini"
                        icon={Users}
                        columns={tableColumns}
                        data={tableData}
                        maxHeight="350px"
                        onRowClick={(row) => console.log("Row clicked:", row)}
                        headerAction={
                            <Button variant="ghost" size="sm">
                                Refresh
                            </Button>
                        }
                    />
                </DashboardGrid>
            </DashboardSection>

            {/* Chart Section */}
            <DashboardSection title="Analytics" description="Visualisasi data dan tren">
                <DashboardGrid columns={1}>
                    <ChartWidget
                        title="Revenue Trend"
                        description="Pendapatan 7 hari terakhir"
                        icon={TrendingUp}
                    >
                        <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-md">
                            <p className="text-sm text-muted-foreground">
                                Chart placeholder - Integrate with Recharts, Chart.js, etc.
                            </p>
                        </div>
                    </ChartWidget>
                </DashboardGrid>
            </DashboardSection>
        </div>
    );
}
