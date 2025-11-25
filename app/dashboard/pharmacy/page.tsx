"use client";

/**
 * Pharmacy Queue Dashboard
 * Displays pending prescriptions and expiring drugs
 */

import { useState } from "react";
import { usePharmacyDashboard } from "@/hooks/use-pharmacy-dashboard";
import { usePrescriptionFulfillment } from "@/hooks/use-prescription-fulfillment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PharmacyNotificationPanel } from "@/components/notifications/pharmacy-notification-panel";
import { PharmacyHeader } from "@/components/pharmacy/pharmacy-header";
import { PharmacyStatsCards } from "@/components/pharmacy/pharmacy-stats-cards";
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table";
import { ExpiringDrugsList } from "@/components/pharmacy/expiring-drugs-list";
import { FulfillmentDialog } from "@/components/pharmacy/fulfillment-dialog";

interface SelectedPrescription {
    prescription: {
        id: number;
        quantity: number;
    };
    drug: {
        name: string;
        genericName?: string | null;
        unit: string;
    };
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

    const { fulfillPrescription, isSubmitting } = usePrescriptionFulfillment();

    const [selectedPrescription, setSelectedPrescription] = useState<SelectedPrescription | null>(null);

    const handleFulfill = async (data: {
        inventoryId: number;
        dispensedQuantity: number;
        fulfilledBy: string;
        notes?: string;
    }) => {
        if (!selectedPrescription) return;

        const success = await fulfillPrescription({
            prescriptionId: selectedPrescription.prescription.id,
            ...data,
        });

        if (success) {
            setSelectedPrescription(null);
            refresh();
        }
    };

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
                        onProcess={setSelectedPrescription}
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

            {/* Fulfillment Dialog */}
            <FulfillmentDialog
                open={!!selectedPrescription}
                onOpenChange={(open) => !open && setSelectedPrescription(null)}
                selectedPrescription={selectedPrescription}
                isSubmitting={isSubmitting}
                onSubmit={handleFulfill}
            />
        </div>
    );
}
