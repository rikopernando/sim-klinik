# /new-api - Generate API Route

Generate a new API route following the established patterns in this codebase.

## Arguments

$ARGUMENTS - Route specification in format: `path --methods GET,POST --permissions permission:action`

Example: `patients/[id]/visits --methods GET,POST --permissions visits:read,visits:write`

## Instructions

1. **Parse the arguments** to extract:
   - Route path (e.g., `patients/[id]/visits`)
   - HTTP methods (default: GET)
   - Required permissions (from `types/rbac.ts`)

2. **Create the route file** at `app/api/{path}/route.ts`

3. **Follow these patterns exactly**:

### File Structure

```typescript
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { /* relevant schemas */ } from "@/db/schema"
import { /* drizzle operators */ } from "drizzle-orm"
import { z } from "zod"
import { withRBAC } from "@/lib/rbac/middleware"
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

/**
 * Validation Schema
 */
const requestSchema = z.object({
  // Define based on the resource
})

/**
 * GET /api/{path}
 * Description of what this endpoint does
 * Requires: {permission} permission
 */
export const GET = withRBAC(
  async (req: NextRequest, { user, role, params }) => {
    try {
      // Implementation

      const response: ResponseApi<T> = {
        message: "Success message",
        data: result,
        status: HTTP_STATUS_CODES.OK,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.OK })
    } catch (error) {
      console.error("Error description:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to...",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["resource:read"] }
)

/**
 * POST /api/{path}
 * Description of what this endpoint does
 * Requires: {permission} permission
 */
export const POST = withRBAC(
  async (req: NextRequest, { user, role }) => {
    try {
      const body = await req.json()

      // Validate input
      const validatedData = requestSchema.parse(body)

      // Implementation

      const response: ResponseApi<T> = {
        message: "Created successfully",
        data: result,
        status: HTTP_STATUS_CODES.CREATED,
      }

      return NextResponse.json(response, { status: HTTP_STATUS_CODES.CREATED })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ResponseError<unknown> = {
          error: error.issues,
          message: "Validation error",
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        }
        return NextResponse.json(response, {
          status: HTTP_STATUS_CODES.BAD_REQUEST,
        })
      }

      console.error("Error description:", error)

      const response: ResponseError<unknown> = {
        error,
        message: "Failed to...",
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      }

      return NextResponse.json(response, {
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      })
    }
  },
  { permissions: ["resource:write"] }
)
```

### For Dynamic Routes with Params

When the path includes `[param]`, access params via the context:

```typescript
export const GET = withRBAC<{ id: string }>(
  async (req: NextRequest, { user, role, params }) => {
    const { id } = params
    // Use id...
  },
  { permissions: ["resource:read"] }
)
```

### Permission Reference

Valid permissions from `types/rbac.ts`:
- `patients:read`, `patients:write`, `patients:delete`
- `visits:read`, `visits:write`, `visits:delete`
- `medical_records:read`, `medical_records:write`, `medical_records:lock`, `medical_records:unlock`
- `prescriptions:read`, `prescriptions:write`, `prescriptions:fulfill`
- `pharmacy:read`, `pharmacy:write`, `pharmacy:manage_inventory`
- `billing:read`, `billing:write`, `billing:process_payment`
- `inpatient:read`, `inpatient:write`, `inpatient:manage_beds`
- `discharge:read`, `discharge:write`
- `lab:read`, `lab:write`, `lab:verify`
- `system:admin`, `system:reports`

4. **After creating the route**, suggest:
   - Creating corresponding types in `types/`
   - Creating a client service in `lib/services/`
   - Adding any needed Zod validation in `lib/validations/`

## Examples

### Simple GET endpoint
```
/new-api drugs/search --methods GET --permissions pharmacy:read
```

### CRUD endpoint with dynamic param
```
/new-api lab/orders/[id] --methods GET,PATCH,DELETE --permissions lab:read,lab:write
```

### Multiple permissions (user needs ANY of them)
```
/new-api reports/visits --methods GET --permissions system:reports,system:admin
```
