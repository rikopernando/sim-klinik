# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sim-Klinik** is a clinic management system built with Next.js 15. The system includes modules for patient registration, electronic medical records (EMR), emergency room (UGD), inpatient care, pharmacy, laboratory, and billing. Currently in Phase 1 (MVP) development.

## Documentation Reference

Before implementing features, consult `/documentation/`:

- **`tasks.md`**: Phase 1 MVP task breakdown (A-G modules with priorities)
- **`app_flow_document.md`**: User stories for all 7 modules with role-based workflows
- **`backend_structure_document.md`**: Database schema, API design
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

# Database
npm run db:dev       # Start dev PostgreSQL (port 5433)
npm run db:push      # Push schema changes
npm run db:generate  # Generate migrations
npm run db:studio    # Drizzle Studio GUI
npm run db:reset     # Drop and recreate tables

# Seeders
npm run db:seed            # Main seeder
npm run db:seed:services   # Seed services/tariffs
npm run db:seed:drugs      # Seed drug master data
npm run db:seed:rooms      # Seed room/bed data

# Docker
npm run docker:up    # Start full stack
npm run docker:down  # Stop containers
```

## Architecture

### Database Schema (`db/schema/`)

Schemas are organized by domain:

- `auth.ts` - Better Auth tables (user, session, account, verification)
- `roles.ts` - RBAC roles and user-role assignments
- `patients.ts` - Patient master data with MR numbers
- `visits.ts` - Visit records, polis, services, doctors
- `medical-records.ts` - SOAP notes, diagnoses (ICD-10), procedures (ICD-9), prescriptions
- `inventory.ts` - Unified drugs and materials inventory
- `inpatient.ts` - Rooms, beds, vitals, CPPT notes
- `billing.ts` - Billing, payments, discharge
- `laboratory.ts` - Lab tests, orders, results

### RBAC System (`lib/rbac/` + `types/rbac.ts`)

Role-based access control with 10 roles: `super_admin`, `admin`, `doctor`, `nurse`, `pharmacist`, `cashier`, `receptionist`, `lab_technician`, `lab_supervisor`, `radiologist`

**API Route Protection**:

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

### Client Services (`lib/services/`)

Services handle API calls from client components:

- `patient.service.ts` - Patient CRUD
- `visit.service.ts` - Visit management
- `pharmacy.service.ts` - Pharmacy operations
- `billing.service.ts` - Billing operations
- `inpatient.service.ts` - Inpatient care
- `lab.service.ts` - Laboratory orders

### Type Definitions (`types/`)

Domain types are in `/types/`:

- `rbac.ts` - Roles, permissions, user types
- `registration.ts` - Patient form types
- `medical-record.ts` - EMR types
- `billing.ts` - Billing types
- `inpatient.ts` - Inpatient types
- `api.ts` - API response types

### Key Utilities

```typescript
// Class name utility
import { cn } from "@/lib/utils"

// MR Number generation
import { generateMRNumber } from "@/lib/generators"

// Zod validations
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
- **Medical Records**: Can be locked after completion (only super_admin can unlock)
- **Real-time**: SSE notifications for pharmacy prescriptions (`lib/notifications/`)
- **Address Hierarchy**: Province → City → Subdistrict → Village (Indonesian format)

## Path Aliases

```typescript
import { db } from "@/db"
import { patients, visits } from "@/db/schema"
import { withRBAC } from "@/lib/rbac"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/rbac"
```
