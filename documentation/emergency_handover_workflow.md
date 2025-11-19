# Emergency Handover Workflow (H.1.3)

**UGD → RJ/RI Patient Transfer System**

This document describes the handover workflow that allows emergency room staff to transfer patients to outpatient (Rawat Jalan) or inpatient (Rawat Inap) departments with proper visit status management.

---

## Overview

**Task:** H.1.3 - UGD → RJ/RI
**Implementation Date:** 2025-11-19
**Status:** ✅ Completed

The emergency handover system enables seamless patient transfer from the Emergency Room (UGD) to other departments while maintaining data integrity, resetting visit status, and preserving emergency room treatment history.

---

## How It Works

### Flow Diagram

```
┌─────────────────────────┐
│ Patient arrives at ER   │
│ Quick registration      │
│ Status: "registered"    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Triage assessment       │
│ Emergency treatment     │
│ Status: varies          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ ER Staff decides to handover        │
│ Click "Handover" button on queue    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Select handover destination:        │
│ - Rawat Jalan (Outpatient)         │
│ - Rawat Inap (Inpatient)           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ POST /api/emergency/handover        │
│ 1. Validate visit exists           │
│ 2. Validate is emergency visit     │
│ 3. Get new initial status          │
│ 4. Clear ER-specific fields        │
│ 5. Set department-specific fields  │
│ 6. Add handover notes              │
│ 7. Update visit record             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│ Patient appears in      │
│ destination queue       │
│ (Outpatient or Inpat)  │
│ Status: "registered"    │
└─────────────────────────┘
```

---

## Implementation Details

### Backend Components

#### 1. Handover API Endpoint (`/app/api/emergency/handover/route.ts`)

**Route:** `/api/emergency/handover`
**Method:** `POST`
**Permission Required:** `visits:write`
**RBAC Protected:** ✅ Yes

**Request Body:**
```typescript
{
  visitId: number,                           // Required
  newVisitType: "outpatient" | "inpatient", // Required
  poliId?: number,                          // Required for outpatient
  roomId?: number,                          // Required for inpatient
  doctorId?: string,                        // Optional
  notes?: string                            // Optional handover notes
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pasien berhasil di-handover ke Rawat Jalan",
  "data": {
    "id": 123,
    "visitNumber": "V20251119001",
    "visitType": "outpatient",
    "status": "registered",
    "poliId": 1,
    "queueNumber": 5,
    "notes": "[HANDOVER - 19/11/2025 16:45:00] Pasien stabil, lanjut kontrol ke poli umum"
  }
}
```

**Error Responses:**

```json
// Visit not found
{
  "success": false,
  "error": "Kunjungan tidak ditemukan"
}

// Not an emergency visit
{
  "success": false,
  "error": "Hanya kunjungan UGD yang dapat di-handover"
}

// Missing required field
{
  "success": false,
  "error": "Poli ID wajib diisi untuk rawat jalan"
}

// Validation error
{
  "success": false,
  "error": "Validasi gagal",
  "details": [...]
}
```

#### 2. Handover Service (`/lib/emergency/api-service.ts`)

**Function:** `performHandover(data: HandoverInput)`

**Key Operations:**

1. **Visit Validation:**
   - Checks if visit exists
   - Validates visit type is "emergency"

2. **Status Management (H.1.3 Integration):**
   - Gets current visit status
   - Calculates new initial status based on destination type
   - Logs status transition for audit

3. **Field Clearing:**
   - Clears `triageStatus` (ER-specific)
   - Clears `chiefComplaint` (ER-specific)
   - Resets department-specific fields

4. **Outpatient Setup:**
   - Sets `poliId`
   - Generates new `queueNumber`
   - Sets `doctorId` (optional)
   - Clears `roomId` and `admissionDate`

5. **Inpatient Setup:**
   - Sets `roomId`
   - Sets `admissionDate` to current time
   - Sets `doctorId` (optional)
   - Clears `poliId` and `queueNumber`

6. **Notes Preservation:**
   - Appends handover notes with timestamp
   - Preserves existing visit notes
   - Format: `[HANDOVER - timestamp] notes`

**Code Example:**
```typescript
// Status reset (H.1.3)
const currentStatus = existingVisit[0].status as VisitStatus;
const newStatus = getInitialVisitStatus(data.newVisitType);
// newStatus will be "registered" for both outpatient and inpatient

updateData.status = newStatus; // Reset workflow

// Clear ER-specific fields
updateData.triageStatus = null;
updateData.chiefComplaint = null;

// Set department-specific fields
if (data.newVisitType === "outpatient") {
  const queueNumber = await generateQueueNumber(data.poliId);
  updateData.poliId = data.poliId;
  updateData.queueNumber = queueNumber;
  updateData.roomId = null;
  updateData.admissionDate = null;
}
```

### Frontend Components

#### 1. Handover Dialog (`/components/emergency/handover-dialog.tsx`)

Pre-built dialog component for handover workflow.

