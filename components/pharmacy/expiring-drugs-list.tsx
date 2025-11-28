/**
 * Expiring Drugs List Component (Refactored)
 * Displays list of expiring drugs with optimized rendering
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExpiringDrugCard } from "./expiring/expiring-drug-card";

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

export function ExpiringDrugsList({
    drugs,
    isLoading,
    error,
}: ExpiringDrugsListProps) {
    // Memoize list items to prevent unnecessary re-renders
    const drugCards = useMemo(
        () =>
            drugs.map((inventory) => (
                <ExpiringDrugCard key={inventory.id} inventory={inventory} />
            )),
        [drugs]
    );

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (drugs.length === 0) return <EmptyState />;

    return <div className="grid gap-4">{drugCards}</div>;
}
