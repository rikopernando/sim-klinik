/**
 * Drug Info Display Component
 * Displays prescription drug information
 */

import { memo } from "react";

interface DrugInfoDisplayProps {
    drugName: string;
    genericName?: string | null;
    quantity: number;
    unit: string;
}

export const DrugInfoDisplay = memo(function DrugInfoDisplay({
    drugName,
    genericName,
    quantity,
    unit,
}: DrugInfoDisplayProps) {
    return (
        <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium text-muted-foreground">Obat</p>
            <p className="text-lg font-semibold">{drugName}</p>
            {genericName && <p className="text-sm text-muted-foreground">{genericName}</p>}
            <p className="text-sm mt-1">
                Jumlah resep:{" "}
                <span className="font-semibold">
                    {quantity} {unit}
                </span>
            </p>
        </div>
    );
});
