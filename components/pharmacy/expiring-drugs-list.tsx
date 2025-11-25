/**
 * Expiring Drugs List Component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatExpiryDate, getExpiryAlertColor } from "@/lib/pharmacy/stock-utils";

interface Drug {
    name: string;
    unit: string;
}

interface ExpiringDrug {
    id: number;
    batchNumber: string;
    expiryDate: Date;
    stockQuantity: number;
    supplier?: string | null;
    expiryAlertLevel: "expired" | "expiring_soon" | "warning";
    daysUntilExpiry: number;
    drug: Drug;
}

interface ExpiringDrugsListProps {
    drugs: ExpiringDrug[];
    isLoading: boolean;
    error: string | null;
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
            Tidak ada obat yang mendekati kadaluarsa
        </CardContent>
    </Card>
);

const ExpiryBadge = ({ level }: { level: string }) => {
    const labels = {
        expired: "Kadaluarsa",
        expiring_soon: "Segera Kadaluarsa",
        warning: "Perhatian",
    };

    return <Badge className={getExpiryAlertColor(level).badge}>{labels[level as keyof typeof labels]}</Badge>;
};

export function ExpiringDrugsList({
    drugs,
    isLoading,
    error,
}: ExpiringDrugsListProps) {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (drugs.length === 0) return <EmptyState />;

    return (
        <div className="grid gap-4">
            {drugs.map((inventory) => {
                const colors = getExpiryAlertColor(inventory.expiryAlertLevel);
                return (
                    <Card
                        key={inventory.id}
                        className={`border-2 ${colors.border} ${colors.bg}`}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">
                                        {inventory.drug.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Batch: {inventory.batchNumber}
                                    </CardDescription>
                                </div>
                                <ExpiryBadge level={inventory.expiryAlertLevel} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Tanggal Kadaluarsa
                                    </p>
                                    <p className={`font-medium ${colors.text}`}>
                                        {formatExpiryDate(
                                            inventory.expiryDate,
                                            inventory.daysUntilExpiry
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Stok</p>
                                    <p className="font-medium">
                                        {inventory.stockQuantity} {inventory.drug.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Supplier</p>
                                    <p className="font-medium">
                                        {inventory.supplier || "-"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
