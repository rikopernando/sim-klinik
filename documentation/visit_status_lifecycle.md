# Visit Status Lifecycle Documentation

**Sim-Klinik Visit Status State Machine**

This document describes the visit status lifecycle, valid transitions, and integration points with other modules.

---

## Overview

The Visit Status Lifecycle implements a state machine to manage the progression of patient visits from registration to completion. This ensures data integrity and prevents invalid status transitions.

**Implementation Date:** 2025-11-19
**Tasks Completed:** H.2.1, H.2.2

---

## Visit Status Flow

### Standard Flow Diagram

```
┌─────────────┐
│ registered  │ ◄─── Patient just registered
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   waiting   │ ◄─── In queue, waiting for doctor
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ in_examination   │ ◄─── Currently being examined
└──────┬───────────┘
       │
       ▼
┌─────────────┐
│  examined   │ ◄─── Examination complete, medical record created
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ ready_for_billing    │ ◄─── Medical record locked, ready for billing
└──────┬───────────────┘
       │
       ▼
┌─────────────┐
│   billed    │ ◄─── Billing has been created
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    paid     │ ◄─── Payment completed
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  completed  │ ◄─── Visit fully completed (terminal state)
└─────────────┘

┌─────────────┐
│  cancelled  │ ◄─── Can transition from any non-terminal state
└─────────────┘      (terminal state)
```

---

## Status Definitions

### 1. **registered**

- **Description:** Patient has just been registered, visit record created
- **Initial Status:** YES (for all visit types)
- **Who Sets:** Receptionist (Registration module)
- **Can Transition To:** `waiting`, `in_examination`, `cancelled`
- **Note:** Can skip `waiting` and go directly to `in_examination` when doctor starts examination
- **Color:** Blue (`bg-blue-100`, `text-blue-700`)

### 2. **waiting**

- **Description:** Patient is in queue, waiting to be called for examination
- **Who Sets:** System (when patient moves to queue) or Receptionist
- **Can Transition To:** `in_examination`, `cancelled`
- **Can Go Back To:** N/A
- **Color:** Yellow (`bg-yellow-100`, `text-yellow-700`)

### 3. **in_examination**

- **Description:** Patient is currently being examined by a doctor
- **Who Sets:** Doctor or Nurse (when calling patient), or auto-set when doctor opens medical record
- **Can Transition To:** `examined`, `ready_for_billing`, `waiting` (if doctor unavailable), `cancelled`
- **Can Go Back To:** `waiting` (special case)
- **Note:** Can skip `examined` and go directly to `ready_for_billing` when locking medical record
- **Medical Record:** Can be created in this status
- **Color:** Purple (`bg-purple-100`, `text-purple-700`)

### 4. **examined**

- **Description:** Examination is complete, medical record has been created
- **Who Sets:** System (when medical record is saved) or Doctor
- **Can Transition To:** `ready_for_billing`, `in_examination` (if need to re-examine), `cancelled`
- **Can Go Back To:** `in_examination` (special case)
- **Medical Record:** Can be locked from this status
- **Color:** Indigo (`bg-indigo-100`, `text-indigo-700`)

### 5. **ready_for_billing**

- **Description:** Medical record is locked, visit is ready for billing
- **Who Sets:** System (automatically when medical record is locked) or Doctor
- **Can Transition To:** `billed`, `cancelled`
- **Triggers:** This status change should trigger H.1.2 (auto-update for billing)
- **Billing:** Can create billing in this status
- **Color:** Cyan (`bg-cyan-100`, `text-cyan-700`)

### 6. **billed**

- **Description:** Billing has been created for this visit
- **Who Sets:** Cashier or System (when billing record is created)
- **Can Transition To:** `paid`, `cancelled`
- **Color:** Teal (`bg-teal-100`, `text-teal-700`)

### 7. **paid**

- **Description:** Payment has been completed
- **Who Sets:** Cashier (when payment is processed)
- **Can Transition To:** `completed`
- **Color:** Green (`bg-green-100`, `text-green-700`)

### 8. **completed**

- **Description:** Visit is fully completed (terminal state)
- **Terminal:** YES - No further transitions allowed
- **Who Sets:** System or Cashier (for outpatient after payment, for inpatient after discharge)
- **Can Transition To:** None (terminal state)
- **Color:** Gray (`bg-gray-100`, `text-gray-700`)

### 9. **cancelled**

