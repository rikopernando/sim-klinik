import { NextRequest } from "next/server"
import { createSSEStream } from "@/lib/notifications/sse-manager"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * GET /api/notifications/pharmacy
 * Server-Sent Events endpoint for pharmacy notifications
 * Requires: prescriptions:read permission (pharmacist role)
 */
export const GET = withRBAC(
  async (request: NextRequest, { user }) => {
    // Create SSE stream for pharmacy channel
    const stream = createSSEStream("pharmacy")

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for nginx
      },
    })
  },
  { permissions: ["prescriptions:read"] }
)
