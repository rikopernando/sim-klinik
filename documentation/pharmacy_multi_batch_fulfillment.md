# Plan: Fix Pharmacy Multi-Batch Stock Validation & Fulfillment

**Date:** 2026-02-05
**Branch:** `feat/unified-feedback-and-emergency`
**Status:** In Progress

## Problem

Stock validation in `bulk-fulfillment-dialog.tsx` checks only the **selected single batch** stock against required quantity. When no single batch has enough stock but the **total across all batches** is sufficient, it incorrectly shows "insufficient stock" and blocks submission.

Example: Need 62 units. Batch A (FEFO): 60, Batch B: 100, Batch C: 100. Total = 260 (sufficient), but system says "insufficient" because selected batch has only 60.

## Root Cause

1. **`stockIssues` memo** (`bulk-fulfillment-dialog.tsx:79`): Compares `selectedBatch.stockQuantity < dispensedQuantity` (single batch only)
2. **`findBestBatchForDispensing`** (`stock-utils.ts:219`): Returns single batch; falls back to first FEFO batch even when it has insufficient stock
3. **`FulfillmentFormData`** (`use-bulk-fulfillment-data.tsx:14`): Stores single `selectedBatch` and `inventoryId`
4. **`bulkFulfillPrescriptions`** (`api-service.ts:618`): Processes one `inventoryId` per prescription; would reject duplicate `prescriptionId` entries
5. **DB schema** (`inventory.ts:137`): `prescriptions.inventoryId` is a single reference

## Approach: Multi-Batch Allocation

Support splitting fulfillment across multiple batches when no single batch has enough stock. Existing `stockMovements` table already tracks per-batch deductions for audit.

---

## Files to Modify

| File                                                      | Changes                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `lib/pharmacy/stock-utils.ts`                             | Add `allocateBatchesForDispensing()` function                             |
| `components/pharmacy/hooks/use-bulk-fulfillment-data.tsx` | Add `allocatedBatches` to `FulfillmentFormData`, use new allocation       |
| `components/pharmacy/fulfillment/auto-batch-display.tsx`  | Display multi-batch allocation info                                       |
| `components/pharmacy/bulk-fulfillment-dialog.tsx`         | Fix `stockIssues` to use total stock; submit multi-batch entries          |
| `lib/pharmacy/api-service.ts`                             | Handle multi-batch entries per prescription in `bulkFulfillPrescriptions` |

---

## Implementation Steps

### Step 1: Add multi-batch allocation function

**File:** `lib/pharmacy/stock-utils.ts`

Add new function alongside existing `findBestBatchForDispensing`:

```typescript
export interface BatchAllocation {
  batch: DrugInventoryWithDetails
  quantity: number
}

/**
 * Allocate batches for dispensing using FEFO with multi-batch support
 * Returns array of {batch, quantity} allocations
 */
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

  // Return allocations (may be incomplete if total stock < required)
  return allocations
}
```

### Step 2: Update FulfillmentFormData and hook

**File:** `components/pharmacy/hooks/use-bulk-fulfillment-data.tsx`

- Import `allocateBatchesForDispensing` and `BatchAllocation` from `stock-utils`
- Add `allocatedBatches: BatchAllocation[]` field to `FulfillmentFormData`
- Add `totalAvailableStock: number` field
- In `loadBatches`, call `allocateBatchesForDispensing` instead of `findBestBatchForDispensing`
- Set `selectedBatch` to the first allocation's batch (for backward compatibility with manual override)
- Set `inventoryId` to the first allocation's batch id

### Step 3: Update auto-batch-display for multi-batch

**File:** `components/pharmacy/fulfillment/auto-batch-display.tsx`

- Accept new prop `allocatedBatches: BatchAllocation[]`
- When `allocatedBatches.length > 1`, show multi-batch allocation summary
- Show each batch with its allocated quantity

### Step 4: Fix stockIssues validation

**File:** `components/pharmacy/bulk-fulfillment-dialog.tsx`

- Change `stockIssues` to check **total available stock** instead of single batch
- Update `handleSubmit` to build multi-batch entries
- Update `isFormValid` to check allocated batches

### Step 5: Update API to handle multi-batch per prescription

**File:** `lib/pharmacy/api-service.ts`

- Group `fulfillmentRequests` by `prescriptionId`
- Update prescription once with total `dispensedQuantity` and primary `inventoryId`
- Deduct stock from each batch separately
- Record stock movements per batch for audit trail

---

## Verification

1. Navigate to `/dashboard/pharmacy`
2. Find a prescription where no single batch has enough stock (e.g., need 62, batches have 60 and 100)
3. Verify: No "insufficient stock" warning (total 160 >= 62)
4. Verify: Auto-batch shows multi-batch allocation if needed, or single sufficient batch
5. Manually override to a single batch via collapsible selector
6. Submit fulfillment - verify stock movements created for each batch
7. Verify: When total stock IS insufficient (e.g., need 200, total = 160), warning shows correctly
8. Run `npm run build` to verify no type errors
