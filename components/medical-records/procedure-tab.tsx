"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { deleteProcedure } from "@/lib/services/medical-record.service";
import { getErrorMessage } from "@/lib/utils/error";
import { formatDate } from "@/lib/utils/date";
import { type Procedure } from "@/types/medical-record";
import { canEditMedicalRecord } from "@/lib/utils/medical-record";

import { SectionCard } from "./section-card";
import { ListItem } from "./list-item";
import { EmptyState } from "./empty-state";
import { AddProcedureDialog } from "./add-procedure-dialog";

interface ProcedureTabProps {
    medicalRecordId: number;
    procedures: Procedure[];
    onUpdate: () => void;
    isLocked: boolean;
}

export function ProcedureTab({ medicalRecordId, procedures, onUpdate, isLocked }: ProcedureTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked]);

    const handleDelete = useCallback(async (id: number) => {
        const confirmed = window.confirm("Hapus tindakan ini?");
        if (!confirmed) return;

        try {
            setError(null);
            await deleteProcedure(id);
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
                     Tambah Tindakan
                </Button>
            )}

            {/* Existing Procedures */}
            {procedures.length > 0 && (
                <SectionCard
                    title="Daftar Tindakan"
                    description="Tindakan medis yang telah dilakukan pada pasien ini"
                >
                    <div className="space-y-3">
                        {procedures.map((procedure) => (
                            <ListItem
                                key={procedure.id}
                                onDelete={() => handleDelete(procedure.id)}
                                showDelete={canEdit}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium">
                                            {procedure.icd9Code}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium">{procedure.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        {procedure.performedBy && (
                                            <div>
                                                <span className="font-medium">Dilakukan oleh:</span>{" "}
                                                {procedure.performedBy}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Waktu:</span>{" "}
                                            {formatDate(procedure.performedAt)}
                                        </div>
                                    </div>
                                    {procedure.notes && (
                                        <p className="text-sm italic text-muted-foreground">
                                            {procedure.notes}
                                        </p>
                                    )}
                                </div>
                            </ListItem>
                        ))}
                    </div>
                </SectionCard>
            )}

            {procedures.length === 0 && (
                <EmptyState message="Belum ada tindakan yang ditambahkan" />
            )}

            {/* Add Procedure Dialog */}
            <AddProcedureDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                medicalRecordId={medicalRecordId}
                onSuccess={onUpdate}
            />
        </div>
    );
}
