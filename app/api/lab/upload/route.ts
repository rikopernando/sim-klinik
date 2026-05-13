import { NextRequest, NextResponse } from "next/server"
import { withRBAC } from "@/lib/rbac/middleware"
import { uploadLabAttachment } from "@/lib/utils/file-upload"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseApi, ResponseError } from "@/types/api"

export const POST = withRBAC(
  async (request: NextRequest) => {
    const formData = await request.formData()
    const file = formData.get("file")
    const orderId = formData.get("orderId")

    if (!file || !(file instanceof File)) {
      const response: ResponseError<unknown> = {
        error: "Missing file",
        message: "file is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    if (!orderId || typeof orderId !== "string") {
      const response: ResponseError<unknown> = {
        error: "Missing orderId",
        message: "orderId is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.BAD_REQUEST })
    }

    const result = await uploadLabAttachment(file, orderId)

    if ("error" in result) {
      const response: ResponseError<unknown> = {
        error: result.error,
        message: result.error,
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }
      return NextResponse.json(response, { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR })
    }

    const response: ResponseApi<typeof result> = {
      message: "File uploaded successfully",
      data: result,
      status: HTTP_STATUS_CODES.OK,
    }
    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  },
  { roles: ["lab_technician", "lab_supervisor", "super_admin", "admin"] }
)
