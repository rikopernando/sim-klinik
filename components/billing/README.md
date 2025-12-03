# Billing, Cashier & Patient Discharge Module

## Overview

The Billing module provides comprehensive financial management including automated billing aggregation (billing engine), payment processing with automatic change calculation, billing gate for discharge control, and discharge summary generation. This is the final critical module that ensures no patient is discharged without payment completion.

## Architecture

### Directory Structure

```
billing/
├── README.md                           # This file
├── types/billing.ts                    # TypeScript type definitions
├── lib/billing/
│   ├── billing-utils.ts               # Calculations & formatting
│   ├── validation.ts                  # Zod validation schemas
│   └── api-service.ts                 # Database service layer (Billing Engine)
├── hooks/
│   ├── use-billing.ts                 # Billing operations hook
│   ├── use-payment.ts                 # Payment processing hook
│   └── use-discharge.ts               # Discharge operations hook
├── app/api/
│   ├── billing/
│   │   ├── route.ts                   # Billing CRUD & Billing Engine API
│   │   ├── payment/route.ts           # Payment processing API
│   │   └── discharge/route.ts         # Discharge & billing gate API
└── app/dashboard/cashier/page.tsx     # Cashier dashboard with sticky total
```

## Database Schema

### Tables (Already Implemented)

- **`services`** - Master data for billable services
  - Code, name, service type, price
  - Category for grouping/reports
  - Active status tracking

- **`billings`** - Main billing record per visit
  - Subtotal, discount, tax, total amount
  - Insurance coverage, patient payable
  - Payment status (pending/partial/paid)
  - Paid amount, remaining amount
  - Payment method, reference, cashier info

- **`billing_items`** - Individual line items
  - Item type (service/drug/material/room)
  - Quantity, unit price, subtotal, discount, total
  - Links to source items (services, drugs, etc.)

- **`payments`** - Payment transaction tracking
  - Supports partial payments
  - Amount, payment method, reference
  - Cash handling (amount received, change given)
  - Cashier tracking (received_by, received_at)

- **`discharge_summaries`** - Medical discharge summaries
  - Admission & discharge diagnoses
  - Clinical summary, procedures performed
  - Medications on discharge
  - Discharge instructions, dietary/activity restrictions
  - Follow-up date and instructions
  - Doctor signature (discharged_by, discharged_at)

## Key Features

### 1. **Billing Engine** (Automatic Aggregation)

✅ Automatically aggregates ALL charges from a visit:

- **Fulfilled prescriptions** (drugs) from pharmacy
- **Material usage** from inpatient care
- **Room charges** with automatic day calculation
- **Services** from procedures/consultations
  ✅ Smart calculation of total days stayed for room charges
  ✅ Discount support (fixed amount or percentage)
  ✅ Insurance coverage handling
  ✅ Tax calculation support
  ✅ Patient payable calculation (total - insurance)

### 2. **Payment Processing**

✅ Multiple payment methods (cash, transfer, card, insurance)
✅ **Automatic change calculation** for cash payments
✅ Partial payment support
✅ Payment history tracking
✅ Real-time balance updates
✅ Payment status determination (pending/partial/paid)
✅ Cashier audit trail

### 3. **Billing Gate Logic** ⭐ **CRITICAL FEATURE**

✅ **Prevents patient discharge if payment is not complete**
✅ Checks payment_status before allowing discharge
✅ Returns clear error messages with remaining balance
✅ Enforces "LUNAS" (paid in full) requirement
✅ Protects clinic revenue

### 4. **Cashier Dashboard**

✅ **Sticky total box** prominently displays billing amount
✅ Color-coded payment status (red/yellow/green)
✅ Tabbed billing items (All/Services/Drugs/Materials/Rooms)
✅ Subtotals by item type
✅ Payment history display
✅ Payment dialog with method selection
✅ Real-time change calculation display
✅ Responsive layout (mobile-friendly)

### 5. **Discharge Management**

✅ Complete discharge summary form
✅ SOAP-style medical summary
✅ Medications on discharge listing
✅ Dietary and activity restrictions
✅ Follow-up scheduling
✅ Doctor signature tracking
✅ Automatic visit status update to "completed"
✅ Automatic bed release for inpatient

### 6. **Financial Tracking**

✅ Billing statistics (total, pending, paid, partial)
✅ Revenue tracking (total revenue, pending revenue)
✅ Daily collections report
✅ Payment method breakdown
✅ Billing item categorization

