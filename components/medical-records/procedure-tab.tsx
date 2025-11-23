"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [procedureToDelete, setProcedureToDelete] = useState<number | null>(null);
    const [procedureToEdit, setProcedureToEdit] = useState<Procedure | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canEdit = useMemo(() => canEditMedicalRecord(isLocked), [isLocked]);

    const handleEdit = useCallback((procedure: Procedure) => {
        setProcedureToEdit(procedure);
        setIsDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        setProcedureToEdit(null);
    }, []);

    const handleDeleteClick = useCallback((id: number) => {
        setProcedureToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!procedureToDelete) return;

        try {
            setError(null);
            await deleteProcedure(procedureToDelete);
            setDeleteDialogOpen(false);
            setProcedureToDelete(null);
            onUpdate();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, [procedureToDelete, onUpdate]);

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
                                onEdit={() => handleEdit(procedure)}
                                onDelete={() => handleDeleteClick(procedure.id)}
                                showEdit={canEdit}
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
                                        {procedure.performedByName && (
                                            <div>
                                                <span className="font-medium">Dilakukan oleh:</span>{" "}
                                                {procedure.performedByName}
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

            {/* Add/Edit Procedure Dialog */}
            <AddProcedureDialog
                open={isDialogOpen}
                onOpenChange={handleCloseDialog}
                medicalRecordId={medicalRecordId}
                onSuccess={onUpdate}
                procedure={procedureToEdit}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tindakan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aksi ini tidak dapat dibatalkan. Tindakan akan dihapus permanen dari rekam medis.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
