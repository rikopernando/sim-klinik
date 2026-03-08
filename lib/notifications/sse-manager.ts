/**
 * Server-Sent Events (SSE) Notification Manager
 * Manages real-time notification connections for pharmacy and other modules
 */

/**
 * Notification Data Types
 */
export interface NewPrescriptionData {
  prescriptionId: string
  patientName: string
  patientMRNumber: string
  drugName: string
  dosage: string | null
  frequency: string
  quantity: number
  visitNumber: string
  visitType: string
  createdAt: Date
}

export interface PrescriptionUpdatedData {
  prescriptionId: string
  patientName: string
  drugName: string
  changes: string[]
}

export interface PrescriptionFulfilledData {
  prescriptionId: string
  patientName: string
  drugName: string
  fulfilledBy: string
  fulfilledAt: Date
}

export interface LowStockAlertData {
  drugId: string
  drugName: string
  currentStock: number
  minimumStock: number
  unit: string
}

export interface ExpiringDrugAlertData {
  drugId: string
  drugName: string
  batchNumber: string
  expiryDate: Date
  daysUntilExpiry: number
  stockQuantity: number
}

// Emergency Room Notification Types
export interface ERNewPatientData {
  visitId: string
  patientName: string
  patientMRNumber: string
  triageStatus: "red" | "yellow" | "green"
  chiefComplaint: string
  arrivalTime: Date
}

export interface ERStatusChangeData {
  visitId: string
  patientName: string
  oldStatus: string
  newStatus: string
}

export interface ERTriageChangeData {
  visitId: string
  patientName: string
  oldTriage: "red" | "yellow" | "green" | null
  newTriage: "red" | "yellow" | "green"
}

/**
 * Discriminated Union for Notification Payloads
 */
export type NotificationPayload =
  | {
      type: "new_prescription"
      data: NewPrescriptionData
      timestamp: string
      id: string
    }
  | {
      type: "prescription_updated"
      data: PrescriptionUpdatedData
      timestamp: string
      id: string
    }
  | {
      type: "prescription_fulfilled"
      data: PrescriptionFulfilledData
      timestamp: string
      id: string
    }
  | {
      type: "low_stock_alert"
      data: LowStockAlertData
      timestamp: string
      id: string
    }
  | {
      type: "expiring_drug_alert"
      data: ExpiringDrugAlertData
      timestamp: string
      id: string
    }
  // Emergency Room notification types
  | {
      type: "er_new_patient"
      data: ERNewPatientData
      timestamp: string
      id: string
    }
  | {
      type: "er_status_change"
      data: ERStatusChangeData
      timestamp: string
      id: string
    }
  | {
      type: "er_triage_change"
      data: ERTriageChangeData
      timestamp: string
      id: string
    }

/**
 * Global SSE connection manager
 * Stores active SSE connections by channel
 */
class SSEManager {
  private connections: Map<string, Set<ReadableStreamDefaultController>> = new Map()

  /**
   * Add a new SSE connection to a channel
   */
  addConnection(channel: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(channel)) {
      this.connections.set(channel, new Set())
    }
    this.connections.get(channel)!.add(controller)

