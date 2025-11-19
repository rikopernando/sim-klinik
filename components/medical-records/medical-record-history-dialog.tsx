"use client";

/**
 * Medical Record History Dialog Component (D.6)
 * Displays patient's previous medical records in a popup
 */

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Calendar, FileText, Pill, Activity, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface MedicalRecordHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: number;
    patientName?: string;
}

export function MedicalRecordHistoryDialog({
    open,
    onOpenChange,
    patientId,
    patientName,
}: MedicalRecordHistoryDialogProps) {
    const [history, setHistory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && patientId) {
            fetchHistory();
        }
    }, [open, patientId]);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/medical-records/history?patientId=${patientId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal memuat riwayat rekam medis");
            }

            setHistory(data.data);
        } catch (err) {
            console.error("Fetch history error:", err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string | Date) => {
        try {
            return format(new Date(date), "dd MMMM yyyy, HH:mm", { locale: idLocale });
        } catch {
            return "N/A";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Riwayat Rekam Medis
                    </DialogTitle>
                    <DialogDescription>
                        {history?.patient?.name || patientName || "Pasien"}
                        {history?.patient?.mrNumber && ` - MR: ${history.patient.mrNumber}`}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Memuat riwayat...</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-md">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {!isLoading && !error && history && (
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                            {/* Patient Allergies */}
                            {history.patient?.allergies && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Alergi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-yellow-900">{history.patient.allergies}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Medical Records */}
                            {history.history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada riwayat rekam medis untuk pasien ini
                                    </p>
                                </div>
                            ) : (
                                history.history.map((record: any, index: number) => (
                                    <Card key={record.medicalRecord.id} className="border-2">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        Kunjungan #{history.history.length - index}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(record.medicalRecord.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <Badge variant="outline">
                                                        {record.visit.visitNumber}
                                                    </Badge>
                                                    {record.medicalRecord.isLocked && (
                                                        <Badge variant="secondary">Terkunci</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Tabs defaultValue="soap" className="w-full">
                                                <TabsList className="grid w-full grid-cols-4">
                                                    <TabsTrigger value="soap">SOAP</TabsTrigger>
                                                    <TabsTrigger value="diagnosis">
                                                        Diagnosis ({record.diagnoses.length})
                                                    </TabsTrigger>
                                                    <TabsTrigger value="procedures">
                                                        Tindakan ({record.procedures.length})
                                                    </TabsTrigger>
                                                    <TabsTrigger value="prescriptions">
                                                        Resep ({record.prescriptions.length})
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* SOAP Tab */}
                                                <TabsContent value="soap" className="space-y-3 mt-3">
                                                    {record.medicalRecord.soapSubjective && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Subjective (S)</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecord.soapSubjective}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {record.medicalRecord.soapObjective && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Objective (O)</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecord.soapObjective}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {record.medicalRecord.soapAssessment && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Assessment (A)</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecord.soapAssessment}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {record.medicalRecord.soapPlan && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Plan (P)</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {record.medicalRecord.soapPlan}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!record.medicalRecord.soapSubjective &&
                                                        !record.medicalRecord.soapObjective &&
                                                        !record.medicalRecord.soapAssessment &&
                                                        !record.medicalRecord.soapPlan && (
                                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                                Tidak ada catatan SOAP
                                                            </p>
                                                        )}
                                                </TabsContent>

                                                {/* Diagnosis Tab */}
                                                <TabsContent value="diagnosis" className="mt-3">
                                                    {record.diagnoses.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            Tidak ada diagnosis
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {record.diagnoses.map((diagnosis: any) => (
                                                                <div
                                                                    key={diagnosis.id}
                                                                    className="p-2 bg-muted rounded-md"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-medium">
                                                                            {diagnosis.description}
                                                                        </p>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {diagnosis.icd10Code}
                                                                        </Badge>
                                                                    </div>
                                                                    {diagnosis.isPrimary && (
                                                                        <Badge variant="secondary" className="text-xs mt-1">
                                                                            Diagnosis Utama
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                {/* Procedures Tab */}
                                                <TabsContent value="procedures" className="mt-3">
                                                    {record.procedures.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            Tidak ada tindakan
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {record.procedures.map((procedure: any) => (
                                                                <div
                                                                    key={procedure.id}
                                                                    className="p-2 bg-muted rounded-md"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-medium">
                                                                            {procedure.description}
                                                                        </p>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {procedure.icd9Code}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                {/* Prescriptions Tab */}
                                                <TabsContent value="prescriptions" className="mt-3">
                                                    {record.prescriptions.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            Tidak ada resep
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {record.prescriptions.map((item: any) => (
                                                                <div
                                                                    key={item.prescription.id}
                                                                    className="p-2 bg-muted rounded-md"
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {item.drug?.name || "Obat tidak diketahui"}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {item.prescription.dosage} •{" "}
                                                                                {item.prescription.frequency}
                                                                                {item.prescription.duration && ` • ${item.prescription.duration}`}
                                                                            </p>
                                                                            {item.prescription.instructions && (
                                                                                <p className="text-xs text-muted-foreground italic mt-1">
                                                                                    {item.prescription.instructions}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <Badge
                                                                            variant={
                                                                                item.prescription.isFulfilled
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                            className="text-xs"
                                                                        >
                                                                            {item.prescription.isFulfilled
                                                                                ? "Terpenuhi"
                                                                                : "Pending"}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
