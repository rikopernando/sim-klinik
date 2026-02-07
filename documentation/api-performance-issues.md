# API Performance Issues Tracker

## Overview

**Analysis Date**: January 20, 2026
**Analyzed By**: Claude Code Performance Analyzer

### Summary Statistics

| Severity  | Count | Status       |
| --------- | ----- | ------------ |
| Critical  | 1     | **Resolved** |
| Medium    | 3     | Pending      |
| Minor     | 2     | Pending      |
| **Total** | **6** | -            |

---

## Critical Issues

- [x] **Sequential queries in Medical Records endpoint**
  - **Location**: `app/api/medical-records/[visitId]/route.ts:63-125`
  - **Problem**: 5 sequential database queries instead of parallel execution
  - **Impact**: Each query waits for the previous one to complete, significantly increasing response time
  - **Recommended Fix**: Use `Promise.all()` for independent queries

  ```typescript
  // Before (sequential)
  const visit = await db.query...
  const diagnoses = await db.query...
  const procedures = await db.query...

  // After (parallel)
  const [visit, diagnoses, procedures] = await Promise.all([
    db.query...,
    db.query...,
    db.query...
  ])
  ```

  - **Resolved**: 2026-01-20

---

## Medium Issues

- [ ] **Sequential queries in Billing Calculation**
  - **Location**: `lib/billing/api-service.ts:533-679`
  - **Problem**: 6+ sequential database queries for billing calculation
  - **Impact**: Slow billing page load, especially for patients with multiple services
  - **Recommended Fix**: Consolidate into fewer queries using JOINs or parallelize independent queries
  - **Resolved**: _pending_

- [ ] **Sequential queries in Inpatient Patient Detail**
  - **Location**: `lib/inpatient/api-service.ts:594-758`
  - **Problem**: 8+ sequential database queries for patient detail retrieval
  - **Impact**: Slow inpatient dashboard, delayed vitals display
  - **Recommended Fix**: Use `Promise.all()` for independent queries and consolidate related data fetches
  - **Resolved**: _pending_

- [ ] **Patient Search Wildcard Pattern**
  - **Location**: `app/api/patients/search/route.ts:67`
  - **Problem**: Full wildcard search `%query%` without trigram index support
  - **Impact**: Full table scan on large patient datasets, slow search response
  - **Recommended Fix**:
    - Add PostgreSQL `pg_trgm` extension and GIN index
    - Or use prefix matching `query%` with B-tree index
    - Consider implementing search caching for common queries
  - **Resolved**: _pending_

---

## Minor Issues

- [ ] **No Response Caching for Master Data**
  - **Location**: Multiple master data endpoints
    - `app/api/master-data/polis/route.ts`
    - `app/api/master-data/rooms/route.ts`
    - `app/api/master-data/services/route.ts`
  - **Problem**: Missing `Cache-Control` headers for relatively static data
  - **Impact**: Unnecessary database hits for data that rarely changes
  - **Recommended Fix**: Add appropriate cache headers

  ```typescript
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  })
  ```

  - **Resolved**: _pending_

- [ ] **No Explicit Connection Pooling Configuration**
  - **Location**: `db/index.ts:14`
  - **Problem**: Using default postgres.js connection configuration
  - **Impact**: May not be optimal for production workloads
  - **Recommended Fix**: Configure explicit pool settings

  ```typescript
  const client = postgres(connectionString, {
    max: 20, // Maximum connections
    idle_timeout: 30, // Close idle connections after 30s
    connect_timeout: 10,
  })
  ```

  - **Resolved**: _pending_

---

## Good Practices (Reference)

These patterns in the codebase demonstrate well-optimized implementations:

### Pharmacy Queue - Single Query with JOINs

**Location**: `app/api/pharmacy/queue/route.ts`

- Uses a single query with 7 JOINs to fetch all related data
- Avoids N+1 query problem
- Good example of efficient data fetching

### Doctor Queue - Efficient JOIN Query

**Location**: `app/api/doctor/queue/route.ts`

- Single optimized query for queue data
- Proper use of LEFT JOINs for optional relationships

### Role Caching with TTL

**Location**: `lib/rbac/session.ts`

- 60-second TTL cache for role lookups
- Reduces database hits for frequent permission checks
- Good pattern for semi-static data

### Vitals Window Function

**Location**: Inpatient vitals queries

- Uses SQL window functions for time-series data
- Efficient for "latest N records" patterns

---

## Changelog

Track issue resolutions here:

| Date       | Issue                                 | Resolution                                  | PR/Commit |
| ---------- | ------------------------------------- | ------------------------------------------- | --------- |
| 2026-01-20 | Sequential queries in Medical Records | Parallelized 4 queries with `Promise.all()` | -         |

---

## How to Use This Document

1. **When fixing an issue**:
   - Mark the checkbox as complete: `- [x]`
   - Update the "Resolved" field with the date
   - Add entry to Changelog with PR link

2. **When adding new issues**:
   - Add to appropriate severity section
   - Include location, problem, impact, and recommended fix
   - Update the Summary Statistics table

3. **Priority Order**:
   - Fix Critical issues first
   - Medium issues for next sprint
   - Minor issues as time permits
