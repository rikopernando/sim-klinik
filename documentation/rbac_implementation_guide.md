# RBAC Implementation Guide

**Sim-Klinik API Route Protection Guide**

This document provides a step-by-step guide for implementing Role-Based Access Control (RBAC) protection on all API routes in the Sim-Klinik application.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Pattern](#implementation-pattern)
4. [Permission Mapping Reference](#permission-mapping-reference)
5. [Step-by-Step Examples](#step-by-step-examples)
6. [Common Scenarios](#common-scenarios)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What Has Been Completed

✅ **Better Auth Session Enhancement (Task J.15)**
- Updated `/lib/auth.ts` to include role and permissions in session using `customSession` plugin
- Updated `/lib/auth-client.ts` with `customSessionClient` for type inference
- Session now automatically includes:
  - `user.role` - The user's role (e.g., "doctor", "nurse")
  - `user.roleId` - The role ID from database
  - `user.permissions` - Array of permissions based on role

✅ **Protected API Routes**
- `/api/patients/*` - All routes (GET, POST, PATCH, search)
- `/api/visits/*` - All methods (GET, POST, PATCH)
- `/api/medical-records` - Main route (GET, POST, PATCH)

### What Needs to Be Done

⏳ **Remaining Routes (~20 files)**
- Medical Records sub-routes (4 files)
- Emergency routes (3 files)
- Inpatient routes (4 files)
- Pharmacy routes (4 files)
- Billing routes (3 files)

---

## Prerequisites

Before implementing RBAC on a route, ensure:

1. ✅ Better Auth session includes role data (already completed)
2. ✅ RBAC middleware exists at `/lib/rbac/middleware.ts` (already exists)
3. ✅ Permissions are defined in `/types/rbac.ts` (already exists)
4. ✅ User has a role assigned in the database

---

## Implementation Pattern

### Basic Pattern

Every API route should follow this pattern:

#### Step 1: Import the RBAC middleware

```typescript
import { withRBAC } from "@/lib/rbac/middleware";
```

#### Step 2: Wrap the handler

**Before:**
```typescript
export async function GET(request: NextRequest) {
    try {
        // handler logic
    } catch (error) {
        // error handling
    }
}
```

**After:**
```typescript
export const GET = withRBAC(
    async (request: NextRequest) => {
        try {
            // handler logic (unchanged)
        } catch (error) {
            // error handling (unchanged)
        }
    },
    { permissions: ["appropriate:permission"] }
);
```

#### Step 3: Remove manual auth checks (if present)

**Before:**
```typescript
const session = await auth.api.getSession({
    headers: request.headers,
});

if (!session?.user) {
    return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
    );
}

const doctorId = session.user.id;
```

**After:**
```typescript
// withRBAC provides user object automatically
export const POST = withRBAC(
    async (request: NextRequest, { user }) => {
        // user.id, user.email, user.name are available
        const doctorId = user.id;
    },
    { permissions: ["medical_records:write"] }
);
```

#### Step 4: Remove auth import (if no longer needed)

If the file only used `auth` for session checking:
```typescript
// Remove this line if not used elsewhere
import { auth } from "@/lib/auth";
```

---

## Permission Mapping Reference

Use this comprehensive mapping to determine which permissions each route needs.

### Medical Records Sub-routes

| Route | Method | Permission(s) | Roles with Access |
|-------|--------|---------------|-------------------|
| `/api/medical-records/lock` | POST | `medical_records:lock` | doctor, super_admin |
| `/api/medical-records/diagnoses` | GET | `medical_records:read` | doctor, super_admin, admin |
| `/api/medical-records/diagnoses` | POST | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/diagnoses` | PATCH | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/diagnoses` | DELETE | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/procedures` | GET | `medical_records:read` | doctor, super_admin, admin |
| `/api/medical-records/procedures` | POST | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/procedures` | PATCH | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/procedures` | DELETE | `medical_records:write` | doctor, super_admin |
| `/api/medical-records/prescriptions` | GET | `prescriptions:read` | doctor, pharmacist, super_admin, admin |
| `/api/medical-records/prescriptions` | POST | `prescriptions:write` | doctor, super_admin |
| `/api/medical-records/prescriptions` | PATCH | `prescriptions:write` | doctor, super_admin |
| `/api/medical-records/prescriptions` | DELETE | `prescriptions:write` | doctor, super_admin |

### Emergency Routes

| Route | Method | Permission(s) | Roles with Access |
|-------|--------|---------------|-------------------|
| `/api/emergency/quick-register` | POST | `visits:write` | receptionist, admin, super_admin, doctor |
| `/api/emergency/complete-registration` | PATCH | `patients:write` | receptionist, admin, super_admin |
| `/api/emergency/handover` | POST | `visits:write` | doctor, admin, super_admin |

### Inpatient Routes

| Route | Method | Permission(s) | Roles with Access |
|-------|--------|---------------|-------------------|
| `/api/rooms` | GET | `inpatient:read` | nurse, doctor, admin, super_admin |
| `/api/rooms` | POST | `inpatient:manage_beds` | nurse, super_admin |
| `/api/rooms` | PATCH | `inpatient:manage_beds` | nurse, super_admin |
| `/api/rooms/assign` | POST | `inpatient:manage_beds` | nurse, super_admin |
| `/api/vitals` | GET | `inpatient:read` | nurse, doctor, admin, super_admin |
| `/api/vitals` | POST | `inpatient:write` | nurse, doctor, super_admin |
| `/api/cppt` | GET | `inpatient:read` | nurse, doctor, admin, super_admin |
| `/api/cppt` | POST | `inpatient:write` | nurse, doctor, super_admin |
| `/api/cppt` | PATCH | `inpatient:write` | nurse, doctor, super_admin |
| `/api/materials` | POST | `inpatient:write` | nurse, doctor, super_admin |

### Pharmacy Routes

| Route | Method | Permission(s) | Roles with Access |
|-------|--------|---------------|-------------------|
| `/api/drugs` | GET | `pharmacy:read` | pharmacist, doctor, admin, super_admin |
| `/api/drugs` | POST | `pharmacy:write` | pharmacist, super_admin |
| `/api/drugs` | PATCH | `pharmacy:write` | pharmacist, super_admin |
| `/api/drugs` | DELETE | `pharmacy:write` | pharmacist, super_admin |
| `/api/inventory` | GET | `pharmacy:read` | pharmacist, admin, super_admin |
| `/api/inventory` | POST | `pharmacy:manage_inventory` | pharmacist, super_admin |
| `/api/inventory` | PATCH | `pharmacy:manage_inventory` | pharmacist, super_admin |
| `/api/pharmacy/expiring` | GET | `pharmacy:read` | pharmacist, admin, super_admin |
| `/api/pharmacy/queue` | GET | `prescriptions:read` | pharmacist, super_admin |
| `/api/pharmacy/queue` | PATCH | `prescriptions:fulfill` | pharmacist, super_admin |

### Billing Routes

| Route | Method | Permission(s) | Roles with Access |
|-------|--------|---------------|-------------------|
| `/api/billing` | GET | `billing:read` | cashier, admin, super_admin |
| `/api/billing` | POST | `billing:write` | cashier, super_admin |
| `/api/billing/payment` | POST | `billing:process_payment` | cashier, super_admin |
| `/api/billing/discharge` | POST | `discharge:write` | doctor, cashier, super_admin |

---

## Step-by-Step Examples

### Example 1: Simple GET Route

**File:** `/api/medical-records/lock/route.ts`

**Original Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const lockSchema = z.object({
    id: z.number().int().positive(),
    userId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = lockSchema.parse(body);

        // Check if record exists
        const existing = await db
            .select()
            .from(medicalRecords)
            .where(eq(medicalRecords.id, validatedData.id))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Medical record not found" },
                { status: 404 }
            );
        }

        if (existing[0].isLocked) {
            return NextResponse.json(
                { error: "Medical record is already locked" },
                { status: 400 }
            );
        }

        // Lock the medical record
        const lockedRecord = await db
            .update(medicalRecords)
            .set({
                isLocked: true,
                isDraft: false,
                lockedAt: new Date(),
                lockedBy: validatedData.userId,
                updatedAt: new Date(),
            })
            .where(eq(medicalRecords.id, validatedData.id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Medical record locked successfully",
            data: lockedRecord[0],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Medical record lock error:", error);
        return NextResponse.json(
            { error: "Failed to lock medical record" },
            { status: 500 }
        );
    }
}
```

**Protected Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { medicalRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withRBAC } from "@/lib/rbac/middleware"; // 1. Add import

// 2. Update schema - remove userId (we'll use authenticated user)
const lockSchema = z.object({
    id: z.number().int().positive(),
});

/**
 * POST /api/medical-records/lock
 * Lock a medical record (make it immutable)
 * Requires: medical_records:lock permission
 */
export const POST = withRBAC( // 3. Change to const + withRBAC
    async (request: NextRequest, { user }) => { // 4. Add user from context
        try {
            const body = await request.json();
            const validatedData = lockSchema.parse(body);

            // Check if record exists
            const existing = await db
                .select()
                .from(medicalRecords)
                .where(eq(medicalRecords.id, validatedData.id))
                .limit(1);

            if (existing.length === 0) {
                return NextResponse.json(
                    { error: "Medical record not found" },
                    { status: 404 }
                );
            }

            if (existing[0].isLocked) {
                return NextResponse.json(
                    { error: "Medical record is already locked" },
                    { status: 400 }
                );
            }

            // Lock the medical record
            const lockedRecord = await db
                .update(medicalRecords)
                .set({
                    isLocked: true,
                    isDraft: false,
                    lockedAt: new Date(),
                    lockedBy: user.id, // 5. Use authenticated user ID
                    updatedAt: new Date(),
                })
                .where(eq(medicalRecords.id, validatedData.id))
                .returning();

            return NextResponse.json({
                success: true,
                message: "Medical record locked successfully",
                data: lockedRecord[0],
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: "Validation error", details: error.issues },
                    { status: 400 }
                );
            }

            console.error("Medical record lock error:", error);
            return NextResponse.json(
                { error: "Failed to lock medical record" },
                { status: 500 }
            );
        }
    },
    { permissions: ["medical_records:lock"] } // 6. Specify required permission
);
```

**Changes Made:**
1. ✅ Added `withRBAC` import
2. ✅ Removed `userId` from schema (use authenticated user instead)
3. ✅ Changed `export async function` to `export const` with `withRBAC`
4. ✅ Added `{ user }` parameter to access authenticated user
5. ✅ Used `user.id` instead of `validatedData.userId`
6. ✅ Specified required permission `medical_records:lock`

---

### Example 2: Route with Manual Auth Check

**File:** `/api/emergency/quick-register/route.ts` (hypothetical)

**Original Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function POST(request: NextRequest) {
    // Manual auth check
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session?.user) {
        return NextResponse.json(
            { error: "Unauthorized. Please login." },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        // Create quick registration
        const newVisit = await db.insert(visits).values({
            // ... data
            registeredBy: session.user.id, // Using session
        }).returning();

        return NextResponse.json({ success: true, data: newVisit[0] });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to register patient" },
            { status: 500 }
        );
    }
}
```

**Protected Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth"; // 1. Remove auth import (no longer needed)
import { withRBAC } from "@/lib/rbac/middleware"; // 2. Add withRBAC import
import { db } from "@/db";

/**
 * POST /api/emergency/quick-register
 * Quick registration for emergency patients
 * Requires: visits:write permission
 */
export const POST = withRBAC( // 3. Wrap with withRBAC
    async (request: NextRequest, { user }) => { // 4. Get user from context
        // 5. Remove manual auth check - withRBAC handles it
        try {
            const body = await request.json();

            // Create quick registration
            const newVisit = await db.insert(visits).values({
                // ... data
                registeredBy: user.id, // 6. Use user from context
            }).returning();

            return NextResponse.json({ success: true, data: newVisit[0] });
        } catch (error) {
            return NextResponse.json(
                { error: "Failed to register patient" },
                { status: 500 }
            );
        }
    },
    { permissions: ["visits:write"] } // 7. Specify permission
);
```

**Changes Made:**
1. ✅ Removed `auth` import (no longer needed)
2. ✅ Added `withRBAC` import
3. ✅ Wrapped handler with `withRBAC`
4. ✅ Added `{ user }` parameter
5. ✅ Removed manual session check (10 lines removed!)
6. ✅ Used `user.id` from context
7. ✅ Specified required permission

---

### Example 3: Multiple Methods in One File

**File:** `/api/drugs/route.ts`

**Original Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drugs } from "@/db/schema";

export async function GET(request: NextRequest) {
    const allDrugs = await db.select().from(drugs);
    return NextResponse.json({ data: allDrugs });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const newDrug = await db.insert(drugs).values(body).returning();
    return NextResponse.json({ data: newDrug[0] });
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, ...updateData } = body;
    const updated = await db.update(drugs).set(updateData).where(eq(drugs.id, id)).returning();
    return NextResponse.json({ data: updated[0] });
}
```

**Protected Code:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drugs } from "@/db/schema";
import { withRBAC } from "@/lib/rbac/middleware"; // Add import

/**
 * GET /api/drugs
 * Get all drugs
 * Requires: pharmacy:read permission
 */
export const GET = withRBAC(
    async (request: NextRequest) => {
        const allDrugs = await db.select().from(drugs);
        return NextResponse.json({ data: allDrugs });
    },
    { permissions: ["pharmacy:read"] } // Read permission
);

/**
 * POST /api/drugs
 * Create a new drug
 * Requires: pharmacy:write permission
 */
export const POST = withRBAC(
    async (request: NextRequest) => {
        const body = await request.json();
        const newDrug = await db.insert(drugs).values(body).returning();
        return NextResponse.json({ data: newDrug[0] });
    },
    { permissions: ["pharmacy:write"] } // Write permission
);

/**
 * PATCH /api/drugs
 * Update drug information
 * Requires: pharmacy:write permission
 */
export const PATCH = withRBAC(
    async (request: NextRequest) => {
        const body = await request.json();
        const { id, ...updateData } = body;
        const updated = await db.update(drugs).set(updateData).where(eq(drugs.id, id)).returning();
        return NextResponse.json({ data: updated[0] });
    },
    { permissions: ["pharmacy:write"] } // Write permission
);
```

**Key Point:** Each HTTP method gets its own protection with appropriate permissions!

---

## Common Scenarios

### Scenario 1: Using Multiple Permissions (Any)

Some routes might be accessible by users with ANY of several permissions:

```typescript
export const GET = withRBAC(
    async (request: NextRequest) => {
        // Handler logic
    },
    {
        permissions: ["medical_records:read", "medical_records:write"],
        requireAll: false // Default: user needs ANY of these permissions
    }
);
```

### Scenario 2: Requiring All Permissions

For routes that need multiple specific permissions:

```typescript
export const POST = withRBAC(
    async (request: NextRequest) => {
        // Handler logic
    },
    {
        permissions: ["billing:write", "discharge:write"],
        requireAll: true // User must have ALL these permissions
    }
);
```

### Scenario 3: Role-Based Protection

If you want to restrict by role instead of permission:

```typescript
export const DELETE = withRBAC(
    async (request: NextRequest) => {
        // Handler logic
    },
    {
        roles: ["super_admin"] // Only super_admin can access
    }
);
```

### Scenario 4: Accessing User Information

The `withRBAC` middleware provides user context:

```typescript
export const POST = withRBAC(
    async (request: NextRequest, { user, role }) => {
        console.log(user.id);    // User ID
        console.log(user.email); // User email
        console.log(user.name);  // User name
        console.log(role);       // User's role (e.g., "doctor")

        // Use in your logic
        const record = await createRecord({
            doctorId: user.id,
            doctorName: user.name,
        });
    },
    { permissions: ["medical_records:write"] }
);
```

---

## Testing Guide

### Manual Testing Steps

After protecting all routes, you should test the RBAC implementation:

#### 1. Test Authentication

```bash
# Test without authentication
curl -X GET http://localhost:3000/api/patients

# Expected: 401 Unauthorized
# Response: { "error": "Unauthorized", "message": "You must be logged in to access this resource" }
```

#### 2. Test with Different Roles

**Test as Doctor:**
```bash
# Login as doctor first, get token
# Then test allowed endpoints

# ✅ Should work: Read medical records
curl -X GET http://localhost:3000/api/medical-records?visitId=1 \
  -H "Cookie: better-auth.session_token=DOCTOR_TOKEN"

# ❌ Should fail: Manage pharmacy inventory
curl -X POST http://localhost:3000/api/inventory \
  -H "Cookie: better-auth.session_token=DOCTOR_TOKEN"
# Expected: 403 Forbidden
```

**Test as Pharmacist:**
```bash
# ✅ Should work: Fulfill prescriptions
curl -X PATCH http://localhost:3000/api/pharmacy/queue \
  -H "Cookie: better-auth.session_token=PHARMACIST_TOKEN"

# ❌ Should fail: Lock medical records
curl -X POST http://localhost:3000/api/medical-records/lock \
  -H "Cookie: better-auth.session_token=PHARMACIST_TOKEN"
# Expected: 403 Forbidden
```

**Test as Super Admin:**
```bash
# ✅ Should work: Everything!
curl -X DELETE http://localhost:3000/api/users/123 \
  -H "Cookie: better-auth.session_token=SUPER_ADMIN_TOKEN"
```

#### 3. Test Permission Matrix

Create a test matrix for critical routes:

| Route | Doctor | Nurse | Pharmacist | Cashier | Receptionist | Super Admin |
|-------|--------|-------|------------|---------|--------------|-------------|
| POST /api/patients | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| GET /api/patients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/medical-records | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| POST /api/medical-records/lock | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| PATCH /api/pharmacy/queue | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| POST /api/billing/payment | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

### Automated Testing (Optional)

Create integration tests in `__tests__/api/rbac.test.ts`:

```typescript
describe('RBAC Protection', () => {
    it('should deny unauthenticated requests', async () => {
        const response = await fetch('/api/patients');
        expect(response.status).toBe(401);
    });

    it('should allow doctor to create medical records', async () => {
        const response = await fetch('/api/medical-records', {
            method: 'POST',
            headers: {
                'Cookie': `better-auth.session_token=${doctorToken}`,
            },
            body: JSON.stringify({ visitId: 1, ... }),
        });
        expect(response.status).toBe(201);
    });

    it('should deny nurse from creating medical records', async () => {
        const response = await fetch('/api/medical-records', {
            method: 'POST',
            headers: {
                'Cookie': `better-auth.session_token=${nurseToken}`,
            },
            body: JSON.stringify({ visitId: 1, ... }),
        });
        expect(response.status).toBe(403);
    });
});
```

---

## Troubleshooting

### Issue 1: "Cannot find module '@/lib/rbac/middleware'"

**Cause:** Import path is incorrect or middleware file doesn't exist.

**Solution:**
```typescript
// Check that this file exists:
// /lib/rbac/middleware.ts

// Correct import:
import { withRBAC } from "@/lib/rbac/middleware";
```

### Issue 2: "User is undefined in handler"

**Cause:** Not destructuring the user from context parameter.

**Incorrect:**
```typescript
export const POST = withRBAC(
    async (request: NextRequest) => {
        const userId = user.id; // ❌ user is not defined
    },
    { permissions: ["medical_records:write"] }
);
```

**Correct:**
```typescript
export const POST = withRBAC(
    async (request: NextRequest, { user }) => { // ✅ Destructure user
        const userId = user.id;
    },
    { permissions: ["medical_records:write"] }
);
```

### Issue 3: Always getting 403 Forbidden

**Possible Causes:**
1. User doesn't have the required role assigned in database
2. Permission name is misspelled
3. Role permissions mapping is incorrect

**Debug Steps:**
```typescript
// Temporarily log user permissions
export const POST = withRBAC(
    async (request: NextRequest, { user, role }) => {
        console.log('User role:', role);
        console.log('User permissions:', user.permissions);
        // ... rest of handler
    },
    { permissions: ["medical_records:write"] }
);
```

**Check Database:**
```sql
-- Verify user has a role
SELECT u.id, u.name, u.email, r.name as role_name
FROM "user" u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.id = 'USER_ID_HERE';
```

### Issue 4: TypeScript Errors with Context Parameter

**Error:**
```
Parameter 'context' implicitly has an 'any' type.
```

**Solution:**
```typescript
// Add proper type annotation
export const POST = withRBAC(
    async (
        request: NextRequest,
        context: { user: { id: string; email: string; name: string }; role?: string | null }
    ) => {
        const userId = context.user.id;
    },
    { permissions: ["medical_records:write"] }
);

// Or use destructuring (simpler)
export const POST = withRBAC(
    async (request: NextRequest, { user, role }) => {
        const userId = user.id;
    },
    { permissions: ["medical_records:write"] }
);
```

### Issue 5: Session Doesn't Include Role Data

**Cause:** Better Auth session customization not working.

**Verify:**
1. Check `/lib/auth.ts` has `customSession` plugin
2. Check `/lib/auth-client.ts` has `customSessionClient` plugin
3. Restart dev server after changes

**Test Session:**
```typescript
// In a protected route
export const GET = withRBAC(
    async (request: NextRequest, { user, role }) => {
        return NextResponse.json({
            userId: user.id,
            role: role,
            // This should show role and permissions
        });
    },
    { permissions: ["patients:read"] }
);
```

---

## Quick Reference Checklist

Use this checklist when protecting each route:

- [ ] Import `withRBAC` from `@/lib/rbac/middleware`
- [ ] Change `export async function` to `export const` with `withRBAC`
- [ ] Add appropriate permission(s) from mapping table
- [ ] If route uses authentication, replace manual checks with `{ user }` parameter
- [ ] Remove `auth` import if no longer needed
- [ ] Add JSDoc comment with permission requirement
- [ ] Test the route with different user roles
- [ ] Verify 401 for unauthenticated requests
- [ ] Verify 403 for unauthorized roles

---

## Complete File List

**Medical Records Sub-routes (4 files):**
- [ ] `/app/api/medical-records/lock/route.ts`
- [ ] `/app/api/medical-records/diagnoses/route.ts`
- [ ] `/app/api/medical-records/procedures/route.ts`
- [ ] `/app/api/medical-records/prescriptions/route.ts`

**Emergency Routes (3 files):**
- [ ] `/app/api/emergency/quick-register/route.ts`
- [ ] `/app/api/emergency/complete-registration/route.ts`
- [ ] `/app/api/emergency/handover/route.ts`

**Inpatient Routes (4 files):**
- [ ] `/app/api/rooms/route.ts`
- [ ] `/app/api/rooms/assign/route.ts`
- [ ] `/app/api/vitals/route.ts`
- [ ] `/app/api/cppt/route.ts`
- [ ] `/app/api/materials/route.ts`

**Pharmacy Routes (4 files):**
- [ ] `/app/api/drugs/route.ts`
- [ ] `/app/api/inventory/route.ts`
- [ ] `/app/api/pharmacy/expiring/route.ts`
- [ ] `/app/api/pharmacy/queue/route.ts`

**Billing Routes (3 files):**
- [ ] `/app/api/billing/route.ts`
- [ ] `/app/api/billing/payment/route.ts`
- [ ] `/app/api/billing/discharge/route.ts`

---

## Additional Resources

- **RBAC Types:** `/types/rbac.ts` - Complete list of roles and permissions
- **RBAC Middleware:** `/lib/rbac/middleware.ts` - Middleware implementation
- **RBAC Session:** `/lib/rbac/session.ts` - Session utilities
- **Better Auth Config:** `/lib/auth.ts` - Auth configuration with customSession
- **Permission Matrix:** See `/types/rbac.ts` ROLE_PERMISSIONS mapping

---

## Summary

**Key Points:**
1. Every API route must be protected with `withRBAC`
2. Use permission-based protection (not role-based) for flexibility
3. Remove manual authentication checks - `withRBAC` handles it
4. Use the permission mapping table for correct permissions
5. Test with different user roles after implementation

**Benefits:**
- 🔒 Secure API routes with proper authorization
- 🎯 Fine-grained permission control
- 🧹 Cleaner code (no manual auth checks)
- 🔄 Consistent pattern across all routes
- 📊 Easy to audit and maintain

**Next Steps:**
1. Work through each file in the checklist
2. Apply the pattern systematically
3. Test each route after protection
4. Document any special cases or deviations

Good luck with the implementation! If you encounter any issues not covered in this guide, refer to the examples or check the existing protected routes (`/api/patients`, `/api/visits`, `/api/medical-records`) for reference.
