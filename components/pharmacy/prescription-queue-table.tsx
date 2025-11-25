/**
 * Prescription Queue Table Component
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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

interface PrescriptionQueueTableProps {
    queue: QueueItem[];
    isLoading: boolean;
    error: string | null;
    onProcess: (item: QueueItem) => void;
}

const LoadingState = () => (
    <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
            Loading...
        </CardContent>
    </Card>
);

const ErrorState = ({ error }: { error: string }) => (
    <Card>
        <CardContent className="p-8 text-center text-red-600">
            Error: {error}
        </CardContent>
    </Card>
);

const EmptyState = () => (
    <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
            Tidak ada resep yang menunggu
        </CardContent>
    </Card>
);

export function PrescriptionQueueTable({
    queue,
    isLoading,
    error,
    onProcess,
}: PrescriptionQueueTableProps) {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (queue.length === 0) return <EmptyState />;

    return (
        <Card className="p-4">
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Obat</TableHead>
                                <TableHead>Dosis</TableHead>
                                <TableHead>Frekuensi</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {queue.map((item, index) => (
                                <TableRow key={item.prescription.id}>
                                    <TableCell className="font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {item.patient?.name || "N/A"}
                                            </p>
                                        </div>
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
                                    <TableCell>{item.prescription.dosage}</TableCell>
                                    <TableCell>{item.prescription.frequency}</TableCell>
                                    <TableCell>
                                        {item.prescription.quantity} {item.drug.unit}
                                    </TableCell>
                                    <TableCell>
                                        {item.prescription.duration || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {item.doctor?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge>Pending</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            onClick={() => onProcess(item)}
                                        >
                                            Proses
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
