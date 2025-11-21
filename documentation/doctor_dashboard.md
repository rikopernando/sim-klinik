# Doctor Dashboard (H.3.3)

**Patient Queue Management + Quick Access to RME + Patient History**

This document describes the doctor-specific dashboard that provides comprehensive patient queue management, quick access to medical records, and patient history viewing.

---

## Overview

**Task:** H.3.3 - Create doctor dashboard with patient queue, RME access, and history
**Implementation Date:** 2025-11-20
**Status:** ✅ Completed
**Priority:** High

The doctor dashboard is a role-specific view that helps doctors manage their daily workflow by providing real-time patient queue information, quick actions for medical record entry, and access to patient history.

---

## Features

### ✅ Implemented Features

1. **Real-time Statistics**
   - Patients waiting in queue
   - Patients currently being examined
   - Patients completed today
   - Unlocked medical records count

2. **Patient Queue Management**
   - Tabbed interface (Waiting / In Progress / Unlocked RME)
   - Auto-refresh every 30 seconds
   - Patient information with visit details
   - Poli/department information
   - Queue numbers

3. **Quick Actions**
   - Start examination (navigate to RME)
   - Continue examination (resume RME)
   - Lock medical record
   - View patient history

4. **Patient History Integration**
   - Click on any patient to view complete medical history
   - Uses MedicalRecordHistoryDialog component (D.6)
   - Shows SOAP notes, diagnoses, procedures, prescriptions
   - Displays allergy alerts

5. **Auto-refresh**
   - Statistics refresh every 60 seconds
   - Queue refresh every 30 seconds
   - Manual refresh button available

---

## Architecture

### Backend APIs

#### 1. Dashboard Statistics API

**Endpoint:** `/api/dashboard/doctor/stats`
**Method:** `GET`
**Permission:** `medical_records:read`
**File:** `/app/api/dashboard/doctor/stats/route.ts`

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "total": 15,
      "waiting": 5,
      "inProgress": 2,
      "completed": 8
    },
    "unlockedRecords": 3,
    "totalPatients": 245,
    "lastUpdated": "2025-11-20T10:30:00.000Z"
  }
}
```

**Query Logic:**
- Filters visits by `doctorId` (current logged-in doctor)
- Counts visits by status (registered/waiting, in_examination, completed)
- Counts unlocked medical records for this doctor
- Calculates total unique patients (all time)

#### 2. Patient Queue API

**Endpoint:** `/api/dashboard/doctor/queue`
**Method:** `GET`
**Permission:** `visits:read`
**File:** `/app/api/dashboard/doctor/queue/route.ts`

**Query Parameters:**
```
status (optional): "waiting" | "in_examination" | "all"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "visit": {
          "id": 123,
          "visitNumber": "V20251120001",
          "visitType": "outpatient",
          "status": "waiting",
          "queueNumber": "A-05",
          "arrivalTime": "2025-11-20T08:30:00.000Z"
        },
        "patient": {
          "id": 456,
          "name": "John Doe",
          "mrNumber": "MR20251120001",
          "dateOfBirth": "1990-01-15T00:00:00.000Z"
        },
        "poli": {
          "id": 1,
          "name": "Poli Umum",
          "code": "UMUM"
        },
        "medicalRecord": {
          "id": 789,
          "isLocked": false
        }
      }
    ],
    "total": 5
  }
}
```

**Query Logic:**
- Joins visits + patients + polis tables
- Filters by doctor ID
- Filters by status (if provided)
- Checks if medical record exists for each visit
- Orders by arrival time (newest first)

---

### Frontend Components

#### 1. Doctor Dashboard Page

**File:** `/app/dashboard/doctor/page.tsx`
**URL:** `http://localhost:3004/dashboard/doctor`
**Permission Required:** Doctor role

**Component Structure:**
```tsx
<DoctorDashboard>
  {/* Header with title and refresh button */}

  {/* Statistics Section */}
  <DashboardSection title="Statistik Hari Ini">
    <DashboardGrid columns={4}>
      <StatWidget title="Antrian Menunggu" ... />
      <StatWidget title="Sedang Diperiksa" ... />
      <StatWidget title="Selesai Hari Ini" ... />
      <StatWidget title="RME Belum Dikunci" ... />
    </DashboardGrid>
  </DashboardSection>

  {/* Patient Queue Section */}
  <DashboardSection title="Antrian Pasien">
    <Tabs>
      <TabsContent value="waiting">
        <ListWidget items={waitingQueue} />
      </TabsContent>
      <TabsContent value="in_progress">
        <ListWidget items={inProgressQueue} />
      </TabsContent>
      <TabsContent value="unlocked">
        <ListWidget items={unlockedQueue} />
      </TabsContent>
    </Tabs>
  </DashboardSection>

  {/* Patient History Dialog */}
  <MedicalRecordHistoryDialog />
</DoctorDashboard>
```

#### 2. Custom Hooks

**useDoctorStats** (`/hooks/use-doctor-stats.ts`)
```tsx
const { stats, isLoading, lastRefresh, refresh } = useDoctorStats({
    autoRefresh: true,
    refreshInterval: 60000, // 60 seconds
});
```

