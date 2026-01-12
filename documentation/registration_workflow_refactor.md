# Registration Workflow Refactor - Option A Implementation

## Summary

Implemented **Option A: Registration = Room Preference Only** to separate patient admission from bed allocation, following real hospital workflows.

---

## Changes Made

### 1. **InpatientFields Component** (`/components/visits/inpatient-fields.tsx`)

**Before:**
- Room selection dropdown (required field)
- Used hardcoded AVAILABLE_ROOMS data
- Set `visits.roomId` during registration

**After:**
- Informational message only
- No room selection required
- Explains bed assignment will happen next
- Shows user-friendly guidance about the workflow

**UI Change:**
```
┌─────────────────────────────────────────┐
│ 🛈 Pasien Rawat Inap                   │
│                                         │
│ Setelah pendaftaran selesai, Anda      │
│ akan diarahkan untuk mengalokasikan    │
│ kamar dan bed untuk pasien ini.        │
│                                         │
│ 💡 Alokasi bed dapat dilakukan nanti   │
│    jika belum ada kamar yang tersedia  │
└─────────────────────────────────────────┘
```

---

### 2. **Validation Schema** (`/lib/validations/registration.ts`)

**Removed:**
- `roomId` requirement for inpatient visits
- Validation refine block (lines 94-106)

**Updated Comment:**
```typescript
/**
 * Visit Registration Form Validation Schema
 * - Outpatient: Poli and Doctor are required
 * - Inpatient: No additional fields required (bed assignment done separately)
 * - Emergency: Chief complaint is required
 */
```

**Impact:**
- Inpatient registration can now proceed without selecting a room
- `visits.roomId` will be set later during bed assignment
- Faster registration process

---

### 3. **Registration Success Page** (`/app/dashboard/registration/page.tsx`)

**Added:**
- **"Alokasi Bed Sekarang"** button (blue, prominent) for inpatient visits
- Auto-redirects to bed assignment with query parameters
- Only shows "Lihat Antrian" button for outpatient visits

**Button Logic:**
```typescript
{registeredVisit.visit?.visitType === "inpatient" && (
  <Button
    onClick={() =>
      router.push(
        `/dashboard/inpatient/rooms?assignBed=${visitId}&patientName=${name}`
      )
    }
    size="lg"
    className="gap-2 bg-blue-600 hover:bg-blue-700"
  >
    <UserPlus className="h-4 w-4" />
    Alokasi Bed Sekarang
  </Button>
)}
```

**Query Parameters:**
- `assignBed={visitId}` - The visit ID to assign bed for
- `patientName={name}` - Patient name for display

---

### 4. **Room Dashboard** (`/app/dashboard/inpatient/rooms/page.tsx`)

**Added:**
- `useSearchParams()` to read query parameters
- Auto-open bed assignment dialog when coming from registration
- Pass preselected visitId and patientName to dialog

**Auto-Open Logic:**
```typescript
useEffect(() => {
  const assignBedVisitId = searchParams.get("assignBed")
  if (assignBedVisitId && session?.user?.id) {
    setAssignBedDialogOpen(true)
  }
}, [searchParams, session])
```

**Dialog Props:**
```typescript
<AssignBedDialog
  open={assignBedDialogOpen}
  onOpenChange={setAssignBedDialogOpen}
  preselectedVisitId={searchParams.get("assignBed") || undefined}
  preselectedPatientName={searchParams.get("patientName") || undefined}
  preselectedRoomId={selectedRoom?.id}
  assignedBy={session.user.id}
  onSuccess={handleAssignSuccess}
/>
```

---

### 5. **Assign Bed Dialog** (`/components/inpatient/assign-bed-dialog.tsx`)

**Added:**
- `useEffect` to auto-select preselected visit
- Skips patient search when visitId is provided
- Directly shows room/bed selection

**Auto-Selection Logic:**
```typescript
useEffect(() => {
  if (open && preselectedVisitId && preselectedPatientName) {
    setSelectedVisit({
      id: "temp",
      mrNumber: "",
      name: preselectedPatientName,
      visit: {
        id: preselectedVisitId,
        visitNumber: "",
      },
    })
  }
}, [open, preselectedVisitId, preselectedPatientName])
```

---

## Complete User Flow

