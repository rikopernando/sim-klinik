/**
 * Billing Search Component
 * Search billing by visit ID
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BillingSearchProps {
    onSearch: (visitId: number) => void;
    isLoading?: boolean;
}

export function BillingSearch({ onSearch, isLoading = false }: BillingSearchProps) {
    const [visitId, setVisitId] = useState("");

    const handleSearch = () => {
        const id = parseInt(visitId);
        if (!isNaN(id)) {
            onSearch(id);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cari Tagihan</CardTitle>
                <CardDescription>Masukkan Visit ID untuk melihat tagihan</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Masukkan Visit ID"
                            value={visitId}
                            onChange={(e) => setVisitId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            type="number"
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={!visitId || isLoading}>
                        {isLoading ? "Loading..." : "Cari"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
