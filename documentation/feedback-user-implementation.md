# User Feedback Implementation Summary

**Date:** 2026-01-27
**Branch:** `fix-feedback-user`
**Status:** Completed

---

## Overview

Implementation of 10 user feedback items from clinic management system demo. Feedback was prioritized by security impact and user experience.

---

## Implementation Details

### 1. RBAC on Dashboard Pages (#5) - High Priority

**Problem:** Pages lacked server-side protection (only API routes were protected).

**Solution:**

- Added server-side auth check in dashboard layout
- Created client-side permission hook with redirect capability

**Files Modified:**

- `app/dashboard/layout.tsx` - Added `getSession()` check with redirect to `/sign-in`
- `hooks/use-page-permission.ts` - New hook for client-side permission checking

**Usage:**

```typescript
// In dashboard layout (server-side)
const session = await getSession()
if (!session?.user) {
  redirect("/sign-in")
}

// In page components (client-side, optional)
const { isAuthorized, isLoading } = usePagePermission({
  permissions: ["billing:read"],
})
```

---

### 2. Outpatient Menu for Nurses (#10) - Medium Priority

**Problem:** Nurses needed access to poli queue and medical records for outpatient care.

**Solution:**

- Added write permissions for nurses to handle vitals, prescriptions, and procedures
- Added "Rawat Jalan" navigation section for nurses

**Files Modified:**

- `types/rbac.ts` - Added permissions: `visits:write`, `medical_records:write`, `prescriptions:write`
- `lib/rbac/navigation.ts` - Added "Rawat Jalan" section with Antrian Poli and Rekam Medis

**Nurse Permissions Added:**

- `visits:write` - Update visit vitals
- `medical_records:write` - Add vitals, procedures (except diagnosis)
- `prescriptions:write` - Add prescriptions

---

### 3. API Performance (#1) - High Priority

**Problem:** APIs felt slow, especially in production.

**Solution:**

- Added database indexes on frequently queried columns
- Created caching utility for read-heavy endpoints

**Files Modified:**

- `db/schema/inventory.ts` - Added indexes on prescriptions table:
  - `prescriptions_is_fulfilled_idx`
  - `prescriptions_medical_record_id_idx`
  - `prescriptions_visit_id_idx`
  - `prescriptions_drug_id_idx`
  - `prescriptions_created_at_idx`
  - `prescriptions_fulfilled_created_at_idx` (composite)

- `db/schema/visits.ts` - Added indexes:
  - `visits_arrival_time_idx`
  - `visits_arrival_time_status_idx` (composite)
  - `visits_visit_type_arrival_idx` (composite)

- `lib/cache/api-cache.ts` - New caching utility with TTL support

**Cache Usage:**

```typescript
import { shortCache, createCacheKey } from "@/lib/cache/api-cache"

const cacheKey = createCacheKey("visits", { poliId, status })
const cached = shortCache.get(cacheKey)
if (cached) return cached

const data = await fetchData()
shortCache.set(cacheKey, data)
```

---

### 4. Edit Visit Data (#2) - Medium Priority

**Problem:** Cannot edit visit data (poli, vitals) from patient queue.

**Solution:**

- Created edit visit dialog with tabs for visit info and vitals
- Added vitals API endpoint for CRUD operations
- Extended visit API to allow poliId updates

**Files Created:**

- `components/visits/edit-visit-dialog.tsx` - Edit form with poli, doctor, vitals
- `app/api/visits/[visitId]/vitals/route.ts` - Vitals GET and POST endpoints

**Files Modified:**

- `app/api/visits/[visitId]/route.ts` - Added `poliId` to allowed update fields
- `components/visits/queue-display.tsx` - Added edit action button

---

### 5. Cancel Visit (#3) - Medium Priority

**Problem:** Cannot cancel visit when patient doesn't proceed.

**Solution:**

- Created cancel dialog with required reason field
- Uses existing status API with state machine validation

**Files Created:**

- `components/visits/cancel-visit-dialog.tsx` - Confirmation dialog with reason input

**Files Modified:**

- `components/visits/queue-display.tsx` - Added cancel action in dropdown menu

---

### 6. Date Filter (#4) - Medium Priority

**Problem:** Queue only shows today's visits, need date filtering.

**Solution:**

- Added date query parameters to visits API
- Created date filter component with presets

**Files Created:**

