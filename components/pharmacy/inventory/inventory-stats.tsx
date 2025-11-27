/**
 * Inventory Statistics Cards Component
 */

import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface InventoryStatsProps {
    totalBatches: number;
    expiredCount: number;
    expiringSoonCount: number;
    lowStockCount: number;
}

export function InventoryStats({
    totalBatches,
    expiredCount,
    expiringSoonCount,
    lowStockCount,
}: InventoryStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Batch</p>
                            <p className="text-2xl font-bold">{totalBatches}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                    <div>
                        <p className="text-sm text-red-600">Kadaluarsa</p>
                        <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                    <div>
                        <p className="text-sm text-orange-600">Segera Kadaluarsa</p>
                        <p className="text-2xl font-bold text-orange-700">{expiringSoonCount}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                    <div>
                        <p className="text-sm text-yellow-600">Stok Rendah</p>
                        <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
