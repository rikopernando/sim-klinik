# /audit-rbac - Audit RBAC Protection

Scan all API routes and report on RBAC protection status.

## Arguments

$ARGUMENTS - Optional flags: `--fix` to suggest fixes, `--verbose` for detailed output

## Instructions

1. **Scan all API route files** in `app/api/**/route.ts`

2. **For each route file, check**:
   - Does it import `withRBAC` from `@/lib/rbac/middleware`?
   - Are all exported handlers (GET, POST, PUT, PATCH, DELETE) wrapped with `withRBAC`?
   - What permissions are required for each handler?

3. **Generate a report** with these sections:

### Report Format

```
## RBAC Audit Report

### Summary
- Total API routes scanned: X
- Protected routes: X
- Unprotected routes: X
- Routes needing review: X

### Unprotected Routes (CRITICAL)

These routes have NO RBAC protection:

| Route | Methods | Risk |
|-------|---------|------|
| /api/example | GET, POST | HIGH - no auth check |

### Protected Routes

| Route | Methods | Permissions |
|-------|---------|-------------|
| /api/patients | GET | patients:read |
| /api/patients | POST | patients:write |

### Permission Usage

| Permission | Used In |
|------------|---------|
| patients:read | /api/patients, /api/patients/[id], /api/patients/search |
| patients:write | /api/patients, /api/patients/[id] |

### Unused Permissions

These permissions are defined in types/rbac.ts but not used in any route:
- permission:name

### Recommendations

1. [Specific recommendations based on findings]
```

4. **Detection patterns**:

**Protected route** (GOOD):

```typescript
export const GET = withRBAC(
  async (req, { user, role }) => { ... },
  { permissions: ["resource:read"] }
)
```

**Unprotected route** (BAD):

```typescript
export async function GET(req: NextRequest) {
  // No RBAC wrapper!
}
```

**Partially protected** (NEEDS REVIEW):

```typescript
// GET is protected, POST is not
export const GET = withRBAC(handler, { permissions: [...] })
export async function POST(req) { ... }  // UNPROTECTED!
```

5. **Known exceptions** - These routes may intentionally skip RBAC:
   - `/api/auth/[...all]` - Better Auth handles its own auth
   - Public health check endpoints (if any)

6. **If `--fix` flag is provided**, suggest specific code changes:

```typescript
// BEFORE (unprotected):
export async function GET(req: NextRequest) {
  // ...
}

// AFTER (protected):
export const GET = withRBAC(
  async (req: NextRequest, { user, role }) => {
    // ...
  },
  { permissions: ["suggested:permission"] }
)
```

7. **Cross-reference with types/rbac.ts**:
   - Load all defined permissions from the `Permission` type
   - Compare against permissions actually used in routes
   - Report any permissions defined but never used
   - Report any permissions used but not defined (would be a TypeScript error anyway)

## Risk Levels

- **CRITICAL**: Route has no RBAC and handles sensitive data (patients, medical-records, billing)
- **HIGH**: Route has no RBAC and performs write operations
- **MEDIUM**: Route has RBAC but might need stricter permissions
- **LOW**: Public routes that are intentionally unprotected

## Example Output

```
## RBAC Audit Report

### Summary
- Total API routes scanned: 45
- Protected routes: 42
- Unprotected routes: 2
- Routes needing review: 1

### Unprotected Routes (CRITICAL)

| Route | Methods | Risk |
|-------|---------|------|
| /api/reports/export | GET | HIGH - exports patient data without auth |
| /api/debug/test | GET, POST | MEDIUM - debug endpoint exposed |

### Recommendations

1. **CRITICAL**: `/api/reports/export` handles patient data export but has no RBAC.
   Add: `withRBAC(handler, { permissions: ["system:reports"] })`

2. **HIGH**: `/api/debug/test` should be removed or protected in production.
   Consider: Delete this file or add admin-only protection.
```
