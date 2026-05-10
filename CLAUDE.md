# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sim-Klinik** is a clinic management system built with Next.js 15. The system includes modules for patient registration, electronic medical records (EMR), emergency room (UGD), inpatient care, pharmacy, laboratory, and billing. Currently in Phase 1 (MVP) development.

## Documentation Reference

Before implementing features, consult `/documentation/`:

- **`tasks.md`**: Phase 1 MVP task breakdown (A-G modules with priorities)
- **`app_flow_document.md`**: User stories for all 7 modules with role-based workflows
- **`backend_structure_document.md`**: Database schema, API design
- **`visit_status_lifecycle.md`**: Visit status state machine and valid transitions
- **`security_guideline_document.md`**: Security practices

⚠️ Documentation references Prisma and NextAuth, but codebase uses **Drizzle ORM** and **Better Auth**. Prioritize actual implementation.

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript (strict mode)
- **Auth**: Better Auth with Drizzle adapter
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **Forms**: React Hook Form + Zod validation

## Development Commands

```bash
# Application
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Check formatting without writing

# Database (postgres only — not full stack)
npm run db:up        # Start dev PostgreSQL container (port 5433)
npm run db:down      # Stop dev PostgreSQL container
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
npm run db:studio    # Drizzle Studio GUI
npm run db:reset     # Drop and recreate tables

# Seeders
npm run db:seed              # Main seeder (users, roles, polis)
npm run db:seed:services     # Seed services/tariffs
npm run db:seed:drugs        # Seed drug master data
npm run db:seed:rooms        # Seed room/bed data
npm run db:seed:material     # Seed medical materials
npm run db:update-passwords  # Re-hash passwords after algorithm changes

# Docker (full stack)
npm run docker:up    # Start full stack (app + postgres)
npm run docker:down  # Stop containers
npm run docker:logs  # Tail container logs
```

## Architecture

### Database Schema (`db/schema/`)

Schemas are organized by domain:

- `auth.ts` - Better Auth tables (user, session, account, verification)
- `roles.ts` - RBAC roles and user-role assignments
- `patients.ts` - Patient master data with MR numbers
- `visits.ts` - Visit records, polis, services, doctors
- `medical-records.ts` - SOAP notes, diagnoses (ICD-10), procedures (ICD-9), prescriptions
- `inventory.ts` - Unified drugs and materials inventory (see note below)
- `inpatient.ts` - Rooms, beds, vitals, CPPT notes
- `billing.ts` - Billing, payments, discharge
- `laboratory.ts` - Lab tests, orders, results

**Inventory naming quirk**: The Drizzle export is `inventoryItems` but the underlying SQL table is named `"drugs"` (kept for backward compatibility). Both drugs and medical materials are stored here, distinguished by the `itemType` field (`"drug"` | `"material"`).

### RBAC System (`lib/rbac/` + `types/rbac.ts`)

Role-based access control with 10 roles: `super_admin`, `admin`, `doctor`, `nurse`, `pharmacist`, `cashier`, `receptionist`, `lab_technician`, `lab_supervisor`, `radiologist`

**API Route Protection** (server-side):

```typescript
import { withRBAC } from "@/lib/rbac/middleware"

export const GET = withRBAC(
  async (req, { user, role }) => {
    // Handler with user context
  },
  { permissions: ["patients:read"] }
)

// Or with roles
export const POST = withRBAC(handler, { roles: ["doctor", "nurse"] })
```

**Session Helpers** (`lib/rbac/session.ts`):

```typescript
import { getSession, getUserRole, hasPermission } from "@/lib/rbac"
```

The session module maintains an in-memory role cache (60s TTL). Call `invalidateRoleCache(userId)` after changing a user's role to force a fresh lookup.

**Client-side Page Protection**:

```typescript
import { usePagePermission, PAGE_PERMISSIONS } from "@/hooks/use-page-permission"

// In a page component:
const { isAuthorized, isLoading } = usePagePermission(PAGE_PERMISSIONS.cashier)
// PAGE_PERMISSIONS has presets for: queue, doctor, pharmacy, cashier, laboratory,
// inpatient, medicalRecords, users, registration, patients, emergency, masterData
```

**Auth Client** (`lib/auth-client.ts`) — use in client components:

```typescript
import { authClient, signIn, signOut, useSession } from "@/lib/auth-client"

const { data: session } = useSession()
```

### Visit Status State Machine (`types/visit-status.ts`)

Visits move through a defined state machine. The valid flow is:
`registered` → `waiting` → `in_examination` → `examined` → `ready_for_billing` → `billed` → `paid` → `completed`