## Refactored Architecture

### Type System (`types/billing.ts`)

Complete TypeScript coverage:

- Entity types (Service, Billing, BillingItem, Payment, DischargeSummary)
- Extended types (BillingWithDetails)
- Input types for API calls
- Payment status and method enums
- Statistics and summary types
- Receipt data structure

```typescript
import { Billing, BillingWithDetails, Payment, DischargeSummary } from "@/types/billing"
```

### Utility Functions (`lib/billing/billing-utils.ts`)

**Currency Functions**:

```typescript
import { formatCurrency, parseCurrency } from "@/lib/billing/billing-utils"
```

**Calculation Functions**:

```typescript
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateDiscountFromPercentage,
  calculateTotalAmount,
  calculatePatientPayable,
  calculateRemainingAmount,
  calculateChange,
} from "@/lib/billing/billing-utils"
```

**Status Functions**:

```typescript
import {
  determinePaymentStatus,
  getPaymentStatusConfig,
  getPaymentMethodLabel,
  canDischarge,
} from "@/lib/billing/billing-utils"
```

**Grouping Functions**:

```typescript
import { groupItemsByType, calculateTotalByType } from "@/lib/billing/billing-utils"
```

**Validation Functions**:

```typescript
import { validatePaymentAmount, generateReceiptNumber } from "@/lib/billing/billing-utils"
```

### Validation Schemas (`lib/billing/validation.ts`)

Centralized Zod schemas:

```typescript
import {
  serviceSchema,
  serviceUpdateSchema,
  billingItemSchema,
  createBillingSchema,
  paymentSchema,
  dischargeSummarySchema,
} from "@/lib/billing/validation"
```

### Service Layer (`lib/billing/api-service.ts`)

**THE BILLING ENGINE** - Core business logic:

```typescript
import {
  // Service master
  getAllServices,
  getServiceById,
  createService,
  updateService,

  // Billing operations
  getBillingByVisitId,
  createBillingForVisit, // 🚀 BILLING ENGINE
  getPendingBillings,
  getBillingStatistics,

  // Payment operations
  processPayment,

  // Discharge operations
  canDischarge, // 🔒 BILLING GATE
  createDischargeSummary,
  getDischargeSummary,
} from "@/lib/billing/api-service"
```

### Custom Hooks

**useBilling**

```typescript
const {
  createBilling, // Create billing (runs engine)
  fetchBilling, // Get billing by visit ID
  isSubmitting, // Create state
  isLoading, // Fetch state
  error, // Error state
  success, // Success state
  billing, // Current billing data
} = useBilling()
```

**usePayment**

```typescript
const {
  processPayment, // Process payment with change calc
  isSubmitting, // Submit state
  error, // Error state
  success, // Success state
} = usePayment()
```

**useDischarge**

```typescript
const {
  createDischargeSummary, // Create discharge summary
  checkCanDischarge, // Check billing gate
  isSubmitting, // Submit state
  isChecking, // Check state
  error, // Error state
  success, // Success state
} = useDischarge()
```

## API Endpoints

### Billing Operations

- `GET /api/billing?visitId=1` - Get billing by visit ID
- `GET /api/billing?stats=true` - Get billing statistics
- `GET /api/billing?pending=true` - Get pending billings
- `POST /api/billing` - Create billing (runs billing engine)

### Payment Processing

- `POST /api/billing/payment` - Process payment

### Discharge Operations

- `GET /api/billing/discharge?visitId=1&check=true` - Check billing gate
- `GET /api/billing/discharge?visitId=1` - Get discharge summary
- `POST /api/billing/discharge` - Create discharge summary

## Usage Examples

### Create Billing (Run Billing Engine)

```typescript
const { createBilling } = useBilling()

await createBilling({
  visitId: 1,
  items: [], // Engine auto-aggregates from visit
  discount: "0",
  insuranceCoverage: "0",
  notes: "Regular billing",
})

// Billing engine automatically adds:
// - Fulfilled prescriptions from pharmacy
// - Material usage from inpatient
// - Room charges with calculated days
// - Any manual service items
```

### Process Payment

```typescript
const { processPayment } = usePayment()

await processPayment({
  billingId: 1,
  amount: "500000",
  paymentMethod: "cash",
  amountReceived: "600000", // For cash only
  receivedBy: "cashier-001",
  notes: "Pembayaran lunas",
})

// Automatic change calculation: 600000 - 500000 = 100000
// Automatic payment status update
```

