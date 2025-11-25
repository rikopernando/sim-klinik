/**
 * Medical Record Page
 * Main page for viewing and editing electronic medical records
 *
 * Refactored for better readability, modularity, and performance
 */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useMedicalRecord } from "@/hooks/use-medical-record";
import { MedicalRecordHeader } from "@/components/medical-records/medical-record-header";
import { MedicalRecordActions } from "@/components/medical-records/medical-record-actions";
import { MedicalRecordTabs } from "@/components/medical-records/medical-record-tabs";
import { record } from "zod";

export default function MedicalRecordPage() {
    const params = useParams();
    const router = useRouter();
    const visitId = parseInt(params.visitId as string, 10);
    const [activeTab, setActiveTab] = useState("soap");

    // Use custom hook for all medical record operations
    const {
        recordData,
        isLocked,
        isDraft,
        isLoading,
        isSaving,
        isLocking,
        error,
        loadMedicalRecord,
        saveSOAP,
        saveDraft,
        lockRecord,
        updateRecord,
    } = useMedicalRecord({ visitId });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Memuat rekam medis...</p>
                </div>
            </div>
        );
    }

    // Error state (no data loaded)
    if (error && !recordData) {
        return (
            <div className="container mx-auto max-w-6xl p-6">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.back()} className="mt-4">
                    Kembali
                </Button>
            </div>
        );
    }

    // No data state
    if (!recordData) {
        return null;
    }

    // Handle lock action
    const handleLock = async () => {
        await lockRecord(recordData.medicalRecord.doctorId);
    };

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
            {/* Header with visit info and status badges */}
            <MedicalRecordHeader
                visit={recordData.visit}
                visitId={visitId}
                isLocked={isLocked}
                isDraft={isDraft}
            />

            {/* Error Alert (shows errors during operations) */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Catatan Medis</CardTitle>
                            <CardDescription>
                                Dokumentasi pemeriksaan dan tindakan medis
                            </CardDescription>
                        </div>

                        {/* Action Buttons (Save Draft / Lock & Finish) */}
                        <MedicalRecordActions
                            isLocked={isLocked}
                            isSaving={isSaving}
                            isLocking={isLocking}
                            onSave={saveDraft}
                            onLock={handleLock}
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Tabs with memoized content for better performance */}
                    <MedicalRecordTabs
                        recordData={recordData}
                        activeTab={activeTab}
                        isLocked={isLocked}
                        onTabChange={setActiveTab}
                        onUpdate={loadMedicalRecord}
                        onUpdateRecord={updateRecord}
                        onSaveSOAP={saveSOAP}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
