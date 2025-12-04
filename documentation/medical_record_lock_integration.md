# Medical Record Lock Integration (H.1.2)

**Auto-Update Visit Status When Medical Record is Locked**

This document describes the integration between Medical Records and Visit Status modules that automatically updates a visit's status to "ready_for_billing" when a medical record is locked.

---

## Overview

**Task:** H.1.2 - RME → Kasir
**Implementation Date:** 2025-11-19
**Status:** ✅ Completed

When a doctor locks a medical record (indicating the examination is complete and the record is finalized), the system automatically updates the associated visit status to `ready_for_billing`. This triggers the billing workflow and ensures visits are properly tracked through their lifecycle.

---

## How It Works

### Flow Diagram

```
┌─────────────────────────┐
│ Doctor completes exam   │
│ Creates medical record  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Doctor locks medical    │
│ record (finalizes)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ POST /api/medical-records/lock  │
│ 1. Lock medical record          │
│ 2. Get associated visit         │
│ 3. Validate status transition   │
│ 4. Update visit status to       │
│    "ready_for_billing"          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Visit ready for billing │
│ Cashier can create bill │
└─────────────────────────┘
```

---

## Implementation Details

### Endpoint

**Route:** `/app/api/medical-records/lock/route.ts`

**Method:** `POST`

**Permission Required:** `medical_records:lock`

**Request Body:**

```json
{
  "id": 123 // Medical record ID
}
```

### Process Steps

1. **Validate Medical Record**
   - Check if medical record exists
   - Check if already locked
   - Get associated visit

2. **Validate Visit Status Transition**
   - Get current visit status
   - Validate that transition to `ready_for_billing` is allowed
   - Only allow if current status is `examined`

3. **Lock Medical Record**
   - Set `isLocked` to `true`
   - Set `isDraft` to `false`
   - Record `lockedAt` timestamp
   - Record `lockedBy` user ID

4. **Update Visit Status** (H.1.2 Integration)
   - Update visit status to `ready_for_billing`
   - Update `updatedAt` timestamp

5. **Return Success Response**
   - Include locked medical record data
   - Include updated visit information
   - Show previous and new status

---

## Response Examples

### Success Response (200)

```json
{
  "success": true,
  "message": "Medical record locked successfully. Visit is now ready for billing.",
  "data": {
    "medicalRecord": {
      "id": 123,
      "visitId": 456,
      "doctorId": "user_abc123",
      "isLocked": true,
      "isDraft": false,
      "lockedAt": "2025-11-19T10:30:00.000Z",
      "lockedBy": "user_abc123",
      "updatedAt": "2025-11-19T10:30:00.000Z"
    },
    "visit": {
      "id": 456,
      "visitNumber": "V20251119001",
      "previousStatus": "examined",
      "newStatus": "ready_for_billing"
    }
  }
}
```

### Error Response - Medical Record Not Found (404)

```json
{
  "error": "Medical record not found"
}
```

### Error Response - Already Locked (400)

```json
{
  "error": "Medical record is already locked"
}
```

### Error Response - Invalid Status Transition (400)

```json
{
  "error": "Cannot lock medical record",
  "message": "Visit status \"waiting\" cannot transition to \"ready_for_billing\". Visit must be in \"examined\" status.",
  "currentStatus": "waiting"
}
```

### Error Response - Visit Not Found (404)

```json
{
  "error": "Associated visit not found"
}
```

---

## Status Transition Requirements

### Valid Transition

For the lock operation to succeed, the visit must be in `examined` status:

```
examined → ready_for_billing ✅
```

### Invalid Transitions

The lock operation will fail if the visit is in any other status:

```
registered → ready_for_billing ❌
waiting → ready_for_billing ❌
in_examination → ready_for_billing ❌
ready_for_billing → ready_for_billing ❌ (already there)
billed → ready_for_billing ❌
paid → ready_for_billing ❌
completed → ready_for_billing ❌
cancelled → ready_for_billing ❌
```

**Reason:** The visit must be in `examined` status to ensure:

1. Medical examination is complete
2. Medical record has been created
3. All clinical data is documented
4. Visit is ready for financial processing

---

## Integration Points

### With Visit Status Module

- Uses `isValidStatusTransition()` to validate status changes
- Follows visit status state machine rules
- Ensures data integrity across modules

### With Billing Module

- After status becomes `ready_for_billing`, cashier can create billing
- Billing module should check visit status before creating bills
- See billing integration documentation

### With Medical Records Module

- Lock is triggered by doctor after completing examination
- Once locked, medical record becomes immutable
- No further edits allowed after lock

---

## Code Example

### Frontend - Lock Medical Record

```typescript
async function lockMedicalRecord(medicalRecordId: string) {
  try {
    const response = await fetch("/api/medical-records/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: medicalRecordId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error)
    }

    console.log("Medical record locked")
    console.log("Visit status updated to:", data.data.visit.newStatus)

    // Show success message
    toast.success(data.message)

    // Optionally navigate to billing
    router.push(`/dashboard/cashier?visitId=${data.data.visit.id}`)
  } catch (error) {
    console.error("Error locking medical record:", error)
    toast.error(error.message)
  }
}
```

