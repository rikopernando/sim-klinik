# Sprint 3: RBAC Implementation Progress

## ✅ Completed Tasks

### 1. Created Inpatient Permissions Mapping
**File:** `/lib/rbac/inpatient-permissions.ts`

Documented all permission requirements for 19 inpatient routes with role access summary.

### 2. Applied `withRBAC` to All Inpatient API Routes (19 files)

#### Bed Management (4 routes)
- ✅ `POST /api/inpatient/assign-bed` - `inpatient:manage_beds`
- ✅ `GET /api/inpatient/available-rooms` - `inpatient:read`
- ✅ `GET /api/inpatient/search-unassigned-patients` - `inpatient:read`
- ✅ `GET /api/rooms` - `inpatient:read`
- ✅ `POST /api/rooms` - `inpatient:manage_beds`
- ✅ `PATCH /api/rooms` - `inpatient:manage_beds`

#### Vitals Management (3 routes)
- ✅ `GET /api/inpatient/vitals` - `inpatient:read`
- ✅ `POST /api/inpatient/vitals` - `inpatient:write`
- ✅ `DELETE /api/inpatient/vitals/[id]` - `inpatient:write`

#### CPPT (4 routes)
- ✅ `GET /api/inpatient/cppt` - `inpatient:read`
- ✅ `POST /api/inpatient/cppt` - `inpatient:write`
- ✅ `PUT /api/inpatient/cppt/[id]` - `inpatient:write`
- ✅ `DELETE /api/inpatient/cppt/[id]` - `inpatient:write`

#### Patient Management (2 routes)
- ✅ `GET /api/inpatient/patients` - `inpatient:read`
- ✅ `GET /api/inpatient/patients/[visitId]` - `inpatient:read`

#### Prescriptions (3 routes)
- ✅ `POST /api/inpatient/prescriptions` - `prescriptions:write`
- ✅ `DELETE /api/inpatient/prescriptions/[id]` - `prescriptions:write`
- ✅ `POST /api/inpatient/prescriptions/administer` - `inpatient:write`

#### Procedures (3 routes)
- ✅ `GET /api/inpatient/procedures` - `inpatient:read`
- ✅ `POST /api/inpatient/procedures` - `inpatient:write`
- ✅ `DELETE /api/inpatient/procedures/[id]` - `inpatient:write`
- ✅ `PATCH /api/inpatient/procedures/status` - `inpatient:write`

#### Materials (2 routes)
- ✅ `GET /api/materials` - `inpatient:read`
- ✅ `POST /api/materials` - `inpatient:write`
- ✅ `DELETE /api/materials/[id]` - `inpatient:write`

#### Discharge (1 route)
- ✅ `POST /api/inpatient/complete-discharge` - `discharge:write`

## Changes Made to Routes

### Pattern Applied
All routes were updated from:
```typescript
export async function METHOD(request: NextRequest) {
  // Manual auth check (if present)
  const session = await getSession()
  if (!session?.user) { ... }

  // Handler logic
}
```

To:
```typescript
export const METHOD = withRBAC(async (request: NextRequest, { user, role }) => {
  // Handler logic - no manual auth checks needed
  // user.id, user.email, user.name available from context
}, { permissions: ["appropriate:permission"] })
```

### Key Improvements
1. **Removed manual authentication checks** - `withRBAC` handles this automatically
2. **Removed `getSession()` imports** - No longer needed
3. **User context from middleware** - Access to `user.id`, `user.email`, `user.name`, `role`
4. **Consistent permission enforcement** - All routes follow the same pattern
5. **Type-safe** - Full TypeScript support maintained

## Permission Summary by Role

### Nurse
- ✅ Can read all inpatient data
- ✅ Can write vitals, CPPT, materials, procedures
- ✅ Can manage beds (assign, transfer)
- ✅ Can administer medications
- ❌ Cannot create/delete prescriptions (doctor only)
- ❌ Cannot complete discharge (doctor only)

### Doctor
- ✅ Can read all inpatient data
- ✅ Can write vitals, CPPT, materials, procedures
- ✅ Can create/delete prescriptions
- ✅ Can complete discharge
- ❌ Cannot manage beds directly (nurse responsibility)

### Admin
- ✅ Can read all inpatient data (read-only for reporting)
- ❌ Cannot write/modify clinical data