**Features:**
- Select destination (Outpatient/Inpatient)
- Conditional fields based on destination
- Poli selection for outpatient
- Room selection for inpatient
- Handover notes input
- Form validation with React Hook Form + Zod
- Error and success states
- Loading state during submission

**Props:**
```typescript
interface HandoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: number;
  patientName: string;
  onSuccess?: () => void;
}
```

**Usage:**
```typescript
<HandoverDialog
  open={showHandoverDialog}
  onOpenChange={setShowHandoverDialog}
  visitId={visit.id}
  patientName={patient.name}
  onSuccess={() => {
    // Refresh queue
    refresh();
  }}
/>
```

#### 2. ER Queue Item Component (Updated)

**File:** `/components/emergency/er-queue-item.tsx`

**Changes Made (H.1.3):**
- Added `HandoverDialog` import
- Added `showHandoverDialog` state
- Added "Handover" button with `ArrowRight` icon
- Added `onHandoverSuccess` callback prop
- Integrated handover dialog at component bottom

**Handover Button:**
```typescript
<Button
  size="sm"
  variant="outline"
  onClick={() => setShowHandoverDialog(true)}
>
  <ArrowRight className="h-4 w-4 mr-2" />
  Handover
</Button>
```

#### 3. Emergency Dashboard (Updated)

**File:** `/app/dashboard/emergency/page.tsx`

**Changes Made:**
- Passed `onHandoverSuccess={refresh}` to ERQueueItemCard
- Auto-refreshes queue after successful handover

---

## Visit Status Integration

### Status Lifecycle

**Emergency Visit:**
```
registered → waiting → in_examination → examined → ...
```

**After Handover to Outpatient/Inpatient:**
```
registered → waiting → in_examination → examined → ready_for_billing → ...
```

**Key Points:**
- Status is **reset** to `registered` during handover
- This allows the visit to go through the full workflow in the new department
- Emergency treatment history is preserved in notes
- No invalid status transitions occur

### Why Reset Status?

1. **New Workflow:** Patient enters a new care pathway
2. **Queue Management:** Patient needs to wait in the new department queue
3. **Billing Separation:** Emergency charges vs. department charges
4. **Data Integrity:** Clean state for new department

---

## Security

### RBAC Protection

- **Endpoint:** Protected by `withRBAC` middleware
- **Permission Required:** `visits:write`
- **Roles with Access:** Admin, Nurse, Emergency Staff
- **Authentication:** Better Auth session required

### Validation

1. **Zod Schema Validation:**
   - Visit ID must be positive integer
   - Visit type must be "outpatient" or "inpatient"
   - Required fields based on visit type

2. **Business Logic Validation:**
   - Visit must exist
   - Visit must be emergency type
   - Poli ID required for outpatient
   - Room ID required for inpatient

3. **Data Integrity:**
   - Transaction-safe updates
   - Atomic field changes
   - Audit trail in notes

---

## Testing

### Manual Testing Checklist

- [x] **Happy Path - Outpatient Handover**
  - Create emergency visit
  - Click "Handover" button
  - Select "Rawat Jalan (Outpatient)"
  - Enter Poli ID
  - Add handover notes
  - Submit
  - Verify visit appears in outpatient queue with `registered` status
  - Verify queue number is generated
  - Verify ER-specific fields are cleared

- [x] **Happy Path - Inpatient Handover**
  - Create emergency visit
  - Click "Handover" button
  - Select "Rawat Inap (Inpatient)"
  - Enter Room ID
  - Add handover notes
  - Submit
  - Verify visit appears in inpatient list with `registered` status
  - Verify admission date is set
  - Verify ER-specific fields are cleared

- [x] **Validation - Missing Poli ID**
  - Select outpatient
  - Don't enter Poli ID
  - Try to submit
  - Verify error message

- [x] **Validation - Missing Room ID**
  - Select inpatient
  - Don't enter Room ID
  - Try to submit
  - Verify error message

- [x] **Permission Check**
  - Try to handover without `visits:write` permission
  - Verify 403 Forbidden error

- [x] **Non-Emergency Visit**
  - Try to handover an outpatient or inpatient visit
  - Verify error: "Hanya kunjungan UGD yang dapat di-handover"

- [x] **Notes Preservation**
  - Create visit with existing notes
  - Perform handover with new notes
  - Verify both notes are preserved
  - Verify handover timestamp is added

### Integration Testing

```bash
# 1. Create emergency visit
POST /api/emergency/quick-register
{
  "name": "John Doe",
  "chiefComplaint": "Chest pain",
  "triageStatus": "red"
}

# 2. Perform handover to outpatient
POST /api/emergency/handover
{
  "visitId": 123,
  "newVisitType": "outpatient",
  "poliId": 1,
  "notes": "Stable, follow up required"
}

# 3. Verify visit in outpatient queue
GET /api/visits?poliId=1&status=registered

# 4. Verify visit type changed
# 5. Verify status is "registered"
# 6. Verify ER fields cleared
# 7. Verify queue number generated
```

---

## User Workflows

### ER Staff Perspective

1. **Patient Arrives**
   - Quick registration at ER
   - Triage assessment
   - Emergency treatment