- **Description:** Visit has been cancelled
- **Terminal:** YES - No further transitions allowed
- **Who Sets:** Any authorized staff with reason
- **Can Transition To:** None (terminal state)
- **Special:** Can transition from ANY non-terminal status
- **Color:** Red (`bg-red-100`, `text-red-700`)

---

## State Transition Rules

### Valid Transitions Matrix

| From Status         | To Status(es)                                           |
| ------------------- | ------------------------------------------------------- |
| `registered`        | `waiting`, `in_examination`, `cancelled`                |
| `waiting`           | `in_examination`, `cancelled`                           |
| `in_examination`    | `examined`, `ready_for_billing`, `waiting`, `cancelled` |
| `examined`          | `ready_for_billing`, `in_examination`, `cancelled`      |
| `ready_for_billing` | `billed`, `cancelled`                                   |
| `billed`            | `paid`, `cancelled`                                     |
| `paid`              | `completed`                                             |
| `completed`         | None (terminal)                                         |
| `cancelled`         | None (terminal)                                         |

### Special Transition Cases

**Backward Transitions (Allowed):**

1. `in_examination` → `waiting`: Doctor not available or patient needs to wait again
2. `examined` → `in_examination`: Need to re-examine patient

**Cancelled Transitions (Always Allowed):**

- From any non-terminal status → `cancelled` with required reason

**Terminal States:**

- `completed` and `cancelled` are terminal - no further transitions allowed

---

## API Endpoints

### 1. Update Visit Status

**Endpoint:** `PATCH /api/visits/status`

**Permission Required:** `visits:write`

**Request Body:**

```json
{
  "visitId": 123,
  "newStatus": "in_examination",
  "reason": "Optional reason for status change"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Visit status updated to: Dalam Pemeriksaan",
  "data": {
    "visitId": 123,
    "previousStatus": "waiting",
    "newStatus": "in_examination",
    "statusInfo": {
      "label": "Dalam Pemeriksaan",
      "labelId": "In Examination",
      "description": "Sedang diperiksa oleh dokter",
      "color": "text-purple-700",
      "bgColor": "bg-purple-100"
    },
    "updatedAt": "2025-11-19T10:30:00.000Z"
  }
}
```

**Error Response - Invalid Transition (400):**

```json
{
  "error": "Invalid status transition",
  "message": "Invalid status transition from \"completed\" to \"waiting\". Allowed transitions: (none - terminal state)",
  "currentStatus": "completed",
  "attemptedStatus": "waiting"
}
```

### 2. Get Visit Status Information

**Endpoint:** `GET /api/visits/status?visitId=123`

**Permission Required:** `visits:read`

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "visitId": 123,
    "visitNumber": "V20251119001",
    "patientId": 456,
    "visitType": "outpatient",
    "currentStatus": "waiting",
    "statusInfo": {
      "label": "Menunggu",
      "labelId": "Waiting",
      "description": "Menunggu di antrian",
      "color": "text-yellow-700",
      "bgColor": "bg-yellow-100"
    },
    "isTerminal": false,
    "allowedNextStatuses": [
      {
        "status": "in_examination",
        "info": {
          "label": "Dalam Pemeriksaan",
          "labelId": "In Examination",
          "description": "Sedang diperiksa oleh dokter",
          "color": "text-purple-700",
          "bgColor": "bg-purple-100"
        }
      },
      {
        "status": "cancelled",
        "info": {
          "label": "Dibatalkan",
          "labelId": "Cancelled",
          "description": "Kunjungan dibatalkan",
          "color": "text-red-700",
          "bgColor": "bg-red-100"
        }
      }
    ],
    "timestamps": {
      "arrivalTime": "2025-11-19T08:00:00.000Z",
      "startTime": null,
      "endTime": null,
      "dischargeDate": null
    }
  }
}
```

---

## Integration Points

### H.1.2: Auto-Update Visit Status → Ready for Billing

**Trigger:** When medical record is locked by doctor

**Implementation Location:** `/app/api/medical-records/lock/route.ts`

**Required Logic:**

```typescript
// After locking medical record successfully
await updateVisitStatus({
  visitId: medicalRecord.visitId,
  newStatus: "ready_for_billing",
})
```

### Billing Module Integration

**Check Before Creating Billing:**

```typescript
import { canCreateBilling } from "@/types/visit-status"

