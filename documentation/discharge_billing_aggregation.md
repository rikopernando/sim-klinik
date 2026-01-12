# Discharge Billing Aggregation System

**Version**: 1.0
**Date**: 2026-01-02
**Status**: ✅ Implemented

## Overview

The Discharge Billing Aggregation System automatically collects and aggregates all billable charges for inpatient visits, creating a comprehensive billing record ready for payment processing.

## Purpose

When a patient is ready for discharge from inpatient care, the system needs to:

1. Calculate room/bed charges based on days stayed
2. Aggregate all material usage from nursing care
3. Include all fulfilled prescriptions from pharmacy
4. Add completed medical procedures
5. Include any other billable services
6. Generate a complete billing record with all line items

## Architecture

### Core Components

#### 1. **Discharge Aggregation Utility** (`lib/billing/discharge-aggregation.ts`)

The main utility module that handles all aggregation logic.

**Key Functions**:

- `aggregateDischargebilling(visitId)` - Main aggregation function
- `getDischargeBillingSummary(visitId)` - Get formatted summary for UI

**Internal Helpers**:

- `aggregateRoomCharges()` - Calculate room charges by days stayed
- `aggregateMaterialCharges()` - Collect material usage
- `aggregateMedicationCharges()` - Collect fulfilled prescriptions
- `aggregateProcedureCharges()` - Collect completed procedures
- `aggregateServiceCharges()` - Collect other services

#### 2. **Billing API Service** (`lib/billing/api-service.ts`)

Server-side database operations.

**Added Function**:

- `createInpatientDischargeBilling(visitId, tx?)` - Create billing from aggregation

### Data Flow

```
1. Patient Ready for Discharge
   ↓
2. Call aggregateDischargebilling(visitId)
   ↓
3. Parallel Aggregation:
   ├─ Room Charges (bedAssignments + rooms)
   ├─ Materials (materialUsage)
   ├─ Medications (prescriptions + inventoryItems)
   ├─ Procedures (procedures + services)
   └─ Services (future)
   ↓
4. Combine All Items
   ↓
5. Calculate Breakdown & Subtotal
   ↓
6. Return DischargeBillingAggregate
   ↓
7. createInpatientDischargeBilling() creates billing record
   ↓
8. Insert billing + billing items
   ↓
9. Ready for Payment Processing
```

## Billing Item Types

### 1. Room Charges

**Source**: `bedAssignments` + `rooms` tables
**Calculation**: `dailyRate × daysStayed` (rounded up, minimum 1 day)
**Example**:

```typescript
{
  itemType: "room",
  itemName: "Kamar VIP - 201 (Bed A)",
  itemCode: "201",
  quantity: 3, // days
  unitPrice: "500000.00",
  totalPrice: "1500000.00",
  description: "Biaya rawat inap 3 hari"
}
```

### 2. Material Charges

**Source**: `materialUsage` table
**Filtering**: All materials used during visit
**Example**:

```typescript
{
  itemType: "material",
  itemName: "Sarung Tangan Steril",
  quantity: 10,
  unitPrice: "5000.00",
  totalPrice: "50000.00",
  description: "10 pcs"
}
```

### 3. Medication Charges

**Source**: `prescriptions` + `inventoryItems` tables
**Filtering**: Only `isFulfilled = true`
**Example**:

```typescript
{
  itemType: "drug",
  itemName: "Amoxicillin 500mg",
  quantity: 30,
  unitPrice: "1500.00",
  totalPrice: "45000.00",
  description: "500mg - 3x daily"
}
```

### 4. Procedure Charges

**Source**: `procedures` + `services` tables
**Filtering**: Only `status = 'completed'`
**Example**:

```typescript
{
  itemType: "service",
  itemName: "Pemasangan Infus",
  itemCode: "99.15",
  quantity: 1,
  unitPrice: "100000.00",
  totalPrice: "100000.00",
  description: "Pemasangan infus untuk pemberian obat"
}
```

## Usage Examples

### Server-Side Usage

```typescript
import {
  aggregateDischargebilling,
  getDischargeBillingSummary,
} from "@/lib/billing/discharge-aggregation"
import { createInpatientDischargeBilling } from "@/lib/billing/api-service"

// Example 1: Get aggregation data
const aggregate = await aggregateDischargebilling(visitId)
console.log(aggregate)
// {
//   visitId: "visit-123",
//   items: [...], // All billing items
//   breakdown: {
//     roomCharges: "1500000.00",
//     materialCharges: "250000.00",
//     medicationCharges: "500000.00",
//     procedureCharges: "300000.00",
//     serviceCharges: "0.00"
//   },
//   subtotal: "2550000.00",
//   itemCount: 25
// }

// Example 2: Get formatted summary for UI
const summary = await getDischargeBillingSummary(visitId)
console.log(summary)
// {
//   visitId: "visit-123",
//   breakdown: {
//     roomCharges: {
//       label: "Biaya Kamar & Rawat Inap",
//       amount: "1500000.00",
//       count: 1
//     },
//     materialCharges: {
//       label: "Alat Kesehatan & Material",
//       amount: "250000.00",
//       count: 12
//     },
//     // ... other categories
//   },
//   subtotal: "2550000.00",
//   totalItems: 25
// }

// Example 3: Create billing record from aggregation
const billingId = await createInpatientDischargeBilling(visitId)
```

### API Endpoint (To Be Implemented)

```typescript
// POST /api/billing/inpatient/create
// Body: { visitId: string }
// Response: { billingId: string, subtotal: string, itemCount: number }
```

