"use client"

/**
 * Compact Pharmacy Notification Popover
 * Shows real-time prescription notifications in a space-efficient popover
 */

import { useEffect } from "react"
import { Bell, BellRing, CheckCircle, X, AlertCircle } from "lucide-react"
import {
  usePharmacyNotifications,
  PrescriptionNotification,
  Notification,
} from "@/lib/notifications/use-pharmacy-notifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function PharmacyNotificationPopover() {
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
        return <BellRing className="h-4 w-4 text-blue-500" />
      case "prescription_fulfilled":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "low_stock_alert":
      case "expiring_drug_alert":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
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
          <p className="text-muted-foreground text-xs">
            MR: {data.patientMRNumber} | Visit: {data.visitNumber}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.drugName}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {data.dosage} • {data.frequency} • Qty: {data.quantity}
          </p>
        </div>
      )
    }

    return <p className="text-muted-foreground text-sm">{JSON.stringify(notification.data)}</p>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {notifications.length > 9 ? "9+" : notifications.length}
            </Badge>
          )}
          <span className="sr-only">Pharmacy notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-600"></span>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span className="text-xs text-gray-500">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-b bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600" />
              <p className="text-xs text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-10 w-10 text-gray-300" />
            <p className="text-muted-foreground text-sm">No new notifications</p>
            <p className="text-muted-foreground mt-1 text-xs">
              You&apos;ll see new prescriptions here
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="hover:bg-muted/50 flex items-start gap-3 p-3 transition-colors"
                  >
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">
                          {getNotificationTitle(notification.type)}
                        </p>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      {renderNotificationContent(notification)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer with Clear All */}
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={clearNotifications}
              >
                Clear All Notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
