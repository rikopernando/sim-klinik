import HTTP_STATUS_CODES from "@/lib/constants/http"
import { ResponseError } from "@/types/api"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{
    id: string
  }>
}
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
  } catch (error) {
    console.error("Error updating services:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update Services",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}

export async function DELETE({ params }: Params) {
  try {
    const { id } = await params
  } catch (error) {
    console.error("Error updating Services:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to update Services",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