### Check Billing Gate Before Discharge

```typescript
const { checkCanDischarge } = useDischarge()

const result = await checkCanDischarge(visitId)

if (result.canDischarge) {
  // Proceed with discharge
} else {
  // Show error: result.reason
  // e.g., "Pembayaran belum lunas. Status: pending. Sisa: Rp 500,000"
}
```

### Create Discharge Summary

```typescript
const { createDischargeSummary } = useDischarge()

await createDischargeSummary({
  visitId: 1,
  admissionDiagnosis: "Demam tinggi",
  dischargeDiagnosis: "Demam Berdarah Dengue Grade II",
  clinicalSummary: "Pasien masuk dengan demam tinggi...",
  proceduresPerformed: "Infus RL, monitoring vital signs",
  medicationsOnDischarge: "Paracetamol 3x500mg",
  dischargeInstructions: "Istirahat cukup, minum banyak air...",
  dietaryRestrictions: "Hindari makanan berminyak",
  activityRestrictions: "Istirahat total 1 minggu",
  followUpDate: "2025-12-01",
  followUpInstructions: "Kontrol untuk cek darah lengkap",
  dischargedBy: "doctor-001",
})

// Automatic billing gate check
// Automatic visit status update to "completed"
// Automatic bed release for inpatient
```

## Utility Function Examples

### Calculate Change

```typescript
import { calculateChange } from "@/lib/billing/billing-utils"

const change = calculateChange("600000", "500000") // "100000.00"
```

### Determine Payment Status

```typescript
import { determinePaymentStatus } from "@/lib/billing/billing-utils"

const status = determinePaymentStatus("500000", "0") // "pending"
const status2 = determinePaymentStatus("500000", "300000") // "partial"
const status3 = determinePaymentStatus("500000", "500000") // "paid"
```

### Group Items by Type

```typescript
import { groupItemsByType } from "@/lib/billing/billing-utils"

const grouped = groupItemsByType(billingItems)
// {
//   services: [...],
//   drugs: [...],
//   materials: [...],
//   rooms: [...]
// }
```

### Format Currency

```typescript
import { formatCurrency } from "@/lib/billing/billing-utils"

const formatted = formatCurrency("500000") // "Rp 500,000"
```

## Billing Engine Details

The billing engine (`createBillingForVisit`) is the core of the module. Here's what it does:

### Automatic Aggregation Process

1. **Verify visit exists**
2. **Check for existing billing** (prevent duplicates)
3. **Aggregate fulfilled prescriptions**:
   - Query prescriptions where `isFulfilled = true`
   - Join with drugs table for pricing
   - Add as billing items with type "drug"
4. **Aggregate material usage** (inpatient only):
   - Query material_usage for the visit
   - Add as billing items with type "material"
5. **Calculate room charges** (inpatient only):
   - Find active bed assignment
   - Calculate days stayed: `(today - admission date)`
   - Multiply by room daily rate
   - Add as billing item with type "room"
6. **Include manual service items**:
   - Add any services from input data
7. **Calculate totals**:
   - Subtotal = sum of all item totals
   - Apply discount (fixed or percentage)
   - Add tax (if applicable)
   - Total amount = subtotal - discount + tax
   - Patient payable = total - insurance coverage
   - Remaining amount = patient payable - paid amount
8. **Create billing record and items**
9. **Return complete billing with details**

## Billing Gate Implementation

The billing gate (`canDischarge`) ensures revenue protection:

```typescript
// Check before discharge
const check = await canDischarge(visitId)

if (!check.canDischarge) {
  // Reasons for blocking:
  // 1. "Billing belum dibuat. Harap buat billing terlebih dahulu."
  // 2. "Pembayaran belum lunas. Status: pending. Sisa: Rp 500,000"
  // 3. "Pembayaran belum lunas. Status: partial. Sisa: Rp 200,000"

  throw new Error(check.reason)
}

// Only proceed if payment_status === "paid"
```

## Dashboard Features

### Cashier Dashboard

✅ **Search by Visit ID** - Quick billing lookup
✅ **Patient Information Card** - Name, MR number, visit number
✅ **Payment Status Badge** - Color-coded (green/yellow/red)
✅ **Billing Items Tabs**:

- All items view
- Services only
- Drugs only
- Materials only
- Rooms only
- Subtotals by category