### Super Admin
- ✅ Full access to all inpatient operations

### 3. Created `usePermission` Hook
**File:** `/hooks/use-permission.ts`

A client-side React hook for permission checking with the following capabilities:
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission(permissions[])` - Check if user has any of the permissions
- `hasAllPermissions(permissions[])` - Check if user has all permissions
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles[])` - Check if user has any of the roles
- Exposes `userRole`, `userPermissions`, `isLoading` state

### 4. Updated UI Components for Permission-Based Hiding

#### Patient Detail Page
**File:** `/app/dashboard/inpatient/patients/[visitId]/page.tsx`

Updated to conditionally render action dialogs based on permissions:
- ✅ `RecordVitalsDialog` - requires `inpatient:write`
- ✅ `CPPTDialog` - requires `inpatient:write`
- ✅ `RecordMaterialDialog` - requires `inpatient:write`
- ✅ `CreatePrescriptionDialog` - requires `prescriptions:write`
- ✅ `CreateProcedureDialog` - requires `inpatient:write`
- ✅ `CompleteDischargeDialog` - requires `discharge:write`

#### Room Card Component
**File:** `/components/inpatient/room-card.tsx`

Updated to conditionally render bed assignment button:
- ✅ "Alokasi Bed" button - requires `inpatient:manage_beds`

**Pattern Applied:**
```typescript
const { hasPermission } = usePermission()

// In JSX
{hasPermission("inpatient:write") && (
  <RecordVitalsDialog ... />
)}
```

## 📋 Priority 1: RBAC Implementation

- [x] Create inpatient permissions file
- [x] Apply `withRBAC` to all inpatient routes
- [x] Create `usePermission` hook for client-side permission checking
- [x] Hide UI elements based on permissions
- [ ] Test RBAC with different user roles

---

## ✅ Priority 2: Bed Transfer Feature

### 1. Created Bed Transfer Validation Schema
**File:** `/lib/inpatient/validation.ts`

Added `bedTransferSchema` with fields:
- `visitId` - Patient visit ID (required)
- `newRoomId` - Target room ID (required)
- `newBedNumber` - Target bed number (required)
- `transferReason` - Reason for transfer (required)

### 2. Created Bed Transfer API Endpoint
**File:** `/app/api/inpatient/transfer-bed/route.ts`

**Endpoint:** `POST /api/inpatient/transfer-bed`
**Permission:** `inpatient:manage_beds`

**Transaction Logic:**
1. Verify visit exists and is inpatient type
2. Find current active bed assignment
3. Verify new room exists and has available beds
4. Validate new bed number
5. Check if new bed is already occupied
6. Close current bed assignment (set `dischargedAt`)
7. Increment `availableBeds` in old room
8. Create new bed assignment with transfer notes
9. Decrement `availableBeds` in new room
10. Update visit's `roomId`

### 3. Created Transfer Bed Dialog Component
**File:** `/components/inpatient/transfer-bed-dialog.tsx`

A dialog component that allows nurses to transfer patients between beds with:
- Room selection dropdown (shows only available rooms)
- Bed number selection (dynamically generated based on room bed count)
- Transfer reason text area (required)
- Form validation and error handling
- Success/error toast notifications

### 4. Added Transfer Bed Button to Patient Detail Page
**File:** `/app/dashboard/inpatient/patients/[visitId]/page.tsx`

- Button displayed after Patient Info Card
- Only visible if user has `inpatient:manage_beds` permission
- Only visible if patient has an active bed assignment
- Passes current room and bed info to dialog
- Triggers refresh after successful transfer

**Implementation:**
```typescript
{hasPermission("inpatient:manage_beds") && patientDetail.bedAssignment && (
  <TransferBedDialog
    visitId={visitId}
    patientName={patientDetail.patient.patientName}
    currentRoomNumber={patientDetail.bedAssignment.roomNumber}
    currentBedNumber={patientDetail.bedAssignment.bedNumber}
    onSuccess={refresh}
  />
)}
```

### 5. Refactored to Follow Service Layer Pattern

**Files Modified:**
- `/lib/inpatient/validation.ts` - Added `BedTransferInput` type export
- `/lib/services/inpatient.service.ts` - Added `transferBed()` service function
- `/hooks/use-bed-transfer.ts` - Created custom hook for bed transfer
- `/components/inpatient/transfer-bed-dialog.tsx` - Refactored to use hook instead of fetch API

