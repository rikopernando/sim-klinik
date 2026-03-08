# /analyze-api-performance - API Performance Analyzer

Analyze API routes for performance bottlenecks and optimization opportunities.

## Arguments

$ARGUMENTS - Optional: specific route to analyze (e.g., `/api/patients` or `pharmacy`)

## Instructions

### 1. RBAC Overhead Analysis

The `withRBAC` middleware runs on every protected request. Check for:

**Session/Role Caching** - Currently in `lib/rbac/session.ts`:

```typescript
// Current: Makes DB call every time
export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}

// Current: Makes another DB call
export async function getUserRole(userId: string) {
  const result = await db.select()...
}
```

**Optimization opportunities**:

- Cache session in request context
- Cache role/permissions (they rarely change)
- Combine session + role lookup into single query

### 2. Endpoint Analysis

For each API route, check:

**Multiple Sequential Queries** (BAD):

```typescript
export const GET = withRBAC(async (req, { user }) => {
  // Query 1
  const visit = await db.select().from(visits).where(...)
  // Query 2 (depends on visit)
  const patient = await db.select().from(patients).where(...)
  // Query 3 (depends on visit)
  const records = await db.select().from(medicalRecords).where(...)
  // Query 4
  const diagnoses = await db.select().from(diagnoses).where(...)
})
```

**Should be Single Query with Joins**:

```typescript
const result = await db
  .select()
  .from(visits)
  .leftJoin(patients, eq(visits.patientId, patients.id))
  .leftJoin(medicalRecords, eq(medicalRecords.visitId, visits.id))
  .where(...)
```

### 3. Common Slow Endpoints to Check

Based on clinic workflows, these are likely slow:

| Endpoint                             | Why It's Slow                              | Check For                    |
| ------------------------------------ | ------------------------------------------ | ---------------------------- |
| `GET /api/pharmacy/queue`            | Complex joins, status filters              | N+1, missing index on status |
| `GET /api/dashboard/doctor/queue`    | Multiple table joins                       | Unoptimized query            |
| `GET /api/patients/search`           | LIKE queries                               | Missing text search index    |
| `GET /api/medical-records/[visitId]` | Loads diagnoses, prescriptions, procedures | N+1 queries                  |
| `GET /api/billing/[visitId]`         | Aggregates from multiple tables            | Multiple queries             |
| `GET /api/inpatient/patients`        | Complex status + room joins                | Missing indexes              |

### 4. Generate Performance Report

````markdown
## API Performance Report

### Summary

- Routes analyzed: X
- Potential issues: X
- Estimated DB calls per request: X (should be 1-3)

### Critical Issues

#### Endpoint: GET /api/pharmacy/queue

**Current DB Calls**: 5+ per request
**Issues Found**:

1. N+1 query fetching patient for each prescription
2. No caching of drug master data
3. Missing index on prescription.status

**Recommended Fix**:

```typescript
// Single query with joins
const queue = await db
  .select({
    prescription: prescriptions,
    patient: patients,
    drug: drugs,
    visit: visits,
  })
  .from(prescriptions)
  .innerJoin(medicalRecords, eq(prescriptions.medicalRecordId, medicalRecords.id))
  .innerJoin(visits, eq(medicalRecords.visitId, visits.id))
  .innerJoin(patients, eq(visits.patientId, patients.id))
  .innerJoin(drugs, eq(prescriptions.drugId, drugs.id))
  .where(eq(prescriptions.status, "pending"))
  .orderBy(desc(prescriptions.createdAt))
  .limit(50)
```
````

### Medium Issues

#### Endpoint: GET /api/patients/search

**Issue**: LIKE query without proper indexing
**Current**:

```typescript
like(patients.name, `%${search}%`) // Full table scan
```

**Recommendation**: Add trigram index for pattern matching or use prefix search:

```typescript
like(patients.name, `${search}%`) // Can use B-tree index
```

### RBAC Optimization Needed

**Current overhead per request**: ~3 DB calls before handler runs

- getSession: 1 call
- getUserRole: 1 call
- hasPermission: potentially 1 more call

**Recommendation**: Cache in request-scoped store or use single combined query

````

### 5. Caching Recommendations

**Static/Semi-Static Data** (cache for hours):
- Drug master data (`/api/drugs`)
- Service tariffs (`/api/services`)
- ICD-10 codes (`/api/icd10/search`)
- Poli list (`/api/master-data/polis`)
- Room configurations (`/api/master-data/rooms`)

**Session Data** (cache per request):
- User session + role + permissions

**Short-lived Cache** (cache for seconds):
- Queue counts
- Dashboard stats

### 6. Quick Wins

1. **Add response caching headers** for static data:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600', // 1 hour
  }
})
````

2. **Use `select` to limit columns**:

```typescript
// BAD: fetches all columns
const patients = await db.select().from(patients)

// GOOD: only needed columns
const patients = await db
  .select({
    id: patients.id,
    name: patients.name,
    mrNumber: patients.mrNumber,
  })
  .from(patients)
```

3. **Add database connection pooling** in `db/index.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // max connections
  idleTimeoutMillis: 30000,
})
```

### 7. Monitoring Suggestions

Add logging to identify slow queries:

```typescript
const start = performance.now()
const result = await db.select()...
const duration = performance.now() - start
if (duration > 100) {
  console.warn(`Slow query (${duration.toFixed(0)}ms):`, queryDescription)
}
```
