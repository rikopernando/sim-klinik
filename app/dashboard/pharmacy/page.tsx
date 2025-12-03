"use client";

/**
 * Pharmacy Queue Dashboard (Refactored)
 * Displays pending prescriptions and expiring drugs with optimized performance
 */

import { useState, useCallback } from "react";
import axios from "axios";
import { usePharmacyDashboard } from "@/hooks/use-pharmacy-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PharmacyNotificationPanel } from "@/components/notifications/pharmacy-notification-panel";
import { PharmacyHeader } from "@/components/pharmacy/pharmacy-header";
import { PharmacyStatsCards } from "@/components/pharmacy/pharmacy-stats-cards";
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table";
import { ExpiringDrugsList } from "@/components/pharmacy/expiring-drugs-list";
import { BulkFulfillmentDialog } from "@/components/pharmacy/bulk-fulfillment-dialog";
import { toast } from "sonner";

interface Drug {
    id: number;
    name: string;
    genericName?: string | null;
    unit: string;
    price: string;
}

interface Patient {
    id: number;
    name: string;
    mrNumber: string;
}

interface Doctor {
    id: string;
    name: string;
}

interface Visit {
    id: number;
    visitNumber: string;
}

interface Prescription {
    id: number;
    dosage: string;
    frequency: string;
    quantity: number;
    duration?: string | null;
    instructions?: string | null;
}

interface GroupedQueueItem {
    visit: Visit;
    patient: Patient;
    doctor: Doctor | null;
    medicalRecordId: number;
    prescriptions: Array<{
        prescription: Prescription;
        drug: Drug;
    }>;
}

export default function PharmacyDashboard() {
    const {
        queue,
        queueLoading,
        queueError,
        expiringDrugs,
        expiringLoading,
        expiringError,
        lastRefresh,
        refresh,
    } = usePharmacyDashboard();

    const [selectedGroup, setSelectedGroup] = useState<GroupedQueueItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Memoize handlers to prevent unnecessary re-renders
    const handleBulkFulfill = useCallback(
        async (
            prescriptions: Array<{
                prescriptionId: number;
                inventoryId: number;
                dispensedQuantity: number;
                fulfilledBy: string;
                notes?: string;
            }>
        ) => {
            setIsSubmitting(true);
            try {
                const response = await axios.post("/api/pharmacy/fulfillment/bulk", {
                    prescriptions,
                });

                if (response.data.success) {
                    toast.success(response.data.message || "Semua resep berhasil diproses");
                    setSelectedGroup(null);
                    refresh();
                }
            } catch (error) {
                console.error("Bulk fulfillment error:", error);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data?.error || "Gagal memproses resep");
                } else {
                    toast.error("Terjadi kesalahan saat memproses resep");
                }
                throw error; // Re-throw to let dialog handle it
            } finally {
                setIsSubmitting(false);
            }
        },
        [refresh]
    );

    const handleProcessGroup = useCallback((group: GroupedQueueItem) => {
        setSelectedGroup(group);
    }, []);

    const handleDialogClose = useCallback((open: boolean) => {
        if (!open && !isSubmitting) {
            setSelectedGroup(null);
        }
    }, [isSubmitting]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PharmacyHeader lastRefresh={lastRefresh} onRefresh={refresh} />

            {/* Real-time Notification Panel (H.1.1) */}
            <PharmacyNotificationPanel />

            {/* Statistics Cards */}
            <PharmacyStatsCards
                queueCount={queue.length}
                expiringDrugs={expiringDrugs}
            />

            {/* Main Content */}
            <Tabs defaultValue="queue" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="queue">
                        Antrian Resep ({queue.length})
                    </TabsTrigger>
                    <TabsTrigger value="expiring">
                        Obat Kadaluarsa ({expiringDrugs.all.length})
                    </TabsTrigger>
                </TabsList>

                {/* Prescription Queue Tab */}
                <TabsContent value="queue" className="space-y-4">
                    <PrescriptionQueueTable
                        queue={queue}
                        isLoading={queueLoading}
                        error={queueError}
                        onProcess={handleProcessGroup}
                    />
                </TabsContent>

                {/* Expiring Drugs Tab */}
                <TabsContent value="expiring" className="space-y-4">
                    <ExpiringDrugsList
                        drugs={expiringDrugs.all}
                        isLoading={expiringLoading}
                        error={expiringError}
                    />
                </TabsContent>
            </Tabs>

            {/* Bulk Fulfillment Dialog */}
            <BulkFulfillmentDialog
                open={!!selectedGroup}
                onOpenChange={handleDialogClose}
                selectedGroup={selectedGroup}
                isSubmitting={isSubmitting}
                onSubmit={handleBulkFulfill}
                medicalRecordId={selectedGroup?.medicalRecordId}
                onPrescriptionAdded={refresh}
            />
        </div>
    );
}