- `components/visits/queue-date-filter.tsx` - Date picker with presets:
  - Hari Ini (Today)
  - Kemarin (Yesterday)
  - Minggu Ini (This Week)
  - Minggu Lalu (Last Week)
  - Bulan Ini (This Month)
  - Kustom (Custom range)

**Files Modified:**

- `app/api/visits/route.ts` - Added `date`, `dateFrom`, `dateTo` query params
- `app/dashboard/queue/page.tsx` - Integrated date filter
- `components/visits/queue-display.tsx` - Added date props

**API Usage:**

```
GET /api/visits?date=2024-01-15           # Specific date
GET /api/visits?dateFrom=2024-01-01&dateTo=2024-01-31  # Date range
GET /api/visits                           # Default: today
```

---

### 7. Stock Error Message (#7) - High Priority

**Problem:** No clear error message when pharmacy stock is empty. Additionally, stock was validated against a single batch only — when no single batch had enough stock but the total across all batches was sufficient (e.g., need 62 units, Batch A: 60, Batch B: 100), it incorrectly showed "insufficient stock".

**Solution (v1 - Initial):**

- Added pre-submit stock validation in bulk fulfillment
- Shows prominent warning for stock issues before submission
- Disabled submit button when stock issues exist

**Solution (v2 - Multi-Batch Enhancement):**

- Stock validation now checks **total available stock across all batches** instead of single batch
- Supports multi-batch fulfillment: when no single batch has enough, automatically splits across multiple batches using FEFO order
- Added allocation quantity validation: total allocated must match required quantity before submission
- Shows under-allocation and over-allocation warnings

**Files Modified:**

- `components/pharmacy/bulk-fulfillment-dialog.tsx`:
  - `stockIssues` checks total available stock across all batches (not single batch)
  - Added allocation validation: warns when total allocated doesn't match required quantity
  - `handleSubmit` pushes one entry per allocated batch for multi-batch support
  - `isFormValid` verifies allocated batches exist and total matches required
- `lib/pharmacy/api-service.ts` (`bulkFulfillPrescriptions`):
  - Groups requests by `prescriptionId` for multi-batch support
  - Updates prescription once with total dispensed quantity
  - Deducts stock from each batch separately in a single DB transaction
  - Records per-batch stock movements for audit trail

---

### 8. Auto FIFO Batch Selection (#8) - Medium Priority

**Problem:** Pharmacy shouldn't manually select batches for every prescription. Additionally, when no single batch had sufficient stock, the system had no way to split across multiple batches.

**Solution (v1 - Initial):**

- Implemented automatic batch selection using FEFO (First Expiry, First Out)
- Made manual batch selector collapsible (hidden by default)
- Created read-only display for auto-selected batch

**Solution (v2 - Multi-Batch Enhancement):**