    console.log(
      `[SSE] New connection to channel: ${channel}. Total connections: ${this.connections.get(channel)!.size}`
    )
  }

  /**
   * Remove an SSE connection from a channel
   */
  removeConnection(channel: string, controller: ReadableStreamDefaultController) {
    const channelConnections = this.connections.get(channel)
    if (channelConnections) {
      channelConnections.delete(controller)
      console.log(
        `[SSE] Connection removed from channel: ${channel}. Remaining: ${channelConnections.size}`
      )

      if (channelConnections.size === 0) {
        this.connections.delete(channel)
      }
    }
  }

  /**
   * Broadcast a notification to all connections in a channel
   */
  broadcast(channel: string, payload: NotificationPayload) {
    const channelConnections = this.connections.get(channel)

    if (!channelConnections || channelConnections.size === 0) {
      console.log(`[SSE] No active connections for channel: ${channel}`)
      return
    }

    const message = `data: ${JSON.stringify(payload)}\n\n`
    const encoder = new TextEncoder()
    const data = encoder.encode(message)

    console.log(
      `[SSE] Broadcasting to ${channelConnections.size} connections in channel: ${channel}`
    )

    // Send to all connections, remove any that fail
    const failedConnections: ReadableStreamDefaultController[] = []

    channelConnections.forEach((controller) => {
      try {
        controller.enqueue(data)
      } catch (error) {
        console.error(`[SSE] Failed to send to connection:`, error)
        failedConnections.push(controller)
      }
    })

    // Clean up failed connections
    failedConnections.forEach((controller) => {
      this.removeConnection(channel, controller)
    })
  }

  /**
   * Get the number of active connections for a channel
   */
  getConnectionCount(channel: string): number {
    return this.connections.get(channel)?.size || 0
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.connections.keys())
  }
}

// Global singleton instance
export const sseManager = new SSEManager()

/**
 * Create a new SSE stream
 */
export function createSSEStream(channel: string) {
  return new ReadableStream({
    start(controller) {
      // Add this connection to the manager
      sseManager.addConnection(channel, controller)

      // Send initial connection message
      const encoder = new TextEncoder()
      const connectionMessage = encoder.encode(
        `data: ${JSON.stringify({
          type: "connection_established",
          channel,
          timestamp: new Date().toISOString(),
        })}\n\n`
      )
      controller.enqueue(connectionMessage)

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = encoder.encode(`: heartbeat\n\n`)
          controller.enqueue(heartbeat)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          clearInterval(heartbeatInterval)
          sseManager.removeConnection(channel, controller)
        }
      }, 30000) // Every 30 seconds

      // Clean up on connection close
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        sseManager.removeConnection(channel, controller)
      }

      // Note: In a real-world scenario, you'd need to handle the cleanup
      // when the client disconnects. This is a simplified version.
      return cleanup
    },
    cancel(controller) {
      sseManager.removeConnection(channel, controller)
    },
  })
}

/**
 * Send a notification to a specific channel (type-safe overloads)
 */
export function sendNotification(
  channel: string,
  type: "new_prescription",
  data: NewPrescriptionData
): void
export function sendNotification(
  channel: string,
  type: "prescription_updated",
  data: PrescriptionUpdatedData
): void
export function sendNotification(
  channel: string,
  type: "prescription_fulfilled",
  data: PrescriptionFulfilledData
): void
export function sendNotification(
  channel: string,
  type: "low_stock_alert",
  data: LowStockAlertData
): void
export function sendNotification(
  channel: string,
  type: "expiring_drug_alert",
  data: ExpiringDrugAlertData
): void
// Emergency Room notification overloads
export function sendNotification(
  channel: string,
  type: "er_new_patient",
  data: ERNewPatientData
): void
export function sendNotification(
  channel: string,
  type: "er_status_change",
  data: ERStatusChangeData
): void
export function sendNotification(
  channel: string,
  type: "er_triage_change",
  data: ERTriageChangeData
): void
export function sendNotification(
  channel: string,
  type:
    | "new_prescription"
    | "prescription_updated"
    | "prescription_fulfilled"
    | "low_stock_alert"
    | "expiring_drug_alert"
    | "er_new_patient"
    | "er_status_change"
    | "er_triage_change",
  data:
    | NewPrescriptionData
    | PrescriptionUpdatedData
    | PrescriptionFulfilledData
    | LowStockAlertData
    | ExpiringDrugAlertData
    | ERNewPatientData
    | ERStatusChangeData
    | ERTriageChangeData
): void {
  const payload: NotificationPayload = {
    type,
    data,
    timestamp: new Date().toISOString(),
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  } as NotificationPayload

  sseManager.broadcast(channel, payload)
}
