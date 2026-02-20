# Emergency Module Enhancement - Implementation Summary

## Overview

This document summarizes the implementation of all recommended improvements for the Emergency (UGD) module, organized into 4 phases.

**Implementation Date:** January 2025
**Branch:** `emergency`

---

## Phase 1: Security - RBAC Protection

### Objective

Secure all emergency API endpoints with proper role-based access control.

### Changes Made

#### 1. Quick Registration Endpoint

**File:** `app/api/emergency/quick-register/route.ts`

- Added `withRBAC` middleware wrapper
- Allowed roles: `receptionist`, `nurse`, `doctor`, `admin`, `super_admin`
- Returns 401 for unauthenticated requests
- Returns 403 for unauthorized roles

#### 2. Complete Registration Endpoint

**File:** `app/api/emergency/complete-registration/route.ts`

- Added `withRBAC` middleware wrapper
- Allowed roles: `receptionist`, `nurse`, `admin`, `super_admin`
- Note: `doctor` role excluded as registration completion is typically handled by admin staff

### Testing Checklist

- [ ] Access quick-register without auth → should get 401
- [ ] Access with non-allowed role → should get 403
- [ ] Access with allowed role → should work

---

## Phase 2: UX Improvements

### Objective

Improve queue usability with search, waiting time display, and better filtering.

### Changes Made

#### 1. Wait Time Calculation Helpers

**File:** `lib/emergency/triage-utils.ts`

Added new functions:

- `calculateWaitTimeMinutes(arrivalTime)` - Calculates minutes since arrival
- `formatWaitTime(minutes)` - Formats as "X menit" or "X jam Y menit"
- `isWaitTimeExceeded(arrivalTime, triageStatus)` - Checks if threshold exceeded
- `getWaitTimeAlertLevel(arrivalTime, triageStatus)` - Returns "critical" | "warning" | "normal"

Wait time thresholds by triage level:
| Triage | Alert Threshold |
|--------|-----------------|
| Red | > 5 minutes |
| Yellow | > 15 minutes |
| Green | > 30 minutes |
| Untriaged | > 10 minutes |

#### 2. Patient Search

**File:** `hooks/use-er-queue.ts`

- Added `search` option to hook
- Client-side filtering by patient name, MR number, or NIK
- Memoized filtering for performance

**File:** `app/dashboard/emergency/page.tsx`

- Added search input in header area
- Implemented 300ms debounce to reduce re-renders
- Search icon with placeholder text

#### 3. Waiting Time Display

**File:** `components/emergency/er-queue-item.tsx`

- Displays formatted wait time instead of "arrived X ago"
- Color-coded based on alert level:
  - Normal: Muted text color
  - Warning: Orange text
  - Critical: Red text with bold font
- Warning triangle icon for exceeded thresholds
- Auto-updates every minute

#### 4. Incomplete Registration Indicator

**File:** `components/emergency/er-queue-item.tsx`

- Checks if patient NIK is null/empty
- Shows orange badge "Data Belum Lengkap" for incomplete registrations

### Testing Checklist

- [ ] Search patients by name → should filter queue
- [ ] Search by MR number → should filter queue
- [ ] Search by NIK → should filter queue
- [ ] Verify waiting time displays correctly
- [ ] Verify color changes based on wait time threshold
- [ ] Verify "Data Belum Lengkap" shows for incomplete registrations

---

## Phase 3: Real-time Updates & Alerts

### Objective

Replace polling with SSE for instant updates and add critical patient alerts.

### Changes Made

#### 1. ER SSE Notification Endpoint

**File:** `app/api/notifications/emergency/route.ts` (NEW)

- Server-Sent Events endpoint at `/api/notifications/emergency`
- Protected with RBAC: `nurse`, `doctor`, `receptionist`, `admin`, `super_admin`
- Uses existing SSE infrastructure from pharmacy module

#### 2. ER Notification Types

**File:** `lib/notifications/sse-manager.ts`

Added new notification types:

- `er_new_patient` - When quick registration completes
- `er_status_change` - When patient status changes
- `er_triage_change` - When triage level changes