## Business Rules

### Room Charge Calculation

- **Minimum**: 1 day (even if discharged same day)
- **Rounding**: Days are rounded UP (2.1 days = 3 days)
- **Calculation**: `Math.ceil(millisecondsDiff / (1000 * 60 * 60 * 24))`

### Material Inclusion

- **All materials** recorded for the visit are included
- No filtering by date or status
- Uses `totalPrice` as recorded in `materialUsage`

### Medication Inclusion

- **Only fulfilled prescriptions** (`isFulfilled = true`)
- Uses `dispensedQuantity` if available, otherwise `quantity`
- Price from `inventoryItems.price`

### Procedure Inclusion

- **Only completed procedures** (`status = 'completed'`)
- Price from `services` table via `serviceId`
- Falls back to description if service not found

## Performance Optimizations

### Parallel Aggregation

All aggregation functions run in parallel using `Promise.all()`:

```typescript
const [roomItems, materialItems, medicationItems, procedureItems, serviceItems] = await Promise.all(
  [
    aggregateRoomCharges(visitId),
    aggregateMaterialCharges(visitId),
    aggregateMedicationCharges(visitId),
    aggregateProcedureCharges(visitId),
    aggregateServiceCharges(visitId),
  ]
)
```

### Efficient Queries

- Single query per aggregation type
- Proper JOIN usage to minimize N+1 queries
- Indexed columns (`visitId`, `isFulfilled`, `status`)

### Lazy Loading

The aggregation module is lazy-loaded when needed:

```typescript
const { aggregateDischargebilling } = await import("./discharge-aggregation")
```

## Error Handling

### Visit Validation

```typescript
if (!visit) {
  throw new Error(`Visit not found: ${visitId}`)
}

if (visit.visitType !== "inpatient") {
  throw new Error(`Visit ${visitId} is not an inpatient visit`)
}
```

### Empty Items Check

```typescript
if (aggregate.items.length === 0) {
  throw new Error(
    "Tidak ada item yang dapat ditagihkan. Pastikan pasien memiliki catatan rawat inap."
  )
}
```

## Database Schema Dependencies

### Tables Used

- `visits` - Visit information
- `bedAssignments` - Room assignment history
- `rooms` - Room details and pricing
- `materialUsage` - Material consumption records
- `prescriptions` - Medication orders
- `inventoryItems` - Drug/material master data
- `procedures` - Medical procedures
- `services` - Service pricing

### Key Relationships

```sql
bedAssignments.visitId → visits.id
bedAssignments.roomId → rooms.id
materialUsage.visitId → visits.id
prescriptions.visitId → visits.id
prescriptions.drugId → inventoryItems.id
procedures.visitId → visits.id
procedures.serviceId → services.id
```

## Testing Checklist

### Unit Tests (To Be Created)

- [ ] Room charge calculation with various stay durations
- [ ] Material aggregation with multiple items
- [ ] Medication aggregation filtering (fulfilled vs unfulfilled)
- [ ] Procedure aggregation filtering (completed vs ordered)
- [ ] Empty visit handling
- [ ] Non-inpatient visit rejection

### Integration Tests (To Be Created)

- [ ] Full discharge billing creation
- [ ] Billing item insertion
- [ ] Transaction rollback on error
- [ ] Parallel aggregation performance

### Manual Testing

- [ ] Create inpatient visit with bed assignment
- [ ] Record materials, prescriptions, procedures
- [ ] Run aggregation and verify totals
- [ ] Create billing and verify items
- [ ] Check payment workflow

## Future Enhancements

### Service Charge Aggregation

Currently returns empty array. Can be expanded to include:

- Doctor consultation fees
- Nursing care fees
- Emergency room fees
- Other billable services

### Customization Options

- Configurable discount rules for long stays
- Insurance integration
- Payment plan support
- Multi-currency support

### Reporting

- Discharge summary report
- Itemized billing statement
- Insurance claim forms
- Revenue analytics

## Migration Notes

### From Legacy System

If migrating from a manual billing system:

1. Ensure all bed assignments have proper dates
2. Verify room daily rates are set
3. Confirm material prices are up to date
4. Check service codes match procedures

### Backward Compatibility

- Material usage supports both `itemId` (new) and `serviceId` (legacy)
- Falls back gracefully if services not found
- Handles missing data without crashing

## Related Documentation

- `material_recording_refactoring.md` - Material usage system
- `inpatient_implementation_plan.md` - Inpatient module overview
- `backend_structure_document.md` - Database schema design
- `billing_module_requirements.md` - Billing requirements (if exists)

## Change Log

### Version 1.0 (2026-01-02)

- ✅ Initial implementation
- ✅ Parallel aggregation for performance
- ✅ Comprehensive error handling
- ✅ Support for all major charge types
- ✅ Room charge calculation with proper rounding
- ✅ Fulfilled prescription filtering
- ✅ Completed procedure filtering
- ✅ Lazy loading optimization
- ✅ TypeScript types and interfaces
- ✅ Detailed JSDoc documentation

## Summary

The Discharge Billing Aggregation System provides a robust, performant, and maintainable solution for automatically calculating inpatient discharge costs. It:

- **Aggregates** room, material, medication, and procedure charges
- **Validates** visit type and data completeness
- **Calculates** accurate totals with proper business rules
- **Performs** efficiently with parallel queries
- **Integrates** seamlessly with existing billing workflow
- **Documents** comprehensively for future maintenance

**Status**: Ready for API endpoint creation and frontend integration.
