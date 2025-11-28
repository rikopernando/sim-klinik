/**
 * Prescription Queue Table Row Component
 * Reusable row for prescription queue table
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { memo } from "react";

interface Drug {
    name: string;
    genericName?: string | null;
    unit: string;
}

interface Patient {
    name: string;
}

interface Doctor {
    name: string;
}

interface Prescription {
    id: number;
    dosage: string;
    frequency: string;
    quantity: number;
    duration?: string | null;
    instructions?: string | null;
}

interface QueueItem {
    prescription: Prescription;
    drug: Drug;
    patient: Patient | null;
    doctor: Doctor | null;
}

interface PrescriptionRowProps {
    item: QueueItem;
    index: number;
    onProcess: (item: QueueItem) => void;
}

export const PrescriptionRow = memo(function PrescriptionRow({
    item,
    index,
    onProcess,
}: PrescriptionRowProps) {
    return (
        <TableRow>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>
                <p className="font-medium whitespace-nowrap">
                    {item.patient?.name || "N/A"}
                </p>
            </TableCell>
            <TableCell>
                <div>
                    <p className="font-medium">{item.drug.name}</p>
                    {item.drug.genericName && (
                        <p className="text-xs text-muted-foreground">
                            {item.drug.genericName}
                        </p>
                    )}
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">{item.prescription.dosage}</TableCell>
            <TableCell className="whitespace-nowrap">{item.prescription.frequency}</TableCell>
            <TableCell className="whitespace-nowrap">
                {item.prescription.quantity} {item.drug.unit}
            </TableCell>
            <TableCell>
                <span className="whitespace-nowrap">{item.doctor?.name || "N/A"}</span>
            </TableCell>
            <TableCell>
                <Badge>Pending</Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button size="sm" onClick={() => onProcess(item)}>
                    Proses
                </Button>
            </TableCell>
        </TableRow>
    );
});
