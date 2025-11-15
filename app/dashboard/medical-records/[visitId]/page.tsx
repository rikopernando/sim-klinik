"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Lock, Save, FileText, Stethoscope, Pill, ClipboardList } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { getMedicalRecordByVisit, createMedicalRecord, updateMedicalRecord, lockMedicalRecord } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { type MedicalRecordData } from "@/types/medical-record";

import { SoapForm } from "@/components/medical-records/soap-form";
import { DiagnosisTab } from "@/components/medical-records/diagnosis-tab";
import { PrescriptionTab } from "@/components/medical-records/prescription-tab";
import { ProcedureTab } from "@/components/medical-records/procedure-tab";

export default function MedicalRecordPage() {
    const params = useParams();
    const router = useRouter();
    const visitId = parseInt(params.visitId as string, 10);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordData, setRecordData] = useState<MedicalRecordData | null>(null);
    const [activeTab, setActiveTab] = useState("soap");

    useEffect(() => {
        loadMedicalRecord();
    }, [visitId]);

    const loadMedicalRecord = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getMedicalRecordByVisit(visitId);
            setRecordData(data);
        } catch (err) {
            // If medical record doesn't exist, create a new one
            if (err instanceof Error && err.message.includes("404")) {
                try {
                    await createMedicalRecord({
                        visitId,
                        isDraft: true,
                    });
                    // Reload after creation
                    const data = await getMedicalRecordByVisit(visitId);
                    setRecordData(data);
                } catch (createErr) {
                    setError(getErrorMessage(createErr));
                }
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!recordData) return;

        try {
            setIsSaving(true);
            setError(null);

            await updateMedicalRecord(recordData.medicalRecord.id, {
                isDraft: true,
            });

            // Reload to get updated data
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleLock = async () => {
        if (!recordData) return;

        const confirmed = window.confirm(
            "Anda yakin ingin mengunci rekam medis ini? Setelah dikunci, data tidak dapat diubah lagi."
        );

        if (!confirmed) return;

        try {
            setIsLocking(true);
            setError(null);

            // User ID will be retrieved from session in the API
            await lockMedicalRecord(recordData.medicalRecord.id, recordData.medicalRecord.doctorId);

            // Reload to get updated data
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLocking(false);
        }
    };

    const handleUpdateRecord = (updates: Partial<MedicalRecordData["medicalRecord"]>) => {
        if (!recordData) return;

        setRecordData({
            ...recordData,
            medicalRecord: {
                ...recordData.medicalRecord,
                ...updates,
            },
        });
    };

    const handleSaveSOAP = async (soapData: {
        soapSubjective?: string;
        soapObjective?: string;
        soapAssessment?: string;
        soapPlan?: string;
    }) => {
        if (!recordData) return;

        try {
            setError(null);
            await updateMedicalRecord(recordData.medicalRecord.id, soapData);
            await loadMedicalRecord();
        } catch (err) {
            setError(getErrorMessage(err));
            throw err;
        }
    };

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

    if (!recordData) {
        return null;
    }

    const isLocked = recordData.medicalRecord.isLocked;
    const isDraft = recordData.medicalRecord.isDraft;

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rekam Medis Elektronik</h1>
                    <p className="text-muted-foreground">
                        Kunjungan #{visitId}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isLocked && (
                        <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Terkunci
                        </Badge>
                    )}
                    {isDraft && !isLocked && (
                        <Badge variant="outline">Draft</Badge>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Catatan Medis</CardTitle>
                            <CardDescription>
                                Dokumentasi pemeriksaan dan tindakan medis
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {!isLocked && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Simpan Draft
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleLock}
                                        disabled={isLocking}
                                    >
                                        {isLocking ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Mengunci...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="mr-2 h-4 w-4" />
                                                Kunci & Selesai
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="soap" className="gap-2">
                                <FileText className="h-4 w-4" />
                                SOAP
                            </TabsTrigger>
                            <TabsTrigger value="diagnosis" className="gap-2">
                                <Stethoscope className="h-4 w-4" />
                                Diagnosis
                            </TabsTrigger>
                            <TabsTrigger value="prescription" className="gap-2">
                                <Pill className="h-4 w-4" />
                                Resep
                            </TabsTrigger>
                            <TabsTrigger value="procedure" className="gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Tindakan
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="soap" className="mt-6">
                            <SoapForm
                                medicalRecord={recordData.medicalRecord}
                                onUpdate={handleUpdateRecord}
                                onSave={handleSaveSOAP}
                                isLocked={isLocked}
                            />
                        </TabsContent>

                        <TabsContent value="diagnosis" className="mt-6">
                            <DiagnosisTab
                                medicalRecordId={recordData.medicalRecord.id}
                                diagnoses={recordData.diagnoses}
                                onUpdate={loadMedicalRecord}
                                isLocked={isLocked}
                            />
                        </TabsContent>

                        <TabsContent value="prescription" className="mt-6">
                            <PrescriptionTab
                                medicalRecordId={recordData.medicalRecord.id}
                                prescriptions={recordData.prescriptions}
                                onUpdate={loadMedicalRecord}
                                isLocked={isLocked}
                            />
                        </TabsContent>

                        <TabsContent value="procedure" className="mt-6">
                            <ProcedureTab
                                medicalRecordId={recordData.medicalRecord.id}
                                procedures={recordData.procedures}
                                onUpdate={loadMedicalRecord}
                                isLocked={isLocked}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
