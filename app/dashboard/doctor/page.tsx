"use client";

/**
 * Doctor Dashboard (H.3.3)
 * Patient queue, quick access to RME, and patient history
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DashboardGrid,
    DashboardSection,
    StatWidget,
    ListWidget,
    TableWidget,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Stethoscope,
    Users,
    FileText,
    Clock,
    Activity,
    RefreshCw,
    Play,
    History,
} from "lucide-react";
import { useDoctorStats } from "@/hooks/use-doctor-stats";
import { useDoctorQueue } from "@/hooks/use-doctor-queue";
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog";

export default function DoctorDashboard() {
    const router = useRouter();
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch dashboard statistics with auto-refresh
    const { stats, isLoading: statsLoading, lastRefresh, refresh: refreshStats } = useDoctorStats({
        autoRefresh: true,
        refreshInterval: 60000, // Refresh every 60 seconds
    });

    // Fetch patient queue with auto-refresh
    const { queue, isLoading: queueLoading, refresh: refreshQueue } = useDoctorQueue({
        status: "all",
        autoRefresh: true,
        refreshInterval: 30000, // Refresh every 30 seconds
    });

    const handleRefreshAll = () => {
        refreshStats();
        refreshQueue();
    };

    const handleStartExamination = (visitId: number) => {
        router.push(`/dashboard/medical-records/${visitId}`);
    };

    const handleViewHistory = (patient: any) => {
        setSelectedPatient(patient);
        setShowHistory(true);
    };

    // Separate queue by status for tabs
    const waitingQueue = queue.filter(
        (item) => item.visit.status === "registered" || item.visit.status === "waiting"
    );
    const inProgressQueue = queue.filter((item) => item.visit.status === "in_examination");
    const unlockedQueue = queue.filter(
        (item) => item.medicalRecord && !item.medicalRecord.isLocked
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Dokter</h1>
                    <p className="text-muted-foreground">
                        Kelola antrian pasien dan rekam medis
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {lastRefresh && (
                        <p className="text-sm text-muted-foreground">
                            Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
                        </p>
                    )}
                    <Button onClick={handleRefreshAll} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Statistics Section */}
            <DashboardSection title="Statistik Hari Ini" description="Overview kunjungan pasien">
                <DashboardGrid columns={4}>
                    <StatWidget
                        title="Antrian Menunggu"
                        value={stats?.today.waiting || 0}
                        subtitle="pasien menunggu"
                        icon={Clock}
                        iconColor="text-blue-500"
                        badge={
                            stats?.today.waiting
                                ? { label: "Butuh Perhatian", variant: "default" }
                                : undefined
                        }
                    />
                    <StatWidget
                        title="Sedang Diperiksa"
                        value={stats?.today.inProgress || 0}
                        subtitle="pasien dalam pemeriksaan"
                        icon={Activity}
                        iconColor="text-green-500"
                    />
                    <StatWidget
                        title="Selesai Hari Ini"
                        value={stats?.today.completed || 0}
                        subtitle="pasien selesai"
                        icon={Stethoscope}
                        iconColor="text-purple-500"
                    />
                    <StatWidget
                        title="RME Belum Dikunci"
                        value={stats?.unlockedRecords || 0}
                        subtitle="rekam medis"
                        icon={FileText}
                        iconColor="text-orange-500"
                        badge={
                            stats && stats.unlockedRecords > 0
                                ? { label: "Action Required", variant: "destructive" }
                                : undefined
                        }
                    />
                </DashboardGrid>
            </DashboardSection>

            {/* Patient Queue Section */}
            <DashboardSection
                title="Antrian Pasien"
                description="Daftar pasien yang perlu ditangani"
            >
                <Tabs defaultValue="waiting" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="waiting">
                            Menunggu ({waitingQueue.length})
                        </TabsTrigger>
                        <TabsTrigger value="in_progress">
                            Sedang Diperiksa ({inProgressQueue.length})
                        </TabsTrigger>
                        <TabsTrigger value="unlocked">
                            RME Belum Dikunci ({unlockedQueue.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Waiting Queue */}
                    <TabsContent value="waiting">
                        <ListWidget
                            title="Pasien Menunggu"
                            icon={Clock}
                            items={waitingQueue.map((item) => ({
                                id: item.visit.id,
                                title: item.patient?.name || "Unknown Patient",
                                subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"} • Queue: ${item.visit.queueNumber || "-"}`,
                                icon: Users,
                                badge: {
                                    label: item.visit.visitType === "emergency" ? "UGD" : "Rawat Jalan",
                                    variant: item.visit.visitType === "emergency" ? "destructive" : "outline",
                                },
                                action: {
                                    label: "Mulai",
                                    onClick: () => handleStartExamination(item.visit.id),
                                },
                            }))}
                            emptyMessage="Tidak ada pasien dalam antrian"
                            maxHeight="450px"
                            headerAction={
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (waitingQueue.length > 0) {
                                                handleViewHistory(waitingQueue[0].patient);
                                            }
                                        }}
                                        disabled={waitingQueue.length === 0}
                                    >
                                        <History className="h-4 w-4 mr-1" />
                                        Riwayat
                                    </Button>
                                </div>
                            }
                            onItemClick={(item) => {
                                const queueItem = waitingQueue.find((q) => q.visit.id === item.id);
                                if (queueItem) {
                                    handleViewHistory(queueItem.patient);
                                }
                            }}
                        />
                    </TabsContent>

                    {/* In Progress Queue */}
                    <TabsContent value="in_progress">
                        <ListWidget
                            title="Sedang Diperiksa"
                            icon={Activity}
                            items={inProgressQueue.map((item) => ({
                                id: item.visit.id,
                                title: item.patient?.name || "Unknown Patient",
                                subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"}`,
                                icon: Stethoscope,
                                badge: {
                                    label: "Dalam Pemeriksaan",
                                    variant: "default",
                                },
                                action: {
                                    label: "Lanjutkan",
                                    onClick: () => handleStartExamination(item.visit.id),
                                },
                            }))}
                            emptyMessage="Tidak ada pasien yang sedang diperiksa"
                            maxHeight="450px"
                            onItemClick={(item) => {
                                const queueItem = inProgressQueue.find((q) => q.visit.id === item.id);
                                if (queueItem) {
                                    handleViewHistory(queueItem.patient);
                                }
                            }}
                        />
                    </TabsContent>

                    {/* Unlocked Medical Records */}
                    <TabsContent value="unlocked">
                        <ListWidget
                            title="RME Belum Dikunci"
                            icon={FileText}
                            items={unlockedQueue.map((item) => ({
                                id: item.visit.id,
                                title: item.patient?.name || "Unknown Patient",
                                subtitle: `${item.visit.visitNumber} • ${item.poli?.name || "N/A"}`,
                                icon: FileText,
                                badge: {
                                    label: "Belum Dikunci",
                                    variant: "destructive",
                                },
                                action: {
                                    label: "Kunci RME",
                                    onClick: () => handleStartExamination(item.visit.id),
                                },
                            }))}
                            emptyMessage="Semua RME sudah dikunci"
                            maxHeight="450px"
                            onItemClick={(item) => {
                                handleStartExamination(item.id as number);
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </DashboardSection>

            {/* Medical Record History Dialog */}
            {selectedPatient && (
                <MedicalRecordHistoryDialog
                    open={showHistory}
                    onOpenChange={setShowHistory}
                    patientId={selectedPatient.id}
                    patientName={selectedPatient.name}
                />
            )}
        </div>
    );
}
