/**
 * History Prescriptions Tab Component
 * Displays prescriptions list for a medical record
 */

import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Prescription {
    prescription: {
        id: number;
        dosage: string;
        frequency: string;
        duration: string | null;
        instructions: string | null;
        isFulfilled: boolean;
    };
    drug: {
        name: string;
    } | null;
}

interface HistoryPrescriptionsTabProps {
    prescriptions: Prescription[];
}

const PrescriptionItem = ({ item }: { item: Prescription }) => (
    <div className="p-2 bg-muted rounded-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium">
                    {item.drug?.name || "Obat tidak diketahui"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {item.prescription.dosage} • {item.prescription.frequency}
                    {item.prescription.duration && ` • ${item.prescription.duration}`}
                </p>
                {item.prescription.instructions && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                        {item.prescription.instructions}
                    </p>
                )}
            </div>
            <Badge
                variant={item.prescription.isFulfilled ? "default" : "secondary"}
                className="text-xs"
            >
                {item.prescription.isFulfilled ? "Terpenuhi" : "Pending"}
            </Badge>
        </div>
    </div>
);

const EmptyPrescriptions = () => (
    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada resep</p>
);

export function HistoryPrescriptionsTab({ prescriptions }: HistoryPrescriptionsTabProps) {
    return (
        <TabsContent value="prescriptions" className="mt-3">
            {prescriptions.length === 0 ? (
                <EmptyPrescriptions />
            ) : (
                <div className="space-y-2">
                    {prescriptions.map((item) => (
                        <PrescriptionItem key={item.prescription.id} item={item} />
                    ))}
                </div>
            )}
        </TabsContent>
    );
}