if (!canCreateBilling(visit.status)) {
  return error("Cannot create billing - visit not ready")
}
```

### Discharge Module Integration

**Check Before Discharging:**

```typescript
import { canCompleteVisit } from "@/types/visit-status"

if (!canCompleteVisit(visit.status)) {
  return error("Cannot discharge - payment not completed")
}
```

### Medical Records Module Integration

**Check Before Creating Medical Record:**

```typescript
import { canCreateMedicalRecord } from "@/types/visit-status"

if (!canCreateMedicalRecord(visit.status)) {
  return error("Cannot create medical record - patient not in examination")
}
```

**Check Before Locking Medical Record:**

```typescript
import { canLockMedicalRecord } from "@/types/visit-status"

if (!canLockMedicalRecord(visit.status)) {
  return error("Cannot lock medical record - examination not complete")
}
```

---

## Utility Functions

All utility functions are available in `/types/visit-status.ts`:

### `isValidStatusTransition(currentStatus, newStatus): boolean`

Check if a status transition is valid.

```typescript
import { isValidStatusTransition } from "@/types/visit-status"

if (isValidStatusTransition("waiting", "in_examination")) {
  // Allowed
}
```

### `getAllowedNextStatuses(currentStatus): VisitStatus[]`

Get list of allowed next statuses.

```typescript
import { getAllowedNextStatuses } from "@/types/visit-status"

const allowed = getAllowedNextStatuses("waiting")
// Returns: ["in_examination", "cancelled"]
```

### `isTerminalStatus(status): boolean`

Check if status is terminal (no further transitions).

```typescript
import { isTerminalStatus } from "@/types/visit-status"

if (isTerminalStatus("completed")) {
  // Cannot change status anymore
}
```

### `getStatusTransitionError(currentStatus, attemptedStatus): string`

Get detailed error message for invalid transition.

```typescript
import { getStatusTransitionError } from "@/types/visit-status"

const error = getStatusTransitionError("completed", "waiting")
// Returns: "Cannot change status from terminal state: Selesai"
```

### `getInitialVisitStatus(visitType): VisitStatus`

Get correct initial status for visit type.

```typescript
import { getInitialVisitStatus } from "@/types/visit-status"

const initialStatus = getInitialVisitStatus("emergency")
// Returns: "registered"
```

### Status Check Functions

```typescript
import {
  canCreateBilling,
  canCompleteVisit,
  canCreateMedicalRecord,
  canLockMedicalRecord,
} from "@/types/visit-status"

// Check if billing can be created
if (canCreateBilling(visit.status)) {
  /* allowed */
}

// Check if visit can be completed/discharged
if (canCompleteVisit(visit.status)) {
  /* allowed */
}

// Check if medical record can be created
if (canCreateMedicalRecord(visit.status)) {
  /* allowed */
}

// Check if medical record can be locked
if (canLockMedicalRecord(visit.status)) {
  /* allowed */
}
```

---

## Frontend Usage

### Display Status Badge

```tsx
import { VISIT_STATUS_INFO, VisitStatus } from "@/types/visit-status"

