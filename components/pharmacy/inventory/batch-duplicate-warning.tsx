/**
 * Batch Duplicate Warning Component
 * Displays warning when batch number already exists
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { DuplicateBatchCheck } from "@/lib/services/inventory.service";

interface BatchDuplicateWarningProps {
    duplicateCheck: DuplicateBatchCheck;
}

export function BatchDuplicateWarning({ duplicateCheck }: BatchDuplicateWarningProps) {
    if (!duplicateCheck.exists || !duplicateCheck.batch) {
        return null;
    }

    const { batch } = duplicateCheck;

    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                <p className="font-medium">Batch sudah ada!</p>
                <p className="text-sm mt-1">
                    Batch <strong>{batch.batchNumber}</strong> untuk obat ini sudah ada
                    dengan stok{" "}
                    <strong>
                        {batch.stockQuantity} {batch.drug.unit}
                    </strong>
                    .
                </p>
                <p className="text-xs mt-2">
                    Jika ini adalah penambahan stok untuk batch yang sama, pastikan nomor
                    batch benar. Atau gunakan nomor batch berbeda jika ini batch baru.
                </p>
            </AlertDescription>
        </Alert>
    );
}