**Pattern Applied:**
- ✅ Uses axios instead of fetch API
- ✅ API call logic moved to service layer (`inpatient.service.ts`)
- ✅ Component uses custom hook (`useBedTransfer`)
- ✅ Consistent error handling via `handleApiError`
- ✅ Toast notifications handled in hook
- ✅ Loading state managed by hook

**Before:**
```typescript
const response = await fetch("/api/inpatient/transfer-bed", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
})
```

**After:**
```typescript
const { transfer, isTransferring } = useBedTransfer({
  onSuccess: () => { ... }
})

await transfer({
  visitId,
  newRoomId: selectedRoomId,
  newBedNumber: bedNumber,
  transferReason,
})
```

### 6. Refactored TransferBedDialog to React Hook Form

**Purpose**: Follow consistent form handling pattern used across the codebase.

**Files Modified:**
- `/components/inpatient/transfer-bed-dialog.tsx` - Complete refactor from manual state to React Hook Form

**Changes Applied:**
- ✅ Added `useForm` hook with `zodResolver` for Zod validation
- ✅ Wrapped all form fields with `Controller` component
- ✅ Replaced manual state (`useState`) with form state management
- ✅ Used `form.watch("newRoomId")` to track selected room reactively
- ✅ Added `FieldError` components for validation error display
- ✅ Changed submit handler to `form.handleSubmit(handleSubmit)`
- ✅ Form automatically resets on successful transfer via `form.reset()`

**Pattern Followed** (from RecordVitalsDialog):
```typescript
const form = useForm<TransferBedFormData>({
  resolver: zodResolver(transferBedFormSchema),
  defaultValues: {
    newRoomId: "",
    newBedNumber: "",
    transferReason: "",
  },
})

// Watch selected room to generate bed options
const selectedRoomId = form.watch("newRoomId")

// Controller wrapping for Select components
<Controller
  control={form.control}
  name="newRoomId"
  render={({ field }) => (
    <Select
      onValueChange={(value) => {
        field.onChange(value)
        form.setValue("newBedNumber", "") // Reset dependent field
      }}
      value={field.value}
    >
      {/* ... */}
    </Select>
  )}
/>
<FieldError errors={[form.formState.errors.newRoomId]} />
```

**Benefits:**
- ✅ Consistent with other form components in codebase
- ✅ Better validation with Zod schema integration
- ✅ Cleaner code without manual state management
- ✅ Automatic form state handling (dirty, touched, errors)
- ✅ Type-safe form values

### 7. Added Bed Assignment History Feature

**Purpose**: Track and display full history of bed assignments and transfers for each patient.

**Files Created:**
- `/components/inpatient/bed-assignment-history.tsx` - Timeline component showing current and past bed assignments

**Files Modified:**
- `/lib/inpatient/api-service.ts` - Added query to fetch all bed assignments (including discharged)
- `/types/inpatient.ts` - Added `BedAssignmentHistoryItem` interface and `bedAssignmentHistory` to `PatientDetail`
- `/app/dashboard/inpatient/patients/[visitId]/page.tsx` - Added BedAssignmentHistory component

**Features:**
- ✅ Shows **current active bed** with green highlight
- ✅ Shows **past bed assignments** with transfer arrows
- ✅ Displays timestamps for each assignment and discharge
- ✅ Shows who assigned the bed (assignedByName)
- ✅ Displays transfer notes/reasons
- ✅ Visual timeline with icons and badges
- ✅ Clear "before → after" flow for transfers
- ✅ **Cost calculation**: Daily rate × days for each assignment
- ✅ **Total cost summary** displayed in card header
- ✅ Shows: Daily rate, number of days, and total cost per assignment

**Data Structure:**
```typescript
interface BedAssignmentHistoryItem {
  id: string
  roomId: string
  roomNumber: string
  roomType: string
  bedNumber: string
  assignedAt: string
  dischargedAt: string | null  // null = currently active
  notes: string | null
  assignedBy: string | null
  assignedByName: string | null
  dailyRate: string             // Room daily rate
  days: number                  // Calculated: days in this bed
  totalCost: string             // Calculated: dailyRate × days
}
```