**useDoctorQueue** (`/hooks/use-doctor-queue.ts`)
```tsx
const { queue, isLoading, refresh } = useDoctorQueue({
    status: "all",
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
});
```

---

## User Workflows

### Workflow 1: Start Examination from Queue

1. Doctor opens dashboard → `/dashboard/doctor`
2. Views "Menunggu" tab showing waiting patients
3. Clicks "Mulai" button on a patient
4. Redirects to → `/dashboard/medical-records/{visitId}`
5. Doctor fills SOAP notes, diagnosis, prescriptions
6. Locks medical record
7. Dashboard auto-updates (patient moves to "Completed")

### Workflow 2: View Patient History Before Examination

1. Doctor sees patient in waiting queue
2. Clicks on patient row (anywhere except action button)
3. Medical record history dialog opens
4. Reviews previous SOAP notes, diagnoses, medications
5. Checks allergy alerts (if any)
6. Closes dialog
7. Clicks "Mulai" to start examination with context

### Workflow 3: Lock Unlocked Medical Records

1. Doctor sees "RME Belum Dikunci" count > 0
2. Switches to "RME Belum Dikunci" tab
3. Sees list of visits with unlocked records
4. Clicks "Kunci RME" button
5. Redirects to medical record page
6. Reviews and locks the record
7. Returns to dashboard (count decreases)

### Workflow 4: Continue In-Progress Examination

1. Doctor sees "Sedang Diperiksa" tab
2. Views patients currently in examination
3. Clicks "Lanjutkan" to resume
4. Continues filling medical record

---

## Dashboard Sections

### 1. Statistics Cards (Top Row)

**Antrian Menunggu**
- Icon: Clock (blue)
- Value: Number of patients waiting
- Badge: "Butuh Perhatian" (if > 0)
- Click: Navigate to "Menunggu" tab

**Sedang Diperiksa**
- Icon: Activity (green)
- Value: Patients currently being examined
- No badge

**Selesai Hari Ini**
- Icon: Stethoscope (purple)
- Value: Completed patients today
- Shows doctor productivity

**RME Belum Dikunci**
- Icon: FileText (orange)
- Value: Number of unlocked medical records
- Badge: "Action Required" (if > 0, red)
- Alerts doctor to complete documentation

### 2. Patient Queue Tabs

**Tab 1: Menunggu**
- Shows patients with status "registered" or "waiting"
- Sorted by arrival time
- Action: "Mulai" → Start examination
- Badge: Visit type (UGD in red, Rawat Jalan in outline)
- Displays: Name, visit number, poli, queue number

**Tab 2: Sedang Diperiksa**
- Shows patients with status "in_examination"
- Action: "Lanjutkan" → Continue examination
- Badge: "Dalam Pemeriksaan" (blue)

**Tab 3: RME Belum Dikunci**
- Shows visits with existing but unlocked medical records
- Action: "Kunci RME" → Go to record and lock it
- Badge: "Belum Dikunci" (red)
- Critical for completing documentation

---

## Integration Points

### With Medical Record Module (D)

- **Navigate to RME:** `/dashboard/medical-records/{visitId}`
- **View History:** Uses `MedicalRecordHistoryDialog` component
- **Lock Status:** Checks `medicalRecords.isLocked` field

### With Queue Module (B.5)

- **Queue Numbers:** Displays `visits.queueNumber`
- **Poli Information:** Joins with `polis` table
- **Visit Status:** Uses visit status lifecycle (H.2.1)

### With RBAC (J)

- **Permission Check:** Requires `medical_records:read` and `visits:read`
- **Doctor Filter:** Only shows visits assigned to current doctor (`visits.doctorId = user.id`)
- **Role-based Access:** Only accessible to users with "doctor" role

---

## Styling & UX

### Color Coding

- **Blue (Clock icon):** Waiting patients - informational
- **Green (Activity icon):** In progress - positive/active
- **Purple (Stethoscope icon):** Completed - success
- **Orange/Red (FileText icon):** Unlocked - warning/action needed

### Visual Hierarchy

1. **Top Priority:** Stat cards (eye-level, quick scan)
2. **Main Content:** Patient queue (largest area)
3. **Actions:** Prominent buttons (right-aligned in list items)

### Responsive Design

- **Desktop:** 4-column stat cards, full-width queue
- **Tablet:** 2-column stat cards, tabbed queue
- **Mobile:** 1-column stat cards, stacked queue

### Empty States

**No Waiting Patients:**
```
Tidak ada pasien dalam antrian
```

**No In-Progress Examinations:**
```
Tidak ada pasien yang sedang diperiksa
```

**All Records Locked:**
```
Semua RME sudah dikunci
```

---

## Auto-refresh Behavior

### Statistics Refresh (60 seconds)

- Total visits count
- Status breakdown
- Unlocked records count
- Doesn't interrupt user interaction

### Queue Refresh (30 seconds)

