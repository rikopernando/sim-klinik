/**
 * Patients Table Row Component
 * Displays a single patient record in the table
 */

import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { getGenderLabel } from "@/lib/utils/patient";
import { formatDateShort } from "@/lib/utils/date";

interface Patient {
    id: number;
    mrNumber: string;
    nik: string | null;
    name: string;
    gender: string | null;
    dateOfBirth: string | null;
    phone: string | null;
    insuranceType: string | null;
}

interface PatientsTableRowProps {
    patient: Patient;
    onEdit: (patientId: number) => void;
}

export function PatientsTableRow({ patient, onEdit }: PatientsTableRowProps) {
    return (
        <TableRow>
            <TableCell className="font-medium">{patient.mrNumber}</TableCell>
            <TableCell>{patient.nik || "-"}</TableCell>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{getGenderLabel(patient.gender)}</TableCell>
            <TableCell>{formatDateShort(patient.dateOfBirth)}</TableCell>
            <TableCell>{patient.phone || "-"}</TableCell>
            <TableCell>
                {patient.insuranceType ? (
                    <Badge variant="outline">{patient.insuranceType}</Badge>
                ) : (
                    "-"
                )}
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(patient.id)}
                    className="gap-1"
                >
                    <Edit className="h-3 w-3" />
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}
