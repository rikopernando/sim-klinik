"use client";

import { usePharmacyNotifications, PrescriptionNotification } from "@/lib/notifications/use-pharmacy-notifications";
import { useEffect } from "react";
import { Bell, BellRing, CheckCircle, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PharmacyNotificationPanel() {
    const {
        notifications,
        isConnected,
        error,
        requestNotificationPermission,
        clearNotifications,
        removeNotification,
    } = usePharmacyNotifications();

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, [requestNotificationPermission]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "new_prescription":
                return <BellRing className="h-5 w-5 text-blue-500" />;
            case "prescription_fulfilled":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "low_stock_alert":
            case "expiring_drug_alert":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationTitle = (type: string) => {
        switch (type) {
            case "new_prescription":
                return "New Prescription";
            case "prescription_fulfilled":
                return "Prescription Fulfilled";
            case "low_stock_alert":
                return "Low Stock Alert";
            case "expiring_drug_alert":
                return "Expiring Drug Alert";
            default:
                return "Notification";
        }
    };

    const renderNotificationContent = (notification: any) => {
        if (notification.type === "new_prescription") {
            const data = notification.data as PrescriptionNotification;
            return (
                <div className="space-y-1">
                    <p className="text-sm font-medium">{data.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                        MR: {data.patientMRNumber} | Visit: {data.visitNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{data.drugName}</Badge>
                        <span className="text-xs text-muted-foreground">
                            {data.dosage} • {data.frequency}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Qty: {data.quantity}
                    </p>
                </div>
            );
        }

        return (
            <p className="text-sm text-muted-foreground">
                {JSON.stringify(notification.data)}
            </p>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                            Pharmacy Notifications
                        </CardTitle>
                        {notifications.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {notifications.length}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <Badge variant="outline" className="text-green-600">
                                <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-gray-600">
                                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-600"></span>
                                Disconnected
                            </Badge>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearNotifications}
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
                <CardDescription>
                    Real-time updates for new prescriptions and pharmacy alerts
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No new notifications
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            You'll see new prescriptions here in real-time
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold">
                                                {getNotificationTitle(notification.type)}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                        </div>
                                        {renderNotificationContent(notification)}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => removeNotification(notification.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
