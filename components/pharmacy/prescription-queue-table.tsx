/**
 * Prescription Queue Table Component (Refactored)
 * Displays prescription queue grouped by visit with optimized rendering
 */

import { useMemo } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PrescriptionRow } from "./queue/prescription-row";

interface Drug {
    id: number;
    name: string;
    genericName?: string | null;
    unit: string;
    price: string;
}

interface Patient {
    id: number;
    name: string;
    mrNumber: string;
}

interface Doctor {
    id: string;
    name: string;
}

interface Visit {
    id: number;
    visitNumber: string;
}

interface Prescription {
    id: number;
    dosage: string;
    frequency: string;
    quantity: number;
    duration?: string | null;
    instructions?: string | null;
}

interface GroupedQueueItem {
    visit: Visit;
    patient: Patient;
    doctor: Doctor | null;
    prescriptions: Array<{
        prescription: Prescription;
        drug: Drug;
    }>;
}

interface PrescriptionQueueTableProps {
    queue: GroupedQueueItem[];
    isLoading: boolean;
    error: string | null;
    onProcess: (item: GroupedQueueItem) => void;
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
    // Memoize table rows to prevent unnecessary re-renders
    const tableRows = useMemo(
        () =>
            queue.map((item, index) => (
                <PrescriptionRow
                    key={item.visit.id}
                    item={item}
                    index={index}
                    onProcess={onProcess}
                />
            )),
        [queue, onProcess]
    );

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (queue.length === 0) return <EmptyState />;

    return (
        <Card className="p-4">
            <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead className="min-w-[180px]">Pasien / No. Kunjungan</TableHead>
                                    <TableHead className="min-w-[200px]">Resep</TableHead>
                                    <TableHead className="min-w-[150px]">Dokter</TableHead>
                                    <TableHead className="min-w-[120px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>{tableRows}</TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
