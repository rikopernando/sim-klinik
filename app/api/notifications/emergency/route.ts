import { NextResponse } from "next/server"
import { createSSEStream } from "@/lib/notifications/sse-manager"
import { withRBAC } from "@/lib/rbac/middleware"

/**
 * GET /api/notifications/emergency
 * Server-Sent Events endpoint for emergency room notifications
 * Requires: nurse, doctor, receptionist, admin, or super_admin role
 */
export const GET = withRBAC(
  async () => {
    // Create SSE stream for emergency channel
    const stream = createSSEStream("emergency")

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering for nginx
      },
    })
  },
  { roles: ["nurse", "doctor", "receptionist", "admin", "super_admin"] }
)
