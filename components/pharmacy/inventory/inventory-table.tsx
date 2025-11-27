/**
 * Inventory Table Component
 * Displays drug inventory in table format
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service";

interface InventoryTableProps {
    inventories: DrugInventoryWithDetails[];
    isLoading: boolean;
    error: string | null;
}

const LoadingState = () => (
    <div className="text-center py-8 text-muted-foreground">Loading...</div>
);

const ErrorState = ({ error }: { error: string }) => (
    <div className="text-center py-8 text-red-600">Error: {error}</div>
);

const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
        Belum ada stok obat. Tambahkan stok baru.
    </div>
);

const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
        return <Badge variant="destructive">Habis</Badge>;
    }
    if (quantity < 10) {
        return (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                Rendah
            </Badge>
        );
    }
    return <Badge variant="outline">Tersedia</Badge>
};

const getExpiryBadge = (level: string) => {
    const colors = getExpiryAlertColor(level);
    const labels = {
        expired: "Kadaluarsa",
        expiring_soon: "Segera Kadaluarsa",
        warning: "Perhatian",
        ok: "Aman",
    };

    return (
        <Badge className={colors.badge}>
            {labels[level as keyof typeof labels] || "Aman"}
        </Badge>
    );
};

export function InventoryTable({
    inventories,
    isLoading,
    error,
}: InventoryTableProps) {
    // Memoize table rows to prevent unnecessary re-renders
    const tableRows = useMemo(() => {
        return inventories.map((inventory) => {
            const expiryColors = getExpiryAlertColor(inventory.expiryAlertLevel);
            return (
                <TableRow key={inventory.id}>
                    <TableCell className="font-medium">{inventory.drug.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                        {inventory.drug.genericName || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                        {inventory.batchNumber}
                    </TableCell>
                    <TableCell>
                        <span className="font-semibold">{inventory.stockQuantity}</span>{" "}
                        {inventory.drug.unit}
                    </TableCell>
                    <TableCell>
                        <span className={expiryColors.text}>
                            {formatExpiryDate(inventory.expiryDate, inventory.daysUntilExpiry)}
                        </span>
                    </TableCell>
                    <TableCell>{getStockBadge(inventory.stockQuantity)}</TableCell>
                    <TableCell>{getExpiryBadge(inventory.expiryAlertLevel)}</TableCell>
                    <TableCell>{inventory.supplier || "-"}</TableCell>
                </TableRow>
            );
        });
    }, [inventories]);

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (inventories.length === 0) return <EmptyState />;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="w-full overflow-x-auto">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Nama Obat</TableHead>
                                    <TableHead className="min-w-[150px]">Nama Generik</TableHead>
                                    <TableHead className="min-w-[120px]">Batch Number</TableHead>
                                    <TableHead className="min-w-[100px]">Stok</TableHead>
                                    <TableHead className="min-w-[150px]">
                                        Tanggal Kadaluarsa
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">Status Stok</TableHead>
                                    <TableHead className="min-w-[150px]">
                                        Status Kadaluarsa
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">Supplier</TableHead>
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
