# /analyze-db-performance - Database Performance Analyzer

Analyze database schema, queries, and indexes for performance issues.

## Arguments

$ARGUMENTS - Optional: specific table or route to analyze (e.g., `visits` or `/api/patients`)

## Instructions

### 1. Schema Index Analysis

Check all schema files in `db/schema/*.ts` for:

**Missing Indexes** - Look for columns that should be indexed:

```typescript
// GOOD - has index
mrNumber: varchar("mr_number", { length: 20 }).unique(), // unique creates index

// BAD - frequently queried but no index
status: varchar("status", { length: 20 }), // needs .index() if filtered often
```

**Foreign Key Indexes** - All foreign keys should have indexes:

```typescript
// Check these patterns have indexes:
patientId: uuid("patient_id").references(() => patients.id)
visitId: uuid("visit_id").references(() => visits.id)
doctorId: uuid("doctor_id").references(() => user.id)
```

### 2. Query Pattern Analysis

Scan API routes for problematic patterns:

**N+1 Queries** (BAD):

```typescript
// Fetches visits, then loops to get patient for each
const visits = await db.select().from(visits)
for (const visit of visits) {
  const patient = await db.select().from(patients).where(eq(patients.id, visit.patientId))
}
```

**Should be JOIN** (GOOD):

```typescript
const visitsWithPatients = await db
  .select()
  .from(visits)
  .leftJoin(patients, eq(visits.patientId, patients.id))
```

**Missing Pagination** (BAD):

```typescript
// Returns ALL records
const allPatients = await db.select().from(patients)
```

**Should have LIMIT** (GOOD):

```typescript
const patients = await db.select().from(patients).limit(limit).offset(offset)
```

### 3. Generate Report

````markdown
## Database Performance Report

### Summary

- Tables analyzed: X
- Potential issues found: X
- Critical: X | High: X | Medium: X

### Missing Indexes (CRITICAL)

| Table  | Column     | Usage Pattern             | Recommendation |
| ------ | ---------- | ------------------------- | -------------- |
| visits | status     | Filtered in queue queries | Add `.index()` |
| visits | created_at | Sorted in lists           | Add `.index()` |

### N+1 Query Issues (HIGH)

| File                    | Line | Issue                  | Fix          |
| ----------------------- | ---- | ---------------------- | ------------ |
| app/api/visits/route.ts | 45   | Loops to fetch patient | Use leftJoin |

### Missing Pagination (MEDIUM)

| Endpoint       | Issue                           |
| -------------- | ------------------------------- |
| GET /api/drugs | Returns all drugs without limit |

### Recommended Index Additions

Add to `db/schema/visits.ts`:

```typescript
// Add indexes for frequently filtered/sorted columns
status: varchar("status", { length: 20 }).notNull().default("waiting"),

// In table definition, add:
}, (table) => ({
  statusIdx: index("visits_status_idx").on(table.status),
  createdAtIdx: index("visits_created_at_idx").on(table.createdAt),
  patientIdIdx: index("visits_patient_id_idx").on(table.patientId),
}))
```
````

### Query Optimization Examples

**Before** (N+1):

```typescript
// app/api/example/route.ts:32
const visits = await db.select().from(visits).where(...)
const results = await Promise.all(visits.map(async v => ({
  ...v,
  patient: await db.select().from(patients).where(eq(patients.id, v.patientId))
})))
```

**After** (Single query):

```typescript
const results = await db
  .select({
    visit: visits,
    patient: patients,
  })
  .from(visits)
  .leftJoin(patients, eq(visits.patientId, patients.id))
  .where(...)
```

````

### 4. Check Drizzle Relations

Verify `db/schema/index.ts` exports relations properly for efficient queries:

```typescript
// Relations should be defined for Drizzle's relational queries
export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
  medicalRecords: many(medicalRecords),
}))
````

### 5. Specific Tables to Prioritize

Based on clinic workflow, these tables are queried most:

1. **visits** - Queue displays, doctor dashboards, filters by status/date
2. **patients** - Search by NIK/MR/name, list displays
3. **medical_records** - EMR views, history lookups
4. **prescriptions** - Pharmacy queue, fulfillment status
5. **billing** - Cashier queue, payment status

### 6. SQL Explain Analysis (Advanced)

If direct database access is available, suggest running:

```sql
-- Check for sequential scans on large tables
EXPLAIN ANALYZE SELECT * FROM visits WHERE status = 'waiting';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find missing indexes
SELECT relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY seq_tup_read DESC;
```
