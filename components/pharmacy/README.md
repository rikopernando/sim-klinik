# Pharmacy (Farmasi) Module

## Overview

The Pharmacy module provides comprehensive medication management including drug master data, inventory tracking with batch/expiry management, prescription queue processing, and stock movement tracking with FEFO (First Expiry, First Out) principles.

## Architecture

### Directory Structure

```
pharmacy/
├── README.md                          # This file
├── types/pharmacy.ts                  # TypeScript type definitions
├── lib/pharmacy/
│   ├── stock-utils.ts                # Stock & expiry calculations
│   ├── validation.ts                 # Zod validation schemas
│   └── api-service.ts                # Database service layer
├── hooks/
│   ├── use-pharmacy-queue.ts         # Prescription queue hook
│   ├── use-prescription-fulfillment.ts # Fulfillment operations hook
│   └── use-expiring-drugs.ts         # Expiry tracking hook
├── app/api/
│   ├── drugs/route.ts                # Drug master CRUD API
│   ├── inventory/route.ts            # Stock management API
│   ├── pharmacy/
│   │   ├── queue/route.ts            # Prescription queue API
│   │   └── expiring/route.ts         # Expiry notification API
└── app/dashboard/pharmacy/page.tsx   # Pharmacy dashboard
```

## Database Schema

### Tables (Already Implemented)

- **`drugs`** - Drug master data
  - Name, generic name, category
  - Unit, price, minimum stock
  - Active status tracking

- **`drug_inventory`** - Batch-level stock tracking
  - Batch number, expiry date
  - Stock quantity, purchase price
  - Supplier, received date

- **`prescriptions`** - E-prescription data
  - Dosage, frequency, duration, quantity
  - Instructions, route
  - Fulfillment tracking (is_fulfilled, fulfilled_by, fulfilled_at)
  - Link to inventory batch (inventory_id)

- **`stock_movements`** - Stock transaction history
  - Movement type (in/out/adjustment/expired)
  - Quantity, reason, reference
  - Audit trail (performed_by, created_at)

## Key Features

### 1. **Drug Master Management**

✅ Complete CRUD operations
✅ Search by name or generic name (case-insensitive)
✅ Active/inactive status
✅ Total stock calculation across all batches
✅ Stock alert levels (critical/low/normal)
✅ Minimum stock tracking

### 2. **Inventory Management**

✅ Batch-level tracking with expiry dates
✅ Stock in/out operations
✅ Manual stock adjustments with reason tracking
✅ FEFO (First Expiry, First Out) sorting
✅ Automatic stock movement logging
✅ Purchase price and supplier tracking

### 3. **Expiry Management**

✅ Days until expiry calculation
✅ Alert levels (expired/expiring_soon/warning/safe)
✅ Color-coded alerts (red/orange/yellow/green)
✅ Expiry notification API (< 30 days)
✅ Formatted expiry date display with countdown
✅ Visual indicators on inventory cards

### 4. **Prescription Queue**

✅ Real-time pending prescriptions
✅ Auto-refresh every 30 seconds
✅ Patient and doctor information display
✅ Dosage, frequency, and quantity tracking
✅ Instructions and route display
✅ Queue count statistics

### 5. **Prescription Fulfillment**

✅ Stock availability validation
✅ Automatic stock deduction
✅ Batch selection (FEFO principle)
✅ Dispensed quantity tracking
✅ Fulfillment audit trail (fulfilled_by, fulfilled_at)
✅ Notes and special instructions
✅ Stock movement recording

### 6. **Stock Alerts**

✅ Critical stock (0 quantity)
✅ Low stock (≤ minimum stock)
✅ Color-coded indicators
✅ Reorder quantity suggestions
✅ Available stock calculation (excluding expired)

## Refactored Architecture

### Type System (`types/pharmacy.ts`)

Complete TypeScript coverage with:

- Entity types (Drug, DrugInventory, Prescription, StockMovement)
- Extended types (DrugWithStock, DrugInventoryWithDetails)
- Input types for API calls
- Alert level enums
- Response types

```typescript
import { Drug, DrugWithStock, DrugInventory } from "@/types/pharmacy"
```

### Utility Functions (`lib/pharmacy/stock-utils.ts`)

**Expiry Functions**:

```typescript
import {
  calculateDaysUntilExpiry,
  getExpiryAlertLevel,
  getExpiryAlertColor,
  getExpiryAlertLabel,
  formatExpiryDate,
} from "@/lib/pharmacy/stock-utils"
```

**Stock Functions**:

```typescript
import {
  getStockAlertLevel,
  getStockAlertColor,
  getStockAlertLabel,
  needsReorder,
  suggestReorderQuantity,
} from "@/lib/pharmacy/stock-utils"
```

**Inventory Functions**:

```typescript
import {
  calculateTotalStock,
  getAvailableStock,
  sortByFEFO,
  findBestBatchForDispensing,
  hasAvailableStock,
} from "@/lib/pharmacy/stock-utils"
```

**Display Functions**:

```typescript
import {
  formatCurrency,
  calculateStockValue,
  getStockStatusIcon,
  getExpiryStatusIcon,
} from "@/lib/pharmacy/stock-utils"
```

### Validation Schemas (`lib/pharmacy/validation.ts`)

Centralized Zod schemas:

```typescript
import {
  drugSchema,
  drugUpdateSchema,
  drugInventorySchema,
  prescriptionFulfillmentSchema,
  stockAdjustmentSchema,
  stockMovementSchema,
} from "@/lib/pharmacy/validation"
```

### Service Layer (`lib/pharmacy/api-service.ts`)

Database operations separated from API routes:

```typescript
import {
  getAllDrugsWithStock,
  getDrugById,
  searchDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
  getAllDrugInventory,
  getDrugInventoryByDrugId,
  addDrugInventory,
  getExpiringDrugs,
  getPendingPrescriptions,
  fulfillPrescription,
  adjustStock,
  getStockMovements,
} from "@/lib/pharmacy/api-service"
```

### Custom Hooks

**usePharmacyQueue**

```typescript
const {
  queue, // Pending prescriptions
  isLoading, // Loading state
  error, // Error state
  lastRefresh, // Last refresh timestamp
  refresh, // Manual refresh function
} = usePharmacyQueue({
  autoRefresh: true,
  refreshInterval: 30000,
})
```

**usePrescriptionFulfillment**

```typescript
const {
  fulfillPrescription, // Fulfill function
  isSubmitting, // Submit state
  error, // Error state
  success, // Success state
} = usePrescriptionFulfillment()
```

**useExpiringDrugs**

```typescript
const {
  expiringDrugs, // Grouped by alert level
  isLoading, // Loading state
  error, // Error state
  lastRefresh, // Last refresh timestamp
  refresh, // Manual refresh function
} = useExpiringDrugs({
  autoRefresh: true,
  refreshInterval: 60000,
})
```

## API Endpoints

### Drug Master

- `GET /api/drugs` - Get all drugs with stock
- `GET /api/drugs?search=query` - Search drugs
- `GET /api/drugs?id=1` - Get specific drug
- `POST /api/drugs` - Create new drug
- `PATCH /api/drugs` - Update drug
- `DELETE /api/drugs?id=1` - Soft delete drug

### Inventory Management

- `GET /api/inventory` - Get all inventory
- `GET /api/inventory?drugId=1` - Get inventory for specific drug
- `GET /api/inventory?movements=1` - Get stock movements
- `POST /api/inventory` - Add stock (stock in)
- `PATCH /api/inventory` - Adjust stock manually

### Prescription Queue

- `GET /api/pharmacy/queue` - Get pending prescriptions
- `POST /api/pharmacy/queue` - Fulfill prescription

### Expiry Notifications

- `GET /api/pharmacy/expiring` - Get drugs expiring < 30 days

## Usage Examples

### Create New Drug

```typescript
const response = await fetch("/api/drugs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Analgesics",
    unit: "Tablet",
    price: "2500",
    minimumStock: 100,
    description: "Pain reliever and fever reducer",
  }),
})
```

### Add Stock (Stock In)

```typescript
const response = await fetch("/api/inventory", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    drugId: 1,
    batchNumber: "B2025-001",
    expiryDate: "2026-12-31",
    stockQuantity: 500,
    purchasePrice: "2000",
    supplier: "PT. Pharma Indonesia",
  }),
})
```

### Fulfill Prescription

```typescript
const { fulfillPrescription } = usePrescriptionFulfillment()

await fulfillPrescription({
  prescriptionId: 1,
  inventoryId: 5,
  dispensedQuantity: 10,
  fulfilledBy: "pharmacist-123",
  notes: "Pasien sudah diberi instruksi",
})
```

### Check Expiring Drugs

```typescript
const { expiringDrugs } = useExpiringDrugs()

console.log(`Expired: ${expiringDrugs.expired.length}`)
console.log(`Expiring Soon: ${expiringDrugs.expiringSoon.length}`)
console.log(`Warning: ${expiringDrugs.warning.length}`)
```

## Utility Function Examples

### Calculate Days Until Expiry

```typescript
import { calculateDaysUntilExpiry, getExpiryAlertLevel } from "@/lib/pharmacy/stock-utils"

const days = calculateDaysUntilExpiry("2025-12-31") // 409
const alertLevel = getExpiryAlertLevel(days) // "safe"
```

### FEFO Sorting

```typescript
import { sortByFEFO } from "@/lib/pharmacy/stock-utils"

const sorted = sortByFEFO(inventories) // Sorted by expiry date (earliest first)
```

### Find Best Batch for Dispensing

