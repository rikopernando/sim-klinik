"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { QuickRegistrationForm } from "@/components/emergency/quick-registration-form";
import { AlertCircle, Clock, User, FileText, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Visit {
    id: number;
    visitNumber: string;
    visitType: string;
    triageStatus: string | null;
    chiefComplaint: string | null;
    status: string;
    arrivalTime: string;
    disposition: string | null;
}

interface Patient {
    id: number;
    name: string;
    mrNumber: string;
    nik: string | null;
    gender: string | null;
}

interface ERQueueItem {
    visit: Visit;
    patient: Patient;
}

export default function EmergencyQueuePage() {
    const [queue, setQueue] = useState<ERQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuickRegister, setShowQuickRegister] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchQueue = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/visits?visitType=emergency&status=pending");
            const data = await response.json();

            if (data.success) {
                setQueue(data.data);
                setLastRefresh(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch ER queue:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchQueue, 30000);

        return () => clearInterval(interval);
    }, []);

    const getTriageBadgeColor = (status: string | null) => {
        switch (status) {
            case "red":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "yellow":
                return "bg-yellow-500 hover:bg-yellow-600 text-white";
            case "green":
                return "bg-green-600 hover:bg-green-700 text-white";
            default:
                return "bg-gray-500 hover:bg-gray-600 text-white";
        }
    };

    const getTriageLabel = (status: string | null) => {
        switch (status) {
            case "red":
                return "🔴 MERAH - Gawat Darurat";
            case "yellow":
                return "🟡 KUNING - Urgent";
            case "green":
                return "🟢 HIJAU - Non-Urgent";
            default:
                return "Belum Triage";
        }
    };

    const getTriagePriority = (status: string | null) => {
        switch (status) {
            case "red":
                return 1;
            case "yellow":
                return 2;
            case "green":
                return 3;
            default:
                return 4;
        }
    };

    // Sort queue by triage priority
    const sortedQueue = [...queue].sort((a, b) => {
        const priorityDiff =
            getTriagePriority(a.visit.triageStatus) -
            getTriagePriority(b.visit.triageStatus);
        if (priorityDiff !== 0) return priorityDiff;

        // If same priority, sort by arrival time (earliest first)
        return (
            new Date(a.visit.arrivalTime).getTime() -
            new Date(b.visit.arrivalTime).getTime()
        );
    });

    const handleQuickRegisterSuccess = () => {
        setShowQuickRegister(false);
        fetchQueue();
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard UGD</h1>
                    <p className="text-muted-foreground">
                        Antrian Unit Gawat Darurat - Real-time
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchQueue} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Pendaftaran Cepat UGD
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Pendaftaran Cepat UGD</DialogTitle>
                            </DialogHeader>
                            <QuickRegistrationForm
                                onSuccess={handleQuickRegisterSuccess}
                                onCancel={() => setShowQuickRegister(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Antrian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{queue.length}</div>
                        <p className="text-xs text-muted-foreground">Pasien menunggu</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">
                            Merah (Gawat Darurat)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">
                            {queue.filter((item) => item.visit.triageStatus === "red").length}
                        </div>
                        <p className="text-xs text-red-600">Prioritas tertinggi</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">
                            Kuning (Urgent)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">
                            {queue.filter((item) => item.visit.triageStatus === "yellow").length}
                        </div>
                        <p className="text-xs text-yellow-600">Prioritas sedang</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">
                            Hijau (Non-Urgent)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            {queue.filter((item) => item.visit.triageStatus === "green").length}
                        </div>
                        <p className="text-xs text-green-600">Prioritas rendah</p>
                    </CardContent>
                </Card>
            </div>

            {/* Last Refresh Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                    Terakhir diperbarui:{" "}
                    {formatDistanceToNow(lastRefresh, { addSuffix: true, locale: idLocale })}
                </span>
            </div>

            {/* Queue List */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                                <p className="text-muted-foreground">Memuat data antrian...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : sortedQueue.length === 0 ? (
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
                ) : (
                    sortedQueue.map((item, index) => (
                        <Card
                            key={item.visit.id}
                            className={`transition-all hover:shadow-md ${
                                item.visit.triageStatus === "red"
                                    ? "border-l-4 border-l-red-600 bg-red-50/50"
                                    : item.visit.triageStatus === "yellow"
                                      ? "border-l-4 border-l-yellow-500 bg-yellow-50/50"
                                      : item.visit.triageStatus === "green"
                                        ? "border-l-4 border-l-green-600 bg-green-50/50"
                                        : ""
                            }`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {item.patient.name}
                                                </CardTitle>
                                                <div className="flex gap-2 text-sm text-muted-foreground">
                                                    <span>MR: {item.patient.mrNumber}</span>
                                                    {item.patient.nik && (
                                                        <span>• NIK: {item.patient.nik}</span>
                                                    )}
                                                    {item.patient.gender && (
                                                        <span>
                                                            •{" "}
                                                            {item.patient.gender === "male"
                                                                ? "Laki-laki"
                                                                : "Perempuan"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={getTriageBadgeColor(item.visit.triageStatus)}>
                                        {getTriageLabel(item.visit.triageStatus)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
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
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Tiba:{" "}
                                                {formatDistanceToNow(
                                                    new Date(item.visit.arrivalTime),
                                                    {
                                                        addSuffix: true,
                                                        locale: idLocale,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                        <Button size="sm">
                                            <User className="h-4 w-4 mr-2" />
                                            Mulai Pemeriksaan
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