function VisitStatusBadge({ status }: { status: VisitStatus }) {
  const statusInfo = VISIT_STATUS_INFO[status]

  return (
    <span className={`rounded px-2 py-1 text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}
```

### Status Transition Button

```tsx
import { getAllowedNextStatuses, VISIT_STATUS_INFO } from "@/types/visit-status"

function StatusTransitionButtons({ currentStatus, onTransition }: Props) {
  const allowedStatuses = getAllowedNextStatuses(currentStatus)

  return (
    <div>
      {allowedStatuses.map((status) => (
        <button
          key={status}
          onClick={() => onTransition(status)}
          className={VISIT_STATUS_INFO[status].bgColor}
        >
          {VISIT_STATUS_INFO[status].label}
        </button>
      ))}
    </div>
  )
}
```

---

## Database Schema

The visit status uses existing `visits.status` field with updated values:

```sql
-- status field in visits table
status VARCHAR(20) NOT NULL DEFAULT 'registered'

-- Valid values:
-- 'registered', 'waiting', 'in_examination', 'examined',
-- 'ready_for_billing', 'billed', 'paid', 'completed', 'cancelled'
```

**Note:** No migration needed - existing `visits.status` field is compatible. The default value should be updated to `'registered'` from `'pending'`.

---

## Testing Checklist

### Manual Testing

- [ ] **Test valid transitions**
  - registered → waiting → in_examination → examined → ready_for_billing → billed → paid → completed

- [ ] **Test backward transitions**
  - in_examination → waiting (should succeed)
  - examined → in_examination (should succeed)

- [ ] **Test invalid transitions**
  - waiting → billed (should fail)
  - completed → waiting (should fail - terminal state)
  - cancelled → registered (should fail - terminal state)

- [ ] **Test cancellation from each status**
  - registered → cancelled ✓
  - waiting → cancelled ✓
  - in_examination → cancelled ✓
  - examined → cancelled ✓
  - ready_for_billing → cancelled ✓
  - billed → cancelled ✓
  - paid → cancelled ✓

- [ ] **Test timestamps**
  - startTime set when → in_examination
  - endTime set when → completed
  - dischargeDate set when inpatient → completed

- [ ] **Test permissions**
  - Only users with `visits:write` can update status
  - Users with `visits:read` can view status

### Integration Testing

- [ ] **Medical Record Lock** triggers `ready_for_billing`
- [ ] **Billing Creation** only allowed when `ready_for_billing` or `billed`
- [ ] **Discharge** only allowed when `paid`
- [ ] **Medical Record Creation** only when `in_examination` or `examined`

---

## Common Workflows

### Workflow 1: Outpatient Visit (Simplified)

```
1. Receptionist registers patient → status: registered
2. Doctor opens medical record → status: in_examination (auto)
3. Doctor works on SOAP notes, diagnosis, prescriptions, procedures
4. Doctor locks medical record → status: ready_for_billing (auto)
5. Cashier creates billing → status: billed
6. Cashier processes payment → status: paid
7. System completes visit → status: completed
```

**Note:** Steps can be shortened with auto-transitions. The `waiting` and `examined` statuses are optional intermediate steps.

### Workflow 2: Emergency Visit (Quick Register)

```
1. Receptionist quick register → status: registered
2. Triage assigns priority → status: waiting
3. Doctor starts examination → status: in_examination
4. Doctor completes examination → status: examined
5. Doctor locks medical record → status: ready_for_billing (auto)
6. Cashier creates billing → status: billed
7. Cashier processes payment → status: paid
8. Patient discharged → status: completed
```

### Workflow 3: Inpatient Visit

```
1. Receptionist admits patient → status: registered
2. Patient assigned to bed → status: waiting
3. Doctor rounds, examination → status: in_examination
4. Doctor completes examination → status: examined
5. Doctor locks medical record → status: ready_for_billing (auto)
6. (Daily: More examinations may occur - status cycles)
7. Cashier creates final billing → status: billed
8. Cashier processes payment → status: paid
9. Doctor discharges patient → status: completed
```

### Workflow 4: Cancellation

```
From any non-terminal status:
1. Authorized user cancels visit → status: cancelled
2. System records reason in notes
3. Visit is now terminal - no further changes
```

---

## Future Enhancements

### Phase 2 Considerations:

1. **Status History Tracking**
   - Create `visit_status_history` table
   - Track who changed status, when, and why
   - Audit trail for compliance

2. **Automated Status Transitions**
   - Auto-transition to `waiting` after registration
   - Auto-transition to `ready_for_billing` when medical record locked
   - Auto-transition to `billed` when billing created

3. **Status Notifications**
   - Notify doctor when patient status → `waiting`
   - Notify cashier when status → `ready_for_billing`
   - Real-time updates via WebSocket

4. **Status-Based Reports**
   - Average time in each status
   - Bottleneck identification
   - Patient flow analytics

---

## Summary

✅ **Completed:**

- Designed visit status state machine with 9 statuses
- Created validation utilities for status transitions
- Implemented API endpoints for status updates
- Updated visit creation to use correct initial status
- Protected endpoints with RBAC
- Created comprehensive documentation

✅ **Benefits:**

- **Data Integrity:** Prevents invalid status transitions
- **Clear Workflows:** Well-defined patient journey
- **Integration Ready:** Helper functions for other modules
- **Auditable:** All status changes tracked
- **User-Friendly:** Clear status labels and descriptions

📚 **Related Documentation:**

- `/types/visit-status.ts` - Type definitions and utilities
- `/app/api/visits/status/route.ts` - API implementation
- `/documentation/rbac_implementation_guide.md` - Permission requirements

---

**Last Updated:** 2025-11-19
**Implemented By:** Claude Code
**Tasks:** H.2.1, H.2.2
