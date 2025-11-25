/**
 * Pharmacy Stats Cards Component
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpiringDrugsData {
    expired: unknown[];
    expiringSoon: unknown[];
    warning: unknown[];
    all: unknown[];
}

interface PharmacyStatsCardsProps {
    queueCount: number;
    expiringDrugs: ExpiringDrugsData;
}

export function PharmacyStatsCards({
    queueCount,
    expiringDrugs,
}: PharmacyStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Resep Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{queueCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Menunggu proses
                    </p>
                </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Kadaluarsa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700">
                        {expiringDrugs.expired.length}
                    </div>
                    <p className="text-xs text-red-600">
                        Sudah kadaluarsa
                    </p>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Segera Kadaluarsa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-700">
                        {expiringDrugs.expiringSoon.length}
                    </div>
                    <p className="text-xs text-orange-600">
                        &lt; 30 hari
                    </p>
                </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Perhatian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-700">
                        {expiringDrugs.warning.length}
                    </div>
                    <p className="text-xs text-yellow-600">
                        30-90 hari
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