- Patient list updates
- New patients appear automatically
- Status changes reflected
- Preserves current tab selection

### Manual Refresh

- "Refresh" button in header
- Refreshes both stats and queue
- Shows "Terakhir diperbarui" timestamp
- Provides user control

---

## Performance Considerations

### Optimizations

1. **Selective Queries:**
   - Only fetch visits for current doctor
   - Only fetch today's statistics
   - Filter by status before fetching

2. **Parallel Data Fetching:**
   - Stats and queue load independently
   - Medical record check runs in parallel for each visit

3. **Auto-refresh Intervals:**
   - Stats: 60s (less critical)
   - Queue: 30s (more dynamic)
   - Customizable via hook options

4. **Memoization:**
   - Queue filtering done client-side
   - Reduces API calls when switching tabs

### Database Indexes

Recommended indexes for performance:

```sql
CREATE INDEX idx_visits_doctor_arrival ON visits(doctor_id, arrival_time DESC);
CREATE INDEX idx_visits_doctor_status ON visits(doctor_id, status);
CREATE INDEX idx_medical_records_doctor_locked ON medical_records(doctor_id, is_locked);
```

---

## Error Handling

### API Errors

```tsx
if (error) {
    return (
        <div className="text-destructive">
            Failed to load dashboard: {error}
        </div>
    );
}
```

### Loading States

```tsx
{isLoading && (
    <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
        <span>Loading dashboard...</span>
    </div>
)}
```

### Network Failures

- Auto-retry with exponential backoff
- Display error message with retry button
- Preserve last successful data

---

## Security

### Access Control

- **RBAC Protected:** Only accessible to users with "doctor" role
- **Permission Gated:** API endpoints require specific permissions
- **Data Isolation:** Only shows visits assigned to current doctor

### Data Privacy

- No sensitive data in URLs
- Patient info only visible to assigned doctor
- Medical records protected by additional permissions

### Audit Trail

All actions logged:
- Dashboard access
- Medical record views
- Examination starts
- Record locks

---

## Testing Checklist

- [x] Statistics display correctly
- [x] Queue tabs show appropriate patients
- [x] "Mulai" button navigates to RME
- [x] Patient history dialog opens on click
- [x] Auto-refresh updates data
- [x] Manual refresh button works
- [x] Empty states display properly
- [x] Loading states show during fetch
- [x] Error handling works
- [x] RBAC permissions enforced
- [x] Only doctor's patients shown
- [x] Responsive layout on all screens

---

## Future Enhancements

### Phase 2 Features

1. **Queue Management:**
   - Drag-and-drop to reorder queue
   - Assign patients to other doctors
   - Postpone appointments

2. **Notifications:**
   - Push notifications for new patients
   - Reminders for unlocked records
   - Alert for high-priority patients

3. **Analytics:**
   - Average examination time
   - Patient throughput charts
   - Diagnosis distribution

4. **Filters:**
   - Filter by poli
   - Filter by visit type
   - Search by patient name/MR

5. **Calendar Integration:**
   - View scheduled appointments
   - Block time slots
   - Reschedule visits

---

## Related Documentation

- `/documentation/dashboard_framework.md` - Dashboard component system
- `/documentation/medical_record_history_display.md` - Patient history (D.6)
- `/documentation/rbac_implementation_guide.md` - RBAC permissions
- `/app/dashboard/page.tsx` - Role-based dashboard home

---

## API Reference Summary

### GET /api/dashboard/doctor/stats

**Query:** None
**Response:** Dashboard statistics
**Permission:** `medical_records:read`

### GET /api/dashboard/doctor/queue

**Query:** `status` (optional)
**Response:** Patient queue list
**Permission:** `visits:read`

---

## Usage Example

```tsx
import DoctorDashboard from "@/app/dashboard/doctor/page";

// In routing or role-based redirect
if (user.role === "doctor") {
    return <DoctorDashboard />;
}
```

**Direct Access:** `http://localhost:3004/dashboard/doctor`

---

## Summary

✅ **Task H.3.3 Complete**

**What was implemented:**
- ✅ Real-time doctor dashboard with auto-refresh
- ✅ Patient queue management (3 tabs)
- ✅ Quick access to medical records
- ✅ Patient history integration (D.6)
- ✅ Statistics cards with color coding
- ✅ Backend APIs for stats and queue
- ✅ Custom React hooks for data fetching
- ✅ RBAC protection and data isolation
- ✅ Empty states and error handling
- ✅ Responsive design
- ✅ Comprehensive documentation

**Benefits:**
- Centralized workflow for doctors
- Real-time patient queue visibility
- Quick access to patient history
- Action reminders (unlocked records)
- Improved efficiency and productivity
- Better patient care with context

**Next Steps:**
- H.3.2 - Admin Dashboard
- H.3.4 - Nurse Dashboard
- H.4.1 - Quick Actions Header

---

**Last Updated:** 2025-11-20
**Implemented By:** Claude Code
**Task:** H.3.3
**Technology:** Next.js 15, React, TypeScript, Dashboard Framework (H.3.1)
