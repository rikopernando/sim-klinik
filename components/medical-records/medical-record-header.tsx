/**
 * Medical Record Header Component
 * Displays title, visit information, and status badges
 */

import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedicalRecordHeaderProps {
    visitId: number;
    isLocked: boolean;
    isDraft: boolean;
}

export function MedicalRecordHeader({ visitId, isLocked, isDraft }: MedicalRecordHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rekam Medis Elektronik</h1>
                <p className="text-muted-foreground">
                    Kunjungan #{visitId}
                </p>
            </div>
            <div className="flex gap-2">
                {isLocked && (
                    <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Terkunci
                    </Badge>
                )}
                {isDraft && !isLocked && (
                    <Badge variant="outline">Draft</Badge>
                )}
            </div>
        </div>
    );
}