- Auto-allocation now supports splitting across multiple batches when no single batch has enough stock
- Manual batch selector upgraded from single radio selection to multi-batch with checkboxes + quantity inputs per batch
- Auto-batch display shows multi-batch allocation summary (blue-themed card with each batch's contribution)
- Running total indicator: green (exact match), orange (under), red (over)

**Files Created:**

- `components/pharmacy/fulfillment/auto-batch-display.tsx` - Read-only batch info display with multi-batch support
- `documentation/pharmacy_multi_batch_fulfillment.md` - Implementation plan documentation

**Files Modified:**

- `lib/pharmacy/stock-utils.ts`:
  - Added `BatchAllocation` interface (`{ batch, quantity }`)
  - Added `allocateBatchesForDispensing()` — tries single batch first (FEFO), falls back to splitting across batches
- `components/pharmacy/hooks/use-bulk-fulfillment-data.tsx`:
  - Added `allocatedBatches` and `totalAvailableStock` to `FulfillmentFormData`
  - Uses `allocateBatchesForDispensing()` instead of `findBestBatchForDispensing()`
  - Replaced `handleBatchSelect` with `handleAllocationsChange`
- `components/pharmacy/fulfillment/batch-selector.tsx`:
  - Rewritten: checkboxes + quantity inputs per batch (multi-batch selection)
  - Auto-fills quantity with `min(stock, remaining)` when checking a batch
  - Running total bar at bottom
- `components/pharmacy/bulk-fulfillment/prescription-item.tsx`:
  - Updated props from `onBatchSelect` to `onAllocationsChange`
  - Passes `allocatedBatches` to AutoBatchDisplay and BatchSelector
- `components/pharmacy/fulfillment-dialog.tsx`:
  - Updated to use new BatchSelector API (allocatedBatches, onAllocationsChange)

**Multi-Batch FEFO Logic:**

```typescript
// From lib/pharmacy/stock-utils.ts
export function allocateBatchesForDispensing(
  inventories: DrugInventoryWithDetails[],
  requiredQuantity: number
): BatchAllocation[] {
  const availableBatches = sortByFEFO(
    inventories.filter((inv) => inv.expiryAlertLevel !== "expired" && inv.stockQuantity > 0)
  )
  // Try single batch first (preferred)
  const sufficientBatch = availableBatches.find((b) => b.stockQuantity >= requiredQuantity)
  if (sufficientBatch) {
    return [{ batch: sufficientBatch, quantity: requiredQuantity }]
  }
  // Multi-batch allocation in FEFO order
  const allocations: BatchAllocation[] = []
  let remaining = requiredQuantity
  for (const batch of availableBatches) {
    if (remaining <= 0) break
    const take = Math.min(batch.stockQuantity, remaining)
    allocations.push({ batch, quantity: take })
    remaining -= take
  }
  return allocations
}
```

---

### 9. Compounded Drug Route (#6) - Low Priority

**Problem:** Missing "obat racik" (compounded medication) option in prescription route.

**Solution:**

- Added "compounded" to medication routes

**Files Modified:**

- `types/medical-record.ts` - Added `{ value: "compounded", label: "Obat Racik" }` to `MEDICATION_ROUTES`
- `types/pharmacy.ts` - Added `"compounded"` to `RouteType` union

---

### 10. Doctor Dashboard Loader (#9) - Low Priority

**Problem:** No loader when data is loading on doctor dashboard.

**Solution:**

- Created skeleton loaders for statistics and queue sections
- Applied loading states from existing hooks

**Files Created:**

- `components/doctor/doctor-stats-skeleton.tsx` - 4-card skeleton grid
- `components/doctor/doctor-queue-skeleton.tsx` - Tabs and list items skeleton

**Files Modified:**

- `app/dashboard/doctor/page.tsx` - Shows skeletons when `statsLoading` or `queueLoading` is true

---

## Testing Checklist

- [x] **RBAC:** Test access to dashboard without login (should redirect to /sign-in)
- [x] **RBAC:** Test access based on user role, use usePagePermission for Client-side page-level permission checking with redirect (should redirect to /dashboard)
- [x] **Nurse Menu:** Login as nurse, verify Rawat Jalan menu appears
- [x] **API Performance:** Run `npm run db:push` to apply new indexes
- [x] **Edit Visit:** From queue page, click edit on a visit, change poli/doctor/vitals
  - should display old value vitals
- [x] **Cancel Visit:** From queue page, cancel a visit with reason
- [x] **Date Filter:** Test all presets (today, yesterday, custom range)
  - Instead of create some type of period (today, yesterday, custom range), let's make it simple with just date picker filter, with today as default.
- [x] **Stock Error:** Try fulfilling prescription with empty/insufficient stock
- [x] **Stock Error (Multi-Batch):** Verify no "insufficient stock" when total across batches is enough (e.g., need 62, batches have 60+100)
- [x] **Stock Error (Multi-Batch):** Verify warning shows when total stock IS insufficient (e.g., need 200, total = 160)
- [x] **Auto FIFO:** Verify auto-selected batch is earliest expiry with sufficient stock
- [x] **Auto FIFO (Multi-Batch):** Verify auto-allocation splits across batches when no single batch is enough
- [x] **Manual Multi-Batch:** Verify checkboxes + quantity inputs work for manual batch selection
- [x] **Allocation Validation:** Verify cannot submit when total allocated doesn't match required quantity
- [x] **Multi-Batch Fulfillment:** Submit multi-batch fulfillment, verify stock movements created per batch
- [x] **Compounded Route:** Create prescription with "Obat Racik" route
- [x] **Doctor Loader:** Verify skeletons show during initial load

---

## Database Migration

After deployment, run the following to apply new indexes:

```bash
npm run db:push
```

Or generate and apply migration:

```bash
npm run db:generate
npm run db:push
```

---

## Related Documentation

- `documentation/feedback-user.md` - Original feedback items
- `documentation/rbac_implementation_guide.md` - RBAC system details
- `documentation/visit_status_lifecycle.md` - Visit status state machine
- `documentation/pharmacy_multi_batch_fulfillment.md` - Multi-batch fulfillment implementation plan