### **Inpatient Registration → Bed Assignment**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Registration (Front Desk)                          │
│─────────────────────────────────────────────────────────────│
│ 1. Admin searches/adds patient                             │
│ 2. Selects "Rawat Inap" as visit type                      │
│ 3. Fills basic information                                 │
│ 4. Submits registration (NO ROOM SELECTED)                 │
│                                                             │
│ ✅ Visit created with status: pending                       │
│ ✅ visits.roomId = NULL                                     │
│ ✅ No bed assignment record yet                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS SCREEN                                              │
│─────────────────────────────────────────────────────────────│
│ ✓ Pendaftaran Berhasil!                                    │
│                                                             │
│ Detail Kunjungan:                                          │
│ - Nomor Kunjungan: RI-2024-001                             │
│ - Nama: Budi Santoso                                       │
│ - No. RM: MR-001234                                        │
│ - Jenis: Rawat Inap                                        │
│                                                             │
│ [Alokasi Bed Sekarang] ← Blue, prominent                   │
│ [Daftar Pasien Lain]                                       │
│ [Lihat Daftar Pasien]                                      │
│ [Cetak Kartu]                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Click "Alokasi Bed Sekarang")
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Bed Assignment (Ward/Admission)                    │
│─────────────────────────────────────────────────────────────│
│ Redirects to: /dashboard/inpatient/rooms?                  │
│   assignBed=visit-id&patientName=Budi%20Santoso            │
│                                                             │
│ → Room Dashboard opens                                     │
│ → Bed Assignment Dialog AUTO-OPENS                         │
│ → Patient already selected: "Budi Santoso"                 │
│                                                             │
│ Nurse/Admin:                                               │
│ 1. Selects room (e.g., VIP-101)                            │
│ 2. Enters bed number (e.g., 1)                             │
│ 3. Adds notes (optional)                                   │
│ 4. Clicks "Alokasikan Bed"                                 │
│                                                             │
│ ✅ bed_assignments record created                          │
│ ✅ rooms.availableBeds decremented                         │
│ ✅ visits.roomId updated                                   │
│ ✅ visits.admissionDate set                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ RESULT                                                      │
│─────────────────────────────────────────────────────────────│
│ ✓ Patient fully admitted                                   │
│ ✓ Bed allocated                                            │
│ ✓ Ready for clinical care                                  │
│ ✓ Room dashboard shows patient in room                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

### 1. **Follows Real Hospital Workflow**
- Admission clerks don't need real-time bed availability
- Bed allocation handled by specialized ward staff
- Can register patients even when beds are full (waitlist)

### 2. **Better Separation of Concerns**
- **Front Desk**: Patient data entry, visit registration
- **Ward/Admission**: Bed logistics and allocation
- **Nursing Staff**: Clinical care

### 3. **Improved UX**
- Faster registration (fewer required fields)
- Clear workflow guidance
- Seamless redirect to next step
- Auto-populated bed assignment form

### 4. **Flexibility**
- Bed can be assigned immediately (fast track)
- Or assigned later when bed becomes available
- Can reassign bed if needed before final allocation

### 5. **Data Integrity**
- `bed_assignments` table always accurate
- `rooms.availableBeds` count stays synchronized
- No orphaned room selections

---

## Technical Details

### Database State Changes

**After Registration:**
```sql
-- visits table
INSERT INTO visits (
  patient_id,
  visit_type,
  visit_number,
  room_id,        -- NULL
  status,         -- 'pending'
  arrival_time
) VALUES (...);
```

**After Bed Assignment:**
```sql
-- bed_assignments table
INSERT INTO bed_assignments (
  visit_id,
  room_id,
  bed_number,
  assigned_at,
  assigned_by
) VALUES (...);

-- rooms table
UPDATE rooms
SET available_beds = available_beds - 1
WHERE id = room_id;

-- visits table
UPDATE visits
SET
  room_id = room_id,
  admission_date = CURRENT_TIMESTAMP
WHERE id = visit_id;
```

---

## Migration Notes

### For Existing Installations

If you have existing inpatient visits with `roomId` but no `bed_assignments`:

```sql
-- Find orphaned inpatient visits
SELECT v.id, v.visit_number, v.room_id, v.patient_id
FROM visits v
LEFT JOIN bed_assignments ba ON ba.visit_id = v.id AND ba.discharged_at IS NULL
WHERE v.visit_type = 'inpatient'
  AND v.room_id IS NOT NULL
  AND ba.id IS NULL;
```

**Action Required:**
1. Manually assign beds for these visits through the UI
2. Or run a migration script to create bed_assignments records
3. Or clear `visits.roomId` for pending visits

---

## Future Enhancements

1. **Bed Waitlist Feature**
   - Queue patients when no beds available
   - Auto-notify when bed becomes available

2. **Bed Reservation**
   - Reserve bed before patient arrives
   - Time-limited reservations

3. **Preferred Room Type**
   - Optional field during registration
   - Helps ward staff choose appropriate room

4. **Transfer Between Beds**
   - Move patient to different room/bed
   - Track transfer history

---

## Testing Checklist

- [ ] Register new inpatient patient
- [ ] Verify roomId is NULL after registration
- [ ] Click "Alokasi Bed Sekarang" button
- [ ] Verify redirect to room dashboard with query params
- [ ] Verify bed assignment dialog auto-opens
- [ ] Verify patient name pre-filled
- [ ] Select room and bed, submit
- [ ] Verify bed_assignments record created
- [ ] Verify rooms.availableBeds decremented
- [ ] Verify visits.roomId updated
- [ ] Verify room dashboard shows patient
- [ ] Register outpatient patient
- [ ] Verify no bed assignment button shown
- [ ] Verify "Lihat Antrian" button shown instead

---

**Document Version:** 1.0
**Last Updated:** 2025-12-21
**Status:** ✅ Implemented and Ready for Testing