Data interfaces:

```typescript
interface ERNewPatientData {
  visitId: string
  patientName: string
  patientMRNumber: string
  triageStatus: "red" | "yellow" | "green"
  chiefComplaint: string
  arrivalTime: Date
}

interface ERStatusChangeData {
  visitId: string
  patientName: string
  oldStatus: string
  newStatus: string
}

interface ERTriageChangeData {
  visitId: string
  patientName: string
  oldTriage: "red" | "yellow" | "green" | null
  newTriage: "red" | "yellow" | "green"
}
```

#### 3. ER Notifications Hook

**File:** `lib/notifications/use-er-notifications.ts` (NEW)

React hook features:

- EventSource connection to `/api/notifications/emergency`
- Auto-reconnect on disconnect
- Callback for new patient arrivals
- Browser notification support
- Cleanup on unmount

#### 4. SSE Broadcast on Registration

**File:** `app/api/emergency/quick-register/route.ts`

- Broadcasts `er_new_patient` notification after successful registration
- Includes patient name, MR number, triage status, chief complaint

#### 5. Queue Page SSE Integration

**File:** `app/dashboard/emergency/page.tsx`

- Uses SSE when connected, falls back to polling when disconnected
- Reduced polling interval to 60s (was 30s) when SSE connected
- Shows "Live" badge when SSE connected, "Polling" when disconnected
- Auto-refreshes queue on new patient notification
- Toast notification for new arrivals

#### 6. Audio Alert for Red Triage

**File:** `app/dashboard/emergency/page.tsx`

- Audio element for emergency alert sound
- Plays alert when Red triage patient arrives
- Sound toggle button in header
- Preference saved to localStorage

**Required:** Add audio file at `public/sounds/emergency-alert.mp3`

#### 7. Visual Highlight for Critical Patients

**File:** `components/emergency/er-queue-item.tsx`

- Pulsing border animation for Red triage patients
- Optional `isNew` prop for highlighting newly arrived patients

**File:** `app/globals.css`

```css
@keyframes pulse-border {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.4);
  }
}

.animate-pulse-border {
  animation: pulse-border 2s ease-in-out infinite;
}
```

### Testing Checklist

- [ ] Open queue in two browsers → changes in one should appear in other instantly
- [ ] Register Red triage patient → audio alert should play (if sound enabled)
- [ ] New patient should show toast notification
- [ ] Red triage patient cards should have pulsing animation
- [ ] Sound toggle button should persist preference

---

## Phase 4: Clinical & Operational Enhancements

### Objective

Add vital signs tracking, print functionality, and pre-handover validation.

### Changes Made

#### 1. ER Vitals Chart Component

**File:** `components/emergency/er-vitals-chart.tsx` (NEW)

Features:

- Displays latest vitals with trend indicators (up/down/stable)
- Color-coded abnormal values (outside normal range)
- Normal range display for each vital sign
- Timeline view for vitals history
- Consciousness level badge

Vital signs tracked:
| Vital | Unit | Normal Range |
|-------|------|--------------|
| Temperature | °C | 36-37.5 |
| Blood Pressure | mmHg | 90/60-120/80 |
| Pulse | x/min | 60-100 |
| Respiratory Rate | x/min | 12-20 |
| SpO2 | % | >95 |
| Pain Scale | /10 | 0-3 |

#### 2. ER Print Summary Component

**File:** `components/emergency/er-print-summary.tsx` (NEW)

Printable summary includes:

- Patient information (name, MR, NIK, gender, DOB, address, phone)
- Visit information (visit number, arrival time, triage status, disposition)
- Vital signs summary
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Diagnoses (ICD-10 codes)
- Procedures (ICD-9 codes)
- Prescriptions
- Print metadata (date, printed by)
- Signature area for attending physician

#### 3. Handover Print Component

**File:** `components/emergency/handover-print.tsx` (NEW)

Printable handover document includes:

- Handover metadata (from unit, to unit, time, staff)
- Patient identification
- Visit and triage information
- Latest vital signs
- Diagnoses
- Clinical summary (history, treatment given, current condition, pending tasks)
- Handover notes
- Dual signature areas (sender and receiver)

#### 4. Pre-handover Validation

**File:** `components/emergency/handover-dialog.tsx`

Validation checklist before handover:

- [ ] Diagnosis recorded
- [ ] Vital signs recorded
- [ ] Chief complaint documented

Features:

- Shows warning alert if validation fails
- Checklist with green check/red X icons
- Override option with checkbox acknowledgment
- Requires override reason if bypassing validation
- Override reason prepended to handover notes

Interface:

```typescript
interface HandoverValidation {
  hasDiagnosis: boolean
  hasVitals: boolean
  hasChiefComplaint: boolean
}
```

### Testing Checklist

- [ ] Vitals chart displays latest readings correctly
- [ ] Trend indicators show correct direction
- [ ] Abnormal values highlighted in red
- [ ] Print summary generates correct document
- [ ] Handover print includes all relevant information
- [ ] Handover blocked when validation fails
- [ ] Override works with reason provided

---

## File Summary

### Modified Files

| File                                               | Changes                       |
| -------------------------------------------------- | ----------------------------- |
| `app/api/emergency/quick-register/route.ts`        | RBAC + SSE broadcast          |
| `app/api/emergency/complete-registration/route.ts` | RBAC                          |
| `app/dashboard/emergency/page.tsx`                 | Search, SSE, audio alerts     |
| `components/emergency/er-queue-item.tsx`           | Wait time, badges, animations |
| `components/emergency/handover-dialog.tsx`         | Pre-handover validation       |
| `hooks/use-er-queue.ts`                            | Search parameter              |
| `lib/emergency/triage-utils.ts`                    | Wait time helpers             |
| `lib/notifications/sse-manager.ts`                 | ER notification types         |
| `app/globals.css`                                  | Pulse animation               |

### New Files

| File                                        | Purpose                 |
| ------------------------------------------- | ----------------------- |
| `app/api/notifications/emergency/route.ts`  | SSE endpoint            |
| `lib/notifications/use-er-notifications.ts` | SSE React hook          |
| `components/emergency/er-vitals-chart.tsx`  | Vitals timeline/chart   |
| `components/emergency/er-print-summary.tsx` | Print ER summary        |
| `components/emergency/handover-print.tsx`   | Print handover document |

### Required Assets

| File                                | Status                        |
| ----------------------------------- | ----------------------------- |
| `public/sounds/emergency-alert.mp3` | **REQUIRED** - Add audio file |

---

## Integration Notes

### Using the Vitals Chart

```tsx
import { ERVitalsChart } from "@/components/emergency/er-vitals-chart"
;<ERVitalsChart vitalsHistory={vitalsData} isLoading={isLoading} />
```

### Using Print Components

```tsx
import { ERPrintSummary } from "@/components/emergency/er-print-summary"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

const printRef = useRef()
const handlePrint = useReactToPrint({ content: () => printRef.current })

<ERPrintSummary ref={printRef} data={summaryData} />
<button onClick={handlePrint}>Print</button>
```

### Passing Validation to Handover Dialog

```tsx
<HandoverDialog
  open={open}
  onOpenChange={setOpen}
  visitId={visitId}
  patientName={patientName}
  validation={{
    hasDiagnosis: diagnoses.length > 0,
    hasVitals: vitalsHistory.length > 0,
    hasChiefComplaint: !!visit.chiefComplaint,
  }}
  onSuccess={handleSuccess}
/>
```

---

## Future Improvements

1. **Vitals Recording Form** - Add inline vitals recording from ER dashboard
2. **Print Button Integration** - Add print buttons to ER medical record page
3. **Status Change SSE** - Broadcast `er_status_change` when visit status updates
4. **Triage Change SSE** - Broadcast `er_triage_change` when triage level updates
5. **Sound File** - Add professional alert sound file
6. **Mobile Responsiveness** - Optimize queue display for mobile devices
