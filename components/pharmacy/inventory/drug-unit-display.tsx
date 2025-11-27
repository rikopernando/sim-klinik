/**
 * Drug Unit Display Component
 * Shows the unit of measurement for a drug
 */

import { Package } from "lucide-react";

interface DrugUnitDisplayProps {
    unit: string;
}

export function DrugUnitDisplay({ unit }: DrugUnitDisplayProps) {
    if (!unit) return null;

    return (
        <div className="p-3 bg-muted rounded-md flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
                <p className="text-sm text-muted-foreground">Satuan</p>
                <p className="font-medium">{unit}</p>
            </div>
        </div>
    );
}
