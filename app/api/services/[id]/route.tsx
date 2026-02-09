import { db } from "@/db"
import { services } from "@/db/schema"
import HTTP_STATUS_CODES from "@/lib/constants/http"
import { updateServicesSchema } from "@/lib/validations/services.validation"
import { ResponseApi, ResponseError } from "@/types/api"
import { PayloadServices, ResultService } from "@/types/services"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const service = await db
      .select({
        id: services.id,
        code: services.code,
        name: services.name,
        serviceType: services.serviceType,
        price: services.price,
        description: services.description,
        category: services.category,
      })
      .from(services)
      .where(eq(services.id, id))
      .limit(1)

    if (service.length === 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Service not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    const response: ResponseApi<ResultService> = {
      message: "Service fetched successfully",
      data: service[0],
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error fetching service:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to fetch Service",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const validate = updateServicesSchema.parse(body)
    console.log(validate)

    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1)

    if (existing.length === 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Services not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    if (validate.code && validate.code !== existing[0].code) {
      const codeExists = await db
        .select()
        .from(services)
        .where(eq(services.code, validate.code))
        .limit(1)

      if (codeExists.length > 0) {
        const response: ResponseError<null> = {
          error: null,
          message: "Services with this code already exists",
          status: HTTP_STATUS_CODES.CONFLICT,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.CONFLICT,
        })
      }
    }

    const updated = await db
      .update(services)
      .set({
        name: validate.name,
        code: validate.code,
        serviceType: validate.serviceType,
        price: validate.price !== undefined ? String(validate.price) : undefined,
        category: validate.category,
        description: validate.description,
      })
      .where(eq(services.id, id))
      .returning()

    const response: ResponseApi<PayloadServices> = {
      message: "Services updated successfully",
      data: updated[0],
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
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

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    // Validate ID
    if (!id) {
      const response: ResponseError<null> = {
        error: null,
        message: "Service ID is required",
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
      })
    }

    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1)

    if (existing.length === 0) {
      const response: ResponseError<null> = {
        error: null,
        message: "Services not found",
        status: HTTP_STATUS_CODES.NOT_FOUND,
      }
      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.NOT_FOUND,
      })
    }

    // Hard delete: remove the record from the table
    await db.delete(services).where(eq(services.id, id))

    const response: ResponseApi<null> = {
      message: "Services deleted successfully",
      data: null,
      status: HTTP_STATUS_CODES.OK,
    }

    return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
  } catch (error) {
    console.error("Error deleting services:", error)

    const response: ResponseError<unknown> = {
      error,
      message: "Failed to delete services",
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    }

    return NextResponse.json(response, {
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    })
  }
}
