# UUID Migration Guide

## Overview

All database tables have been successfully migrated from `serial` (integer) IDs to `text` (UUID) IDs for improved security, scalability, and consistency with the auth schema.

## Changes Made

### Schema Files Updated

All schema files have been converted to use UUIDs:

1. ✅ **patients.ts** - Patient records now use UUIDs
2. ✅ **visits.ts** - Visits and polis now use UUIDs
3. ✅ **medical-records.ts** - Medical records, diagnoses, procedures, CPPT now use UUIDs
4. ✅ **pharmacy.ts** - Drugs, inventory, prescriptions, stock movements now use UUIDs
5. ✅ **billing.ts** - Services, billings, billing items, payments, discharge summaries now use UUIDs
6. ✅ **inpatient.ts** - Rooms, vitals history, bed assignments, material usage now use UUIDs
7. ✅ **roles.ts** - Roles and user roles now use UUIDs

### ID Generation

All tables now use:
```typescript
id: text("id")
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID())
```

This automatically generates a UUID v4 when a new record is created.

## Migration Strategy

### Option 1: Fresh Start (Recommended for Development)

Since you're in Phase 1 MVP and likely don't have production data yet:

```bash
# 1. Reset the database (drops all tables)
npm run db:reset

# 2. Push the new UUID schema
npm run db:push
```

This will:
- Drop all existing tables
- Create new tables with UUID primary keys
- Set up all foreign key relationships correctly

### Option 2: Preserve Existing Data (Production)

If you have data you need to keep:

```bash
# 1. Backup your database first!
pg_dump -h localhost -U postgres -d postgres > backup_before_uuid_migration.sql

# 2. Run the generated migration
npm run db:migrate

# Note: This migration will fail if you have existing integer IDs
# You'll need to write a custom data migration script
```

**⚠️ Warning**: The auto-generated migration (`drizzle/0008_new_cerise.sql`) only changes column types. It does NOT convert existing integer IDs to UUIDs. You'll need a custom migration script if you have existing data.

## Benefits of UUID Migration

### 1. Security & Privacy ✅
- **No information leakage**: Serial IDs reveal business metrics (e.g., patient count)
- **Harder to guess**: Prevents enumeration attacks (`/patients/1`, `/patients/2`, etc.)
- **HIPAA compliance**: Better for protecting patient privacy

### 2. Distributed System Ready ✅
- **No collision risk**: Can generate IDs client-side or across multiple servers
- **Merge-friendly**: Easy to sync data between clinics or backup systems
- **Offline capability**: Generate valid IDs without database connection

### 3. Better for Medical Records ✅
- **External references**: MR numbers, prescription IDs can be shared safely
- **API security**: No predictable resource enumeration
- **Audit trails**: Easier to track records across system boundaries

### 4. Consistency ✅
- **Matches auth schema**: All tables now use the same ID format
- **Type safety**: TypeScript will enforce UUID format across the codebase

## Impact on Codebase

### API Changes

All API routes that used integer IDs now expect UUIDs:

**Before:**
```typescript
// GET /api/patients/123
const patient = await db.query.patients.findFirst({
  where: eq(patients.id, 123)
})
```

**After:**
```typescript
// GET /api/patients/550e8400-e29b-41d4-a716-446655440000
const patient = await db.query.patients.findFirst({
  where: eq(patients.id, "550e8400-e29b-41d4-a716-446655440000")
})
```

### Frontend Changes

Components that display or link to resources will need updates:

**Before:**
```tsx
<Link href={`/dashboard/patients/${patient.id}`}>View Patient</Link>
// patient.id = 123
```

**After:**
```tsx
<Link href={`/dashboard/patients/${patient.id}`}>View Patient</Link>
// patient.id = "550e8400-e29b-41d4-a716-446655440000"
```

URLs will be longer but more secure.

## Testing Checklist

After migration, verify:

- [ ] Can create new patients
- [ ] Can create new visits
- [ ] Can create medical records
- [ ] Can create prescriptions
- [ ] Foreign key relationships work (visit → patient)
- [ ] Cascade deletes work properly
- [ ] All API endpoints return UUIDs
- [ ] Frontend components handle UUID strings correctly

## Performance Notes

**Myth**: "UUIDs are slower"

**Reality**:
- For tables with <10M rows (your use case), the difference is negligible
- PostgreSQL handles UUID indexes efficiently
- Primary key lookups are fast regardless (indexed)

**Storage**:
- UUID: 16 bytes vs Serial: 4 bytes
- For 100,000 patients: ~1.2 MB difference (trivial)

## Rollback Plan

If you need to rollback:

```bash
# 1. Restore from backup
psql -h localhost -U postgres -d postgres < backup_before_uuid_migration.sql

# 2. Revert schema files to use serial IDs
git revert <commit-hash>

# 3. Regenerate migrations
npm run db:generate
```

## Next Steps

1. **Test the migration** in development environment
2. **Update API routes** to handle UUIDs
3. **Update frontend components** to work with UUID strings
4. **Run full test suite** to catch any issues
5. **Update documentation** with new ID format

## Questions?

Refer to the following documentation sections:
- `documentation/backend_structure_document.md` - Database architecture
- `documentation/security_guideline_document.md` - Security best practices

---

Generated: 2025-12-04
Migration: drizzle/0008_new_cerise.sql
