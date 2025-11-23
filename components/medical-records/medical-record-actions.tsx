/**
 * Medical Record Actions Component
 * Displays action buttons (Save Draft, Lock & Finish) with loading states
 */

import { useState } from "react";
import { Loader2, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MedicalRecordActionsProps {
    isLocked: boolean;
    isSaving: boolean;
    isLocking: boolean;
    onSave: () => Promise<void>;
    onLock: () => Promise<void>;
}

export function MedicalRecordActions({
    isLocked,
    isSaving,
    isLocking,
    onSave,
    onLock,
}: MedicalRecordActionsProps) {
    const [lockDialogOpen, setLockDialogOpen] = useState(false);

    const handleLockConfirm = async () => {
        setLockDialogOpen(false);
        await onLock();
    };

    if (isLocked) {
        return null;
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={onSave}
                    disabled={isSaving || isLocking}
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
                    onClick={() => setLockDialogOpen(true)}
                    disabled={isSaving || isLocking}
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
            </div>

            {/* Lock Confirmation Dialog */}
            <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kunci Rekam Medis?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda yakin ingin mengunci rekam medis ini? Setelah dikunci, data tidak dapat diubah lagi.
                            Pastikan semua informasi sudah lengkap dan benar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLockConfirm}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Ya, Kunci Rekam Medis
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
