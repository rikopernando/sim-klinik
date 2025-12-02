/**
 * Batch Selector Component
 * Allows selection of drug batch for fulfillment
 */

import { memo } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Package, PlusCircle } from "lucide-react";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service";

interface BatchSelectorProps {
    isLoading: boolean;
    batches: DrugInventoryWithDetails[];
    selectedBatch: DrugInventoryWithDetails | null;
    onBatchSelect: (batch: DrugInventoryWithDetails) => void;
    drugId?: number;
    drugName?: string;
}

const LoadingState = () => (
    <div className="p-4 text-center text-muted-foreground">Loading batches...</div>
);

const EmptyState = ({ drugId, drugName }: { drugId?: number; drugName?: string }) => (
    <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
        <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Tidak ada stok tersedia</p>
                <p className="text-xs text-destructive/80 mt-1">
                    {drugName ? `"${drugName}"` : "Obat ini"} tidak memiliki batch dengan stok yang tersedia.
                </p>
            </div>
        </div>
        {drugId && (
            <div className="mt-3">
                <Link href={`/dashboard/pharmacy/inventory?drugId=${drugId}`} target="_blank">
                    <Button size="sm" variant="outline" className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Tambah Stok Obat Ini
                    </Button>
                </Link>
            </div>
        )}
    </div>
);

const BatchCard = memo(function BatchCard({
    batch,
    isSelected,
    onClick,
}: {
    batch: DrugInventoryWithDetails;
    isSelected: boolean;
    onClick: () => void;
}) {
    const colors = getExpiryAlertColor(batch.expiryAlertLevel);

    return (
        <Card
            className={`cursor-pointer transition-colors ${
                isSelected ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
            }`}
            onClick={onClick}
        >
            <CardContent className="p-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <p className="font-mono text-sm font-medium">{batch.batchNumber}</p>
                            {isSelected && (
                                <Badge variant="default" className="text-xs">
                                    Dipilih
                                </Badge>
                            )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                                Stok:{" "}
                                <span className="font-semibold text-foreground">
                                    {batch.stockQuantity} {batch.drug.unit}
                                </span>
                            </span>
                            <span className={colors.text}>
                                Exp: {formatExpiryDate(batch.expiryDate, batch.daysUntilExpiry)}
                            </span>
                        </div>
                    </div>
                    <Badge className={colors.badge}>
                        {batch.expiryAlertLevel === "expiring_soon"
                            ? "Segera Exp"
                            : batch.expiryAlertLevel === "warning"
                            ? "Perhatian"
                            : "Aman"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
});

export const BatchSelector = memo(function BatchSelector({
    isLoading,
    batches,
    selectedBatch,
    onBatchSelect,
    drugId,
    drugName,
}: BatchSelectorProps) {
    return (
        <div className="space-y-2">
            <Label>
                Pilih Batch <span className="text-destructive">*</span>
            </Label>
            {isLoading ? (
                <LoadingState />
            ) : batches.length === 0 ? (
                <EmptyState drugId={drugId} drugName={drugName} />
            ) : (
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {batches.map((batch) => (
                        <BatchCard
                            key={batch.id}
                            batch={batch}
                            isSelected={selectedBatch?.id === batch.id}
                            onClick={() => onBatchSelect(batch)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
