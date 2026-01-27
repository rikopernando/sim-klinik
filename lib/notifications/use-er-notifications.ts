"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface ERNewPatientNotification {
  visitId: string
  patientName: string
  patientMRNumber: string
  triageStatus: "red" | "yellow" | "green"
  chiefComplaint: string
  arrivalTime: Date
}

export interface ERStatusChangeNotification {
  visitId: string
  patientName: string
  oldStatus: string
  newStatus: string
}

export interface ERTriageChangeNotification {
  visitId: string
  patientName: string
  oldTriage: "red" | "yellow" | "green" | null
  newTriage: "red" | "yellow" | "green"
}

export type ERNotificationType = "er_new_patient" | "er_status_change" | "er_triage_change"

export interface ERNotification {
  type: ERNotificationType
  data: ERNewPatientNotification | ERStatusChangeNotification | ERTriageChangeNotification
  timestamp: string
  id: string
}

/**
 * Custom React hook for emergency room real-time notifications
 * Uses Server-Sent Events (SSE) to receive notifications from the server
 */
export function useERNotifications(options?: {
  onNewPatient?: (data: ERNewPatientNotification) => void
}) {
  const [notifications, setNotifications] = useState<ERNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const onNewPatientRef = useRef(options?.onNewPatient)

  // Update ref when callback changes
  useEffect(() => {
    onNewPatientRef.current = options?.onNewPatient
  }, [options?.onNewPatient])

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource("/api/notifications/emergency")
    eventSourceRef.current = eventSource

    // Connection opened
    eventSource.onopen = () => {
      console.log("[ER Notifications] SSE connection established")
      setIsConnected(true)
      setError(null)
    }

    // Message received
    eventSource.onmessage = (event) => {
      try {
        const notification: ERNotification = JSON.parse(event.data)

        // Ignore connection establishment messages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (notification.type === ("connection_established" as any)) {
          return
        }

        console.log("[ER Notifications] New notification:", notification)

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev])

        // Call callback for new patient arrivals
        if (notification.type === "er_new_patient" && onNewPatientRef.current) {
          onNewPatientRef.current(notification.data as ERNewPatientNotification)
        }

        // Show browser notification if permission granted
        if (
          notification.type === "er_new_patient" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const data = notification.data as ERNewPatientNotification
          const triageLabel =
            data.triageStatus === "red"
              ? "MERAH - GAWAT"
              : data.triageStatus === "yellow"
                ? "KUNING"
                : "HIJAU"
          new Notification(`Pasien UGD Baru - ${triageLabel}`, {
            body: `${data.patientName} - ${data.chiefComplaint}`,
            icon: "/icon.png",
            tag: `er-patient-${notification.id}`,
          })
        }
      } catch (err) {
        console.error("[ER Notifications] Failed to parse notification:", err)
      }
    }

    // Error occurred
    eventSource.onerror = (err) => {
      console.error("[ER Notifications] SSE connection error:", err)
      setIsConnected(false)
      setError("Connection lost. Attempting to reconnect...")

      // EventSource will automatically attempt to reconnect
    }

    // Cleanup on unmount
    return () => {
      console.log("[ER Notifications] Closing SSE connection")
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [])

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return Notification.permission === "granted"
  }, [])

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  /**
   * Remove a specific notification
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  /**
   * Get latest notification of a specific type
   */
  const getLatestByType = useCallback(
    (type: ERNotificationType) => {
      return notifications.find((n) => n.type === type)
    },
    [notifications]
  )

  return {
    notifications,
    isConnected,
    error,
    requestNotificationPermission,
    clearNotifications,
    removeNotification,
    getLatestByType,
  }
}
