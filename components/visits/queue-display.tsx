"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueItem {
    visit: {
        id: number;
        visitNumber: string;
        queueNumber: string | null;
        visitType: string;
        status: string;
        arrivalTime: string;
        triageStatus: string | null;
    };
    patient: {
        id: number;
        mrNumber: string;
        name: string;
        gender: string | null;
        dateOfBirth: string | null;
    };
}

interface QueueDisplayProps {
    poliId?: number;
    visitType?: "outpatient" | "inpatient" | "emergency";
    autoRefresh?: boolean;
    refreshInterval?: number; // milliseconds
}

export function QueueDisplay({
    poliId,
    visitType = "outpatient",
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
}: QueueDisplayProps) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchQueue = async () => {
        try {
            const params = new URLSearchParams({
                status: "pending",
                visitType,
            });

            if (poliId) {
                params.append("poliId", poliId.toString());
            }

            const response = await fetch(`/api/visits?${params.toString()}`);

            if (!response.ok) {
                throw new Error("Failed to fetch queue");
            }

            const data = await response.json();
            setQueue(data.data || []);
            setLastUpdate(new Date());
            setError(null);
        } catch (err) {
            setError("Gagal memuat antrian. Silakan refresh.");
            console.error("Queue fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();

        if (autoRefresh) {
            const interval = setInterval(fetchQueue, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [poliId, visitType, autoRefresh, refreshInterval]);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTriageBadge = (status: string | null) => {
        if (!status) return null;

        const colors = {
            red: "bg-red-500 hover:bg-red-600",
            yellow: "bg-yellow-500 hover:bg-yellow-600",
            green: "bg-green-500 hover:bg-green-600",
        };

        const labels = {
            red: "Merah",
            yellow: "Kuning",
            green: "Hijau",
        };

        return (
            <Badge className={colors[status as keyof typeof colors]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "secondary" | "default" | "outline"; label: string }> = {
            pending: { variant: "secondary", label: "Menunggu" },
            in_progress: { variant: "default", label: "Dalam Proses" },
            completed: { variant: "outline", label: "Selesai" },
        };

        const config = variants[status] || variants.pending;

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Antrian Pasien</h3>
                    <p className="text-sm text-muted-foreground">
                        Terakhir diperbarui: {lastUpdate.toLocaleTimeString("id-ID")}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQueue}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Refresh</span>
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && queue.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && queue.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <User className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium">Tidak ada pasien dalam antrian</p>
                        <p className="text-sm text-muted-foreground">
                            Antrian kosong untuk saat ini
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Queue List */}
            {!isLoading && queue.length > 0 && (
                <div className="space-y-2">
                    <div className="rounded-md bg-muted/50 px-4 py-2 text-sm font-medium">
                        Total Antrian: {queue.length} pasien
                    </div>

                    {queue.map((item, index) => (
                        <Card
                            key={item.visit.id}
                            className={cn(
                                "transition-all hover:shadow-md py-0",
                                index === 0 && "border-primary ring-2 ring-primary/20"
                            )}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        {/* Queue Number */}
                                        {item.visit.queueNumber && (
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                                                {item.visit.queueNumber}
                                            </div>
                                        )}

                                        {/* Patient Info */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">
                                                    {item.patient.name}
                                                </h4>
                                                {item.patient.gender && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.patient.gender === "male" ? "L" : "P"}
                                                    </Badge>
                                                )}
                                                {visitType === "emergency" &&
                                                    getTriageBadge(item.visit.triageStatus)}
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                <div>No. RM: {item.patient.mrNumber}</div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Kedatangan: {formatTime(item.visit.arrivalTime)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(item.visit.status)}
                                        {index === 0 && (
                                            <Badge className="bg-blue-500">Sekarang</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
