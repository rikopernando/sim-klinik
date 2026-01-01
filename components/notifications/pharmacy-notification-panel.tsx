"use client"

import {
  usePharmacyNotifications,
  PrescriptionNotification,
  Notification,
} from "@/lib/notifications/use-pharmacy-notifications"
import { useEffect } from "react"
import { Bell, BellRing, CheckCircle, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function PharmacyNotificationPanel() {
  const {
    notifications,
    isConnected,
    error,
    requestNotificationPermission,
    clearNotifications,
    removeNotification,
  } = usePharmacyNotifications()

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_prescription":
        return <BellRing className="h-5 w-5 text-blue-500" />
      case "prescription_fulfilled":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "low_stock_alert":
      case "expiring_drug_alert":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "new_prescription":
        return "New Prescription"
      case "prescription_fulfilled":
        return "Prescription Fulfilled"
      case "low_stock_alert":
        return "Low Stock Alert"
      case "expiring_drug_alert":
        return "Expiring Drug Alert"
      default:
        return "Notification"
    }
  }

  const renderNotificationContent = (notification: Notification) => {
    if (notification.type === "new_prescription") {
      const data = notification.data as PrescriptionNotification
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium">{data.patientName}</p>
          <p className="text-muted-foreground text-sm">
            MR: {data.patientMRNumber} | Visit: {data.visitNumber}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{data.drugName}</Badge>
            <span className="text-muted-foreground text-xs">
              {data.dosage} • {data.frequency}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">Qty: {data.quantity}</p>
        </div>
      )
    }

    return <p className="text-muted-foreground text-sm">{JSON.stringify(notification.data)}</p>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Pharmacy Notifications</CardTitle>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="text-green-600">
                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-green-600"></span>
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-600"></span>
                Disconnected
              </Badge>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearNotifications}>
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
          <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-muted-foreground text-sm">No new notifications</p>
            <p className="text-muted-foreground mt-1 text-xs">
              You&apos;ll see new prescriptions here in real-time
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-muted/50 hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors"
                >
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {getNotificationTitle(notification.type)}
                      </p>
                      <span className="text-muted-foreground text-xs">
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
  )
}
