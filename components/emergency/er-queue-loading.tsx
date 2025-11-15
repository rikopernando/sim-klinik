/**
 * ER Queue Loading State Component
 * Displayed while fetching queue data
 */

import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export function ERQueueLoading() {
    return (
        <Card>
            <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Memuat data antrian...</p>
                </div>
            </CardContent>
        </Card>
    );
}