### Backend - Check Visit Status Before Creating Billing

```typescript
import { canCreateBilling } from "@/types/visit-status"

// In billing creation endpoint
const visit = await getVisit(visitId)

if (!canCreateBilling(visit.status)) {
  return NextResponse.json(
    {
      error: "Cannot create billing",
      message: "Visit is not ready for billing. Medical record must be locked first.",
    },
    { status: 400 }
  )
}

// Proceed with billing creation
```

---

## User Workflow

### Doctor's Perspective

1. **Examine Patient**
   - Visit status: `in_examination`

2. **Create Medical Record**
   - Fill SOAP notes
   - Add diagnoses
   - Prescribe medications
   - Add procedures
   - Visit status: `examined`

3. **Lock Medical Record**
   - Click "Lock Medical Record" button
   - System locks medical record
   - System automatically updates visit status to `ready_for_billing`
   - Doctor sees success message

### Cashier's Perspective

1. **View Billing Queue**
   - See list of visits with status `ready_for_billing`
   - Filter by visit status

2. **Create Billing**
   - Select visit
   - System validates visit status
   - Generate bill items
   - Process payment

---

## Testing Checklist

### Manual Testing

- [ ] **Happy Path**
  - Create medical record for visit in `examined` status
  - Lock medical record
  - Verify visit status updates to `ready_for_billing`
  - Verify medical record is locked (`isLocked = true`)

- [ ] **Already Locked**
  - Try to lock an already locked medical record
  - Verify error: "Medical record is already locked"

- [ ] **Invalid Visit Status**
  - Create medical record for visit in `waiting` status
  - Try to lock medical record
  - Verify error about invalid status transition

- [ ] **Missing Visit**
  - Create medical record with invalid visitId
  - Try to lock medical record
  - Verify error: "Associated visit not found"

- [ ] **Permission Check**
  - Try to lock medical record without `medical_records:lock` permission
  - Verify 403 Forbidden error

### Integration Testing

- [ ] **Billing Integration**
  - Lock medical record
  - Verify billing can be created for the visit
  - Verify billing cannot be created before lock

- [ ] **Status History**
  - Lock multiple medical records
  - Verify all visit statuses updated correctly
  - Verify timestamps are recorded

---

## Changes Made

### File Modified

**`/app/api/medical-records/lock/route.ts`**

**Changes:**

1. ✅ Added RBAC protection with `withRBAC`
2. ✅ Added imports for visit status validation
3. ✅ Removed `userId` from request schema (use authenticated user)
4. ✅ Added visit lookup after medical record check
5. ✅ Added visit status transition validation
6. ✅ Added automatic visit status update to `ready_for_billing`
7. ✅ Enhanced response to include visit status update information
8. ✅ Added proper error handling for invalid transitions

---

## Benefits

### Data Integrity

- ✅ Ensures visits progress through proper lifecycle
- ✅ Validates status transitions before allowing lock
- ✅ Prevents locked records for visits not ready for billing

### Workflow Automation

- ✅ Eliminates manual status update step
- ✅ Reduces human error
- ✅ Streamlines doctor-to-cashier handoff

### User Experience

- ✅ One-click operation (lock + status update)
- ✅ Clear success/error messages
- ✅ Immediate feedback on workflow progression

### Business Logic

- ✅ Enforces that billing can only happen after examination complete
- ✅ Prevents premature billing
- ✅ Maintains clinical workflow integrity

---

## Future Enhancements

### Notifications (H.1.1)

When H.1.1 is implemented, add real-time notification to cashier:

```typescript
// After updating visit status
await sendNotification({
  to: "cashier",
  type: "visit_ready_for_billing",
  data: {
    visitId: visit.id,
    visitNumber: visit.visitNumber,
    patientName: patient.name,
  },
})
```

### Status History Tracking

Log all status changes for audit trail:

```typescript
await db.insert(visitStatusHistory).values({
  visitId: visit.id,
  previousStatus: currentStatus,
  newStatus: "ready_for_billing",
  changedBy: user.id,
  changedAt: new Date(),
  trigger: "medical_record_locked",
  medicalRecordId: medicalRecord.id,
})
```

---

## Related Documentation

- `/documentation/visit_status_lifecycle.md` - Visit status state machine
- `/documentation/rbac_implementation_guide.md` - RBAC permissions
- `/types/visit-status.ts` - Status type definitions
- `/app/api/visits/status/route.ts` - Visit status API

---

## Summary

✅ **Task H.1.2 Complete**

**What was implemented:**

- Automatic visit status update when medical record is locked
- Status transition validation
- RBAC protection
- Comprehensive error handling
- Enhanced response with visit status information

**Impact:**

- Seamless integration between Medical Records and Billing modules
- Automated workflow progression
- Data integrity maintained
- Better user experience for doctors and cashiers

**Next Steps:**

- H.1.1: Implement real-time notifications for prescriptions
- H.1.3: Implement UGD handover workflow
- Test end-to-end workflow from examination to billing

---

**Last Updated:** 2025-11-19
**Implemented By:** Claude Code
**Task:** H.1.2