**Cost Calculation Logic:**
```typescript
const startDate = new Date(assignment.assignedAt)
const endDate = assignment.dischargedAt ? new Date(assignment.dischargedAt) : new Date()
const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
const totalCost = parseFloat(dailyRate) * days
```

**UI Layout:**
```
┌─ Riwayat Bed ─────────────────────────────────────┐
│ Riwayat Bed          Total Biaya Kamar            │
│ 3 assignments        Rp 4,500,000.00              │
│ (2 transfer)                                       │
├───────────────────────────────────────────────────┤
│ [AKTIF SEKARANG - Green Badge]                    │
│ 🛏️ Kamar 301 - Bed 2 (VIP)                        │
│ 📅 Masuk: 03 Jan 2026, 14:30                      │
│ 👤 Oleh: Nurse Anna                               │
│ 💰 Rp 1,500,000/hari • 2 hari • Rp 3,000,000.00   │
│ "Transfer dari Kamar 201 Bed 1. Alasan: ..."      │
│                                                    │
│ Riwayat Transfer:                                 │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🛏️ Kamar 201 - Bed 1 → Kamar 301 - Bed 2   │   │
│ │ 📅 01 Jan, 10:00 - 03 Jan, 14:30            │   │
│ │ 👤 Oleh: Nurse Anna                         │   │
│ │ 💰 Rp 500,000/hari • 2 hari • Rp 1,000,000  │   │
│ │ "Permintaan keluarga"                       │   │
│ └─────────────────────────────────────────────┘   │
│                                                    │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🛏️ Kamar 101 - Bed 3 → Kamar 201 - Bed 1   │   │
│ │ 📅 30 Des, 08:00 - 01 Jan, 10:00            │   │
│ │ 👤 Oleh: Nurse John                         │   │
│ │ 💰 Rp 250,000/hari • 3 hari • Rp 750,000    │   │
│ │ "Kebutuhan isolasi"                         │   │
│ └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 8. Fixed Discharge Billing to Aggregate ALL Room Charges

**Issue**: Discharge billing was only calculating room charges for ONE bed assignment (using `.limit(1)`), missing all previous rooms from transfers.

**Fix**: Modified `/lib/billing/discharge-aggregation.ts` - `aggregateRoomCharges()` function
- ✅ Removed `.limit(1)` - now fetches ALL bed assignments
- ✅ Maps each assignment to a billing item
- ✅ Calculates days and cost for EACH room stay
- ✅ Total room charges = sum of all room items

**Before:**
```typescript
.where(eq(bedAssignments.visitId, visitId))
.limit(1)  // Only got current room ❌
```

**After:**
```typescript
.where(eq(bedAssignments.visitId, visitId))
.orderBy(bedAssignments.assignedAt)  // Get ALL rooms ✅

return bedAssignmentList.map((assignment) => {
  // Calculate for EACH room
  const daysStayed = Math.max(1, daysDiff)
  const totalRoomCharge = dailyRate * daysStayed
  return { itemType: "room", ... }
})
```

**Example Discharge Billing:**
```
Room Charges:
- Kamar Class 3 - 101 (Bed 1): 2 hari × Rp 250,000 = Rp 500,000
- Kamar Class 2 - 201 (Bed 2): 3 hari × Rp 500,000 = Rp 1,500,000
- Kamar VIP - 301 (Bed 1): 2 hari × Rp 1,500,000 = Rp 3,000,000
Total Room Charges: Rp 5,000,000
```

### Priority 2 Tasks Checklist:
- [x] Create transfer bed dialog
- [x] Create API endpoint: `POST /api/inpatient/transfer-bed`
- [x] Implement transaction logic (close old assignment, create new, update rooms)
- [x] Add "Transfer Bed" button to patient detail page
- [x] Refactor to use service layer pattern
- [x] Refactor TransferBedDialog to React Hook Form with Controller
- [x] Add bed assignment history feature with cost tracking
- [x] Fix discharge billing to aggregate ALL room charges (not just current)
- [ ] Test transfer workflow

---

## 📋 Remaining Tasks

### Priority 1: RBAC
- [ ] Test RBAC with different user roles

### Priority 2: Bed Transfer
- [ ] Test transfer workflow end-to-end

### Priority 3: Data Validation (Next)
- [ ] Add business rule validations to Zod schemas
- [ ] Add vitals range validation
- [ ] Add recurring medication date validation
- [ ] Add bed assignment validation (room capacity check)