```typescript
import { findBestBatchForDispensing } from "@/lib/pharmacy/stock-utils"

const batch = findBestBatchForDispensing(inventories, 50)
// Returns earliest expiring batch with sufficient stock
```

### Stock Alert Levels

```typescript
import { getStockAlertLevel } from "@/lib/pharmacy/stock-utils"

const alertLevel = getStockAlertLevel(5, 10) // "low"
const alertLevel2 = getStockAlertLevel(0, 10) // "critical"
```

## Performance Optimizations

✅ **Service Layer Separation** - Database logic isolated from API routes
✅ **Custom Hooks** - Reusable state management with auto-refresh
✅ **Type Safety** - Full TypeScript coverage prevents runtime errors
✅ **Utility Functions** - Centralized calculations avoid duplication
✅ **Auto-refresh** - Configurable polling for real-time updates
✅ **FEFO Principle** - Automatic expiry-based sorting
✅ **Batch Tracking** - Precise inventory management
✅ **Error Handling** - Consistent error patterns across all APIs

## Best Practices

### Type Safety

Always import and use types:

```typescript
import { DrugInput, PrescriptionFulfillmentInput } from "@/types/pharmacy"
```

### Use Service Layer

Don't write database queries in API routes:

```typescript
// ✅ Good
import { createDrug } from "@/lib/pharmacy/api-service";
const drug = await createDrug(data);

// ❌ Bad
const drug = await db.insert(drugs).values(...);
```

### Use Utility Functions

Don't duplicate logic:

```typescript
// ✅ Good
import { calculateDaysUntilExpiry } from "@/lib/pharmacy/stock-utils"
const days = calculateDaysUntilExpiry(expiryDate)

// ❌ Bad
const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
```

### Use Custom Hooks

Don't write API calls directly in components:

```typescript
// ✅ Good
const { queue, isLoading } = usePharmacyQueue();

// ❌ Bad
const [queue, setQueue] = useState([]);
useEffect(() => { fetch("/api/pharmacy/queue")... }, []);
```

## Dashboard Features

### Pharmacy Queue Dashboard

✅ **Statistics Cards**

- Pending prescriptions count
- Expired drugs (red)
- Expiring soon (< 30 days, orange)
- Warning (30-90 days, yellow)

✅ **Prescription Queue Tab**

- Patient and doctor information
- Drug details with dosage
- Frequency and duration
- Instructions and route
- Process prescription button
- Real-time auto-refresh (30s)

✅ **Expiring Drugs Tab**

- Color-coded cards by alert level
- Batch number display
- Formatted expiry dates with countdown
- Stock quantity and supplier info
- Visual indicators (red/orange/yellow borders)

✅ **Fulfillment Dialog**

- Inventory selection
- Dispensed quantity input
- Pharmacist name
- Optional notes
- Validation and error handling

## Integration Points

### With EMR Module

- Prescriptions created in EMR automatically appear in pharmacy queue
- Real-time notification when new prescription is created
- Drug search autocomplete for prescription form

### With Billing Module

- Drug prices from master data
- Dispensed quantities for billing calculation
- Fulfillment timestamp for audit

### With Inventory

- Automatic stock deduction on fulfillment
- Stock movement tracking for audit trail
- FEFO principle ensures oldest stock used first

## FEFO (First Expiry, First Out) Principle

The system implements FEFO to minimize waste:

1. **Sorting**: All inventory sorted by expiry date (earliest first)
2. **Batch Selection**: Automatically selects earliest expiring batch with sufficient stock
3. **Stock Deduction**: Reduces stock from the selected batch
4. **Alerts**: Proactive expiry notifications prevent waste

## Future Enhancements

- [ ] Drug interaction checking
- [ ] Barcode scanning for drug identification
- [ ] Automated reorder suggestions
- [ ] Supplier management
- [ ] Drug usage analytics and reporting
- [ ] Integration with external pharmacy systems
- [ ] Mobile app for pharmacist
- [ ] Batch recall management
- [ ] Cold chain monitoring for temperature-sensitive drugs
- [ ] Narcotic/controlled substance tracking

## Testing Considerations

### Unit Tests

- Utility functions (expiry calculation, FEFO sorting)
- Validation schemas
- Service layer functions

### Integration Tests

- API endpoints with mock database
- Custom hooks with mock fetch
- Fulfillment workflow

### E2E Tests

- Complete prescription flow (EMR → Pharmacy → Fulfillment)
- Stock management workflow
- Expiry alert system

## Related Modules

**Dependencies:**

- EMR Module (prescription creation)
- Registration Module (patient data)

**Integration Points:**

- Billing Module (drug pricing, fulfillment tracking)
- Inventory Module (stock management)

## Contributors

Module created with clean architecture principles:

- Modular design
- Type safety
- Service layer separation
- Reusable hooks
- Comprehensive utilities
- Centralized validation
- Complete documentation
- FEFO principle implementation
