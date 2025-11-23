"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { deletePrescription } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { type Prescription } from "@/types/medical-record";
import { canEditMedicalRecord, canDeletePrescription } from "@/lib/utils/medical-record";

import { SectionCard } from "./section-card";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";
import { AddPrescriptionDialog } from "./add-prescription-dialog";

interface PrescriptionTabProps {
    medicalRecordId: number;
    prescriptions: Prescription[];
    onUpdate: () => void;
    isLocked: boolean;
}

export function PrescriptionTab({ medicalRecordId, prescriptions, onUpdate, isLocked }: PrescriptionTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked]);

    const handleDelete = useCallback(async (id: number) => {
        const confirmed = window.confirm("Hapus resep ini?");
        if (!confirmed) return;

        try {
            setError(null);
            await deletePrescription(id);
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, [onUpdate]);

    return (
        <div className="space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Add Button */}
            {canEdit && (
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Resep
                </Button>
            )}

            {/* Existing Prescriptions */}
            {prescriptions.length > 0 && (
                <SectionCard
                    title="Daftar Resep"
                    description="Resep obat yang telah diresepkan untuk pasien ini"
                >
                    <div className="space-y-3">
                        {prescriptions.map((prescription) => (
                            <ListItem
                                key={prescription.id}
                                onDelete={() => handleDelete(prescription.id)}
                                showDelete={canDeletePrescription(isLocked, prescription.isFulfilled)}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Drug ID: {prescription.drugId}</span>
                                        {prescription.isFulfilled && (
                                            <Badge variant="secondary">Sudah Diambil</Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-medium">Dosis:</span> {prescription.dosage}
                                        </div>
                                        <div>
                                            <span className="font-medium">Frekuensi:</span> {prescription.frequency}
                                        </div>
                                        {prescription.duration && (
                                            <div>
                                                <span className="font-medium">Durasi:</span> {prescription.duration}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Jumlah:</span> {prescription.quantity}
                                        </div>
                                        {prescription.route && (
                                            <div>
                                                <span className="font-medium">Rute:</span> {prescription.route}
                                            </div>
                                        )}
                                    </div>
                                    {prescription.instructions && (
                                        <p className="text-sm italic">{prescription.instructions}</p>
                                    )}
                                </div>
                            </ListItem>
                        ))}
                    </div>
                </SectionCard>
            )}

            {prescriptions.length === 0 && (
                <EmptyState message="Belum ada resep yang ditambahkan" />
            )}

            {/* Add Prescription Dialog */}
            <AddPrescriptionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                medicalRecordId={medicalRecordId}
                onSuccess={onUpdate}
            />
        </div>
    );
}
