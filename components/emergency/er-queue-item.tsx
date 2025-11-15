/**
 * ER Queue Item Component
 * Individual patient card in the ER queue
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ERQueueItem } from "@/types/emergency";
import { getTriageBadgeColor, getTriageLabel, getTriageCardClasses } from "@/lib/emergency/triage-utils";

interface ERQueueItemProps {
    item: ERQueueItem;
    index: number;
    onStartExamination?: (visitId: number) => void;
}

export function ERQueueItemCard({ item, index, onStartExamination }: ERQueueItemProps) {
    return (
        <Card className={`transition-all hover:shadow-md ${getTriageCardClasses(item.visit.triageStatus)}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            {/* Queue Number */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                {index + 1}
                            </div>

                            {/* Patient Info */}
                            <div>
                                <CardTitle className="text-xl">{item.patient.name}</CardTitle>
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    <span>MR: {item.patient.mrNumber}</span>
                                    {item.patient.nik && <span>• NIK: {item.patient.nik}</span>}
                                    {item.patient.gender && (
                                        <span>
                                            • {item.patient.gender === "male" ? "Laki-laki" : "Perempuan"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Triage Badge */}
                    <Badge className={getTriageBadgeColor(item.visit.triageStatus)}>
                        {getTriageLabel(item.visit.triageStatus)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {/* Chief Complaint */}
                    {item.visit.chiefComplaint && (
                        <div className="flex gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Keluhan Utama:</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.visit.chiefComplaint}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer: Arrival Time & Action */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                Tiba:{" "}
                                {formatDistanceToNow(new Date(item.visit.arrivalTime), {
                                    addSuffix: true,
                                    locale: idLocale,
                                })}
                            </span>
                        </div>

                        {onStartExamination && (
                            <Button
                                size="sm"
                                onClick={() => onStartExamination(item.visit.id)}
                            >
                                <User className="h-4 w-4 mr-2" />
                                Mulai Pemeriksaan
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