Terminal states: `completed`, `cancelled` (reachable from any non-terminal status).

Key integration points:

- Locking a medical record **automatically** transitions the visit to `ready_for_billing`
- Discharge is blocked until status is `paid`
- Use utility functions from `types/visit-status.ts` to validate transitions:

```typescript
import {
  isValidStatusTransition,
  getAllowedNextStatuses,
  canCreateBilling,
} from "@/types/visit-status"
```

### API Pattern

Routes follow REST conventions in `app/api/`. Standard response types:

```typescript
import { ResponseApi, ResponseError } from "@/types/api"
import HTTP_STATUS_CODES from "@/lib/constants/http"

// Success response
const response: ResponseApi<T> = {
  message: "Success",
  data: result,
  status: HTTP_STATUS_CODES.OK,
}

// Error response
const response: ResponseError<unknown> = {
  error: details,
  message: "Error message",
  status: HTTP_STATUS_CODES.BAD_REQUEST,
}
```

**Server-side caching**: Use `ApiCache` from `lib/cache/api-cache.ts` for read-heavy endpoints:

```typescript
const cache = new ApiCache<MyData>(30_000) // 30s TTL
const cached = cache.get("key")
if (cached) return cached
```

### Client Services (`lib/services/`)

Services handle API calls from client components. Key services: `patient.service.ts`, `visit.service.ts`, `pharmacy.service.ts`, `billing.service.ts`, `inpatient.service.ts`, `lab.service.ts`, `emergency.service.ts`, `inventory.service.ts`, `medical-record.service.ts`, `rooms.service.ts`, `compound-recipe.service.ts`, `poli.service.ts`, `user.service.ts`.

### Custom Hooks (`hooks/`)

The hooks directory contains domain-specific hooks that wrap service calls with React Query. Naming is `use-<domain>-<action>.ts`. Prefer using existing hooks before reaching into services directly.

### Real-time Notifications (`lib/notifications/`)

SSE-based notifications for pharmacy and emergency modules. The manager is in `lib/notifications/sse-manager.ts`. Client hooks: `use-pharmacy-notifications.ts`, `use-er-notifications.ts`.

### Type Definitions (`types/`)

- `rbac.ts` - Roles, permissions, user types
- `visit-status.ts` - Visit state machine, utility functions
- `registration.ts` - Patient form types
- `medical-record.ts` - EMR types
- `billing.ts` - Billing types
- `inpatient.ts` - Inpatient types
- `api.ts` - API response types

### Key Utilities

```typescript
import { cn } from "@/lib/utils"
import { generateMRNumber } from "@/lib/generators"
import { patientSchema } from "@/lib/validations/registration"
```

## Dashboard Routes

Implemented pages in `app/dashboard/`:

- `/registration` - Patient registration and visit creation
- `/patients` - Patient list and management
- `/queue` - Queue management per poli
- `/doctor` - Doctor dashboard with patient queue
- `/medical-records/[visitId]` - EMR with SOAP notes
- `/emergency` - Emergency room triage
- `/inpatient/patients` - Inpatient list
- `/inpatient/rooms` - Bed management
- `/pharmacy` - Prescription fulfillment
- `/pharmacy/inventory` - Drug inventory
- `/laboratory/queue` - Lab order queue
- `/laboratory/list` - Lab results
- `/cashier` - Billing and payments
- `/users` - User management (super_admin only)
- `/master-data/polis` - Poli management
- `/master-data/rooms` - Room configuration
- `/services` - Service/tariff management

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Key Implementation Notes

- **Forms**: Use React Hook Form + Zod for all forms
- **MR Numbers**: Auto-generated via `generateMRNumber()`
- **Billing Gate**: Patients cannot be discharged until payment status is "LUNAS"
- **Medical Records**: Can be locked after completion (only super_admin can unlock); locking auto-transitions visit to `ready_for_billing`
- **Real-time**: SSE notifications for pharmacy prescriptions (`lib/notifications/`)
- **Address Hierarchy**: Province → City → Subdistrict → Village (Indonesian format)

## Path Aliases

```typescript
import { db } from "@/db"
import { patients, visits } from "@/db/schema"
import { inventoryItems } from "@/db/schema/inventory" // "drugs" table — holds drugs + materials
import { withRBAC } from "@/lib/rbac"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/rbac"
```

## Claude Code Rules

1. First think through the problem, read the codebase for relevant files, and read the plan on documentations/PLANNER.md.
2. The plan have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [documentations/REVIEW.md](http://review.md/) file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

CRITICAL: When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
