/**
 * ER Queue Empty State Component
 * Displayed when there are no patients in the queue
 */

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function ERQueueEmpty() {
    return (
        <Card>
            <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Tidak ada antrian UGD</p>
                    <p className="text-sm text-muted-foreground">
                        Semua pasien telah ditangani atau belum ada pasien baru
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
