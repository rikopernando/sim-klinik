"use client";

/**
 * Pharmacy Inventory Management Page
 * Manage drug stock with batch numbers and expiry dates
 */

import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
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
import { Plus, RefreshCw, Package } from "lucide-react";
import { AddInventoryDialog } from "@/components/pharmacy/add-inventory-dialog";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";

export default function InventoryPage() {
    const { inventories, isLoading, error, refresh } = useInventory();
    const [showAddDialog, setShowAddDialog] = useState(false);

    const handleAddSuccess = () => {
        refresh();
    };

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) {
            return <Badge variant="destructive">Habis</Badge>;
        }
        if (quantity < 10) {
            return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Rendah</Badge>;
        }
        return <Badge variant="outline">Tersedia</Badge>;
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Stok Obat</h1>
                    <p className="text-muted-foreground">
                        Kelola inventaris obat dengan batch number dan tanggal kadaluarsa
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={refresh} variant="outline" disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Stok
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Batch</p>
                                <p className="text-2xl font-bold">{inventories.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-red-600">Kadaluarsa</p>
                            <p className="text-2xl font-bold text-red-700">
                                {inventories.filter((i) => i.expiryAlertLevel === "expired").length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-orange-600">Segera Kadaluarsa</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {inventories.filter((i) => i.expiryAlertLevel === "expiring_soon").length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm text-yellow-600">Stok Rendah</p>
                            <p className="text-2xl font-bold text-yellow-700">
                                {inventories.filter((i) => i.stockQuantity < 10 && i.stockQuantity > 0).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">Error: {error}</div>
                    ) : inventories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Belum ada stok obat. Tambahkan stok baru.
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Nama Obat</TableHead>
                                            <TableHead className="min-w-[150px]">Nama Generik</TableHead>
                                            <TableHead className="min-w-[120px]">Batch Number</TableHead>
                                            <TableHead className="min-w-[100px]">Stok</TableHead>
                                            <TableHead className="min-w-[150px]">Tanggal Kadaluarsa</TableHead>
                                            <TableHead className="min-w-[120px]">Status Stok</TableHead>
                                            <TableHead className="min-w-[150px]">Status Kadaluarsa</TableHead>
                                            <TableHead className="min-w-[120px]">Supplier</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventories.map((inventory) => {
                                            const expiryColors = getExpiryAlertColor(inventory.expiryAlertLevel);
                                            return (
                                                <TableRow key={inventory.id}>
                                                    <TableCell className="font-medium">
                                                        {inventory.drug.name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {inventory.drug.genericName || "-"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {inventory.batchNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold">
                                                            {inventory.stockQuantity}
                                                        </span>{" "}
                                                        {inventory.drug.unit}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={expiryColors.text}>
                                                            {formatExpiryDate(
                                                                inventory.expiryDate,
                                                                inventory.daysUntilExpiry
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStockBadge(inventory.stockQuantity)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getExpiryBadge(inventory.expiryAlertLevel)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {inventory.supplier || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Inventory Dialog */}
            <AddInventoryDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={handleAddSuccess}
            />
        </div>
    );
}
