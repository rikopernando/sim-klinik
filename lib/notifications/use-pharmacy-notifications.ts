"use client"

import { useEffect, useRef, useState } from "react"

export interface PrescriptionNotification {
  prescriptionId: number
  patientName: string
  patientMRNumber: string
  drugName: string
  dosage: string
  frequency: string
  quantity: number
  visitNumber: string
  visitType: string
  createdAt: Date
}

export type NotificationType =
  | "new_prescription"
  | "prescription_updated"
  | "prescription_fulfilled"
  | "low_stock_alert"
  | "expiring_drug_alert"

export interface Notification {
  type: NotificationType
  data: PrescriptionNotification | any
  timestamp: string
  id: string
}

/**
 * Custom React hook for pharmacy real-time notifications
 * Uses Server-Sent Events (SSE) to receive notifications from the server
 */
export function usePharmacyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource("/api/notifications/pharmacy")
    eventSourceRef.current = eventSource

    // Connection opened
    eventSource.onopen = () => {
      console.log("[Pharmacy Notifications] SSE connection established")
      setIsConnected(true)
      setError(null)
    }

    // Message received
    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data)

        // Ignore connection establishment messages
        if (notification.type === ("connection_established" as any)) {
          return
        }

        console.log("[Pharmacy Notifications] New notification:", notification)

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev])

        // Show browser notification if permission granted
        if (
          notification.type === "new_prescription" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const data = notification.data as PrescriptionNotification
          new Notification("New Prescription", {
            body: `${data.patientName} - ${data.drugName}`,
            icon: "/icon.png",
            tag: `prescription-${notification.id}`,
          })
        }
      } catch (err) {
        console.error("[Pharmacy Notifications] Failed to parse notification:", err)
      }
    }

    // Error occurred
    eventSource.onerror = (err) => {
      console.error("[Pharmacy Notifications] SSE connection error:", err)
      setIsConnected(false)
      setError("Connection lost. Attempting to reconnect...")

      // EventSource will automatically attempt to reconnect
    }

    // Cleanup on unmount
    return () => {
      console.log("[Pharmacy Notifications] Closing SSE connection")
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [])

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return Notification.permission === "granted"
  }

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    setNotifications([])
  }

  /**
   * Remove a specific notification
   */
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    isConnected,
    error,
    requestNotificationPermission,
    clearNotifications,
    removeNotification,
  }
}