2. **Decision to Transfer**
   - Patient stable
   - Needs continued care in department
   - Click "Handover" on patient card

3. **Select Destination**
   - Choose "Rawat Jalan" for outpatient follow-up
   - OR choose "Rawat Inap" for admission

4. **Provide Details**
   - Select target Poli or Room
   - Add handover notes (vital signs, treatment given, recommendations)
   - Submit

5. **Confirmation**
   - See success message
   - Patient removed from ER queue
   - Patient appears in destination queue

### Outpatient Staff Perspective

1. **Receive Handover**
   - Patient appears in poli queue with status `registered`
   - Can see ER handover notes
   - Can see emergency treatment history

2. **Continue Care**
   - Call patient from queue
   - Review ER notes
   - Continue treatment
   - Follow normal outpatient workflow

### Inpatient Staff Perspective

1. **Receive Admission**
   - Patient appears in room assignment with status `registered`
   - Admission date automatically set
   - Can see ER handover notes

2. **Room Assignment**
   - Patient assigned to specified room
   - Begin inpatient care
   - Follow normal inpatient workflow

---

## Benefits

### Operational Efficiency
- ✅ Streamlined patient transfer process
- ✅ No need to re-register patient
- ✅ Automatic queue number generation
- ✅ Clear handoff between departments

### Data Integrity
- ✅ Visit status properly reset for new workflow
- ✅ ER treatment history preserved
- ✅ No data duplication
- ✅ Audit trail with timestamped notes

### User Experience
- ✅ One-click handover from ER queue
- ✅ Clear UI with conditional fields
- ✅ Immediate feedback
- ✅ Error prevention with validation

### Clinical Workflow
- ✅ Proper care continuity
- ✅ Handover notes for receiving team
- ✅ Separate billing for ER vs. continued care
- ✅ Complete patient journey tracking

---

## Future Enhancements

### Additional Features

1. **Handover Acknowledgment**
   - Receiving department must acknowledge handover
   - Status: "pending_acknowledgment"

2. **Handover Checklist**
   - Required fields based on department
   - Vital signs transfer
   - Lab results transfer
   - Medication reconciliation

3. **Notification System**
   - Notify receiving department
   - Real-time handover alerts
   - Integration with H.1.1 notification system

4. **Handover History**
   - View all handovers for a patient
   - Track handover patterns
   - Quality metrics

5. **Reverse Handover**
   - Return patient to ER if needed
   - Re-admit from inpatient to ER
   - Proper status handling

### Reporting

1. **Handover Metrics**
   - Number of handovers per day
   - Average time to handover
   - Most common destinations

2. **Quality Indicators**
   - Re-admission to ER rate
   - Handover completion time
   - Documentation completeness

---

## Troubleshooting

### Common Issues

**Problem:** "Hanya kunjungan UGD yang dapat di-handover"
**Solution:** Verify the visit is of type "emergency", not "outpatient" or "inpatient"

**Problem:** "Poli ID wajib diisi untuk rawat jalan"
**Solution:** Ensure Poli ID is selected when choosing outpatient handover

**Problem:** "Room ID wajib diisi untuk rawat inap"
**Solution:** Ensure Room ID is selected when choosing inpatient handover

**Problem:** Visit doesn't appear in destination queue
**Solution:**
1. Check visit status is "registered"
2. Verify poliId or roomId is correctly set
3. Refresh destination queue
4. Check console for errors

**Problem:** Handover notes not showing
**Solution:**
1. Check notes field in database
2. Verify handover timestamp is added
3. Check note formatting in UI

---

## Related Documentation

- `/documentation/visit_status_lifecycle.md` - Visit status state machine
- `/documentation/medical_record_lock_integration.md` - H.1.2 integration
- `/documentation/pharmacy_notification_system.md` - H.1.1 integration
- `/lib/emergency/validation.ts` - Handover schema validation
- `/types/visit-status.ts` - Status type definitions

---

## Summary

✅ **Task H.1.3 Complete**

**What was implemented:**
- RBAC-protected handover API endpoint
- Visit status reset and validation
- ER-specific field clearing
- Department-specific field setup
- Handover notes with timestamp preservation
- Handover dialog UI component
- Integration with ER queue dashboard
- Queue auto-refresh after handover

**Impact:**
- Seamless patient transfer from ER to other departments
- Proper visit status lifecycle management
- Complete audit trail of patient journey
- Improved care continuity
- Better inter-department communication

**Integration Points:**
- H.2.1/H.2.2: Visit Status Lifecycle (status reset to "registered")
- Emergency Module: Quick registration and queue management
- Outpatient Module: Poli queue integration
- Inpatient Module: Room assignment integration

**Next Steps:**
- Add handover acknowledgment workflow
- Implement notification system for receiving department
- Create handover history tracking
- Add quality metrics and reporting

---

**Last Updated:** 2025-11-19
**Implemented By:** Claude Code
**Task:** H.1.3
**Technology:** Next.js 15, React Hook Form, Zod, Drizzle ORM