✅ **Sticky Total Box** (Right sidebar):

- Prominent display of amounts
- Color-coded border matching payment status
- Subtotal breakdown
- Discount display (if applicable)
- Insurance coverage (if applicable)
- Total amount (bold)
- Paid amount (green)
- **Remaining amount (extra large, bold)**
- Process Payment button (disabled if paid)
- LUNAS indicator (when paid)

✅ **Payment Dialog**:

- Payment method selector
- Amount received input (cash only)
- **Real-time change calculation**
- Change display in green box
- Validation (prevents negative change)

✅ **Payment History**:

- All payment transactions
- Payment method labels (in Indonesian)
- Timestamps
- Amount per payment

## Performance Optimizations

✅ **Service Layer Separation** - Business logic isolated
✅ **Custom Hooks** - Reusable state management
✅ **Type Safety** - Full TypeScript coverage
✅ **Utility Functions** - Centralized calculations
✅ **Automatic Calculations** - No manual math errors
✅ **Sticky UI** - Total box always visible
✅ **Error Handling** - Consistent patterns
✅ **Billing Gate** - Revenue protection

## Best Practices

### Type Safety

```typescript
import { BillingWithDetails, PaymentInput } from "@/types/billing"
```

### Use Service Layer

```typescript
// ✅ Good
import { createBillingForVisit } from "@/lib/billing/api-service";
const billing = await createBillingForVisit(data);

// ❌ Bad
const billing = await db.insert(billings).values(...);
```

### Use Utility Functions

```typescript
// ✅ Good
import { calculateChange } from "@/lib/billing/billing-utils"
const change = calculateChange(received, due)

// ❌ Bad
const change = parseFloat(received) - parseFloat(due)
```

### Use Custom Hooks

```typescript
// ✅ Good
const { processPayment, isSubmitting } = usePayment()

// ❌ Bad
const [isSubmitting, setIsSubmitting] = useState(false)
// ... manual fetch logic
```

## Security Considerations

✅ **Billing Gate** - Prevents revenue loss
✅ **Payment Validation** - Prevents overpayment
✅ **Audit Trail** - All payments tracked with cashier ID
✅ **Amount Validation** - Ensures positive amounts
✅ **Discharge Control** - Only when fully paid
✅ **No Double Billing** - Prevents billing duplication

## Integration Points

### With All Modules

The billing module is the **FINAL INTEGRATION POINT** for:

- **EMR Module**: Prescriptions become drug billing items
- **Pharmacy Module**: Fulfilled prescriptions trigger billing
- **Inpatient Module**: Material usage and room charges
- **Emergency Module**: ER services billing
- **Registration Module**: Patient and visit data

### Billing Flow

1. Patient visits (any type: outpatient/inpatient/ER)
2. Services provided, prescriptions written
3. **Cashier creates billing** → Billing engine aggregates ALL charges
4. Payment processed (full or partial)
5. **Billing gate checks** → Only if "LUNAS" (paid)
6. Discharge summary created
7. Patient discharged, bed released (if inpatient)

## Future Enhancements

- [ ] PDF receipt generation
- [ ] Email receipt to patient
- [ ] Billing reports and analytics
- [ ] Payment installment plans
- [ ] Multiple insurance coverage handling
- [ ] Credit limit for corporate accounts
- [ ] Billing adjustments/refunds
- [ ] Integration with accounting systems
- [ ] Daily cashier closing report
- [ ] Revenue forecasting

## Testing Considerations

### Unit Tests

- Utility functions (calculate change, determine status)
- Validation schemas
- Service layer functions

### Integration Tests

- Billing engine aggregation
- Payment processing workflow
- Billing gate logic
- Discharge summary creation

### E2E Tests

- Complete patient journey (visit → billing → payment → discharge)
- Billing gate blocking unpaid discharge
- Multiple payment processing
- Receipt generation

## Related Modules

**Dependencies:**
ALL modules (final integration point)

**Integration Points:**

- EMR Module (prescriptions)
- Pharmacy Module (fulfilled prescriptions)
- Inpatient Module (materials, rooms)
- Registration Module (patients, visits)

## Contributors

Module created with clean architecture principles:

- Modular design
- Type safety
- Service layer separation
- Reusable hooks
- Comprehensive utilities
- Centralized validation
- Complete documentation
- **Billing engine automation**
- **Billing gate revenue protection**
