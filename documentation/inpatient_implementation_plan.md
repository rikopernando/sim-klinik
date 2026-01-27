# Inpatient Feature - Implementation Plan

## Executive Summary

This document outlines the comprehensive implementation plan for the **Inpatient (Rawat Inap)** module of Sim-Klinik. The plan is divided into 4 phases, following the user journey documented in `/documentation/user_journey.md` and user stories in `/documentation/app_flow_document.md` (Modul 3).

**Current Status:**

- ✅ Database schema complete (rooms, bed_assignments, vitals_history, material_usage, unified medical_records)
- ✅ Room dashboard exists (`/app/dashboard/inpatient/rooms/page.tsx`)
- ✅ Phase 1 - Core Inpatient Management (COMPLETED)
- ✅ Phase 2 - Clinical Documentation (COMPLETED)
- ✅ Phase 3.1 - Material Usage Recording (COMPLETED)
- ✅ Additional Features: Lock/Unlock, Prescriptions, Procedures (COMPLETED)
- ✅ Billing Integration - "Selesai Rawat Inap" (COMPLETED via CompleteDischargeDialog)
- 🔄 Phase 4 - Discharge Process (CURRENT PHASE)

---

## Database Schema Analysis

### Existing Tables (Already Implemented)

#### 1. **rooms** (`db/schema/inpatient.ts:9-26`)

- Room management with bed tracking
- Fields: roomNumber, roomType, bedCount, availableBeds, floor, building, dailyRate, facilities, status
- Ready to use ✅

#### 2. **bed_assignments** (`db/schema/inpatient.ts:69-85`)

- Track patient bed assignments
- Fields: visitId, roomId, bedNumber, assignedAt, dischargedAt, assignedBy, notes
- Ready to use ✅

#### 3. **vitals_history** (`db/schema/inpatient.ts:32-63`)

- Comprehensive vital signs tracking
- Fields: temperature, bloodPressure, pulse, respiratoryRate, oxygenSaturation, weight, height, bmi, painScale, consciousness
- Ready to use ✅

#### 4. **material_usage** (`db/schema/inpatient.ts:91-107`)

- Track medical materials/supplies used
- Fields: materialName, quantity, unit, unitPrice, totalPrice, usedBy, usedAt
- Ready to use ✅

#### 5. **cppt** (`db/schema/medical-records.ts:85-107`)

- Integrated Progress Notes (Catatan Perkembangan Pasien Terintegrasi)
- Fields: authorId, authorRole, subjective, objective, assessment, plan, progressNote, instructions
- Ready to use ✅

#### 6. **visits** (`db/schema/visits.ts:9-45`)

- Visit tracking with inpatient fields
- Relevant fields: visitType, roomId, admissionDate, dischargeDate, disposition
- Ready to use ✅

#### 7. **billing_items** (`db/schema/billing.ts:70-93`)

- Supports itemType: 'room', 'material', 'service', 'drug'
- Used for daily room charges and material billing
- Ready to use ✅

#### 8. **discharge_summaries** (`db/schema/billing.ts:130-161`)

- Complete medical summary for discharge
- Fields: admissionDiagnosis, dischargeDiagnosis, clinicalSummary, proceduresPerformed, medicationsOnDischarge, dischargeInstructions, followUpDate
- Ready to use ✅

### Schema Gaps & Requirements

✅ **No schema changes needed** - All required tables exist and are properly structured.

---

## Implementation Phases

---

## Completed Phases Summary

### ✅ **Phase 1: Core Inpatient Management** (COMPLETED)

**Implemented Features:**

- ✅ Bed assignment/allocation dialog and API
- ✅ Room dashboard with real-time bed availability
- ✅ Inpatient patient list with filters and search
- ✅ Patient detail dashboard with comprehensive information
- ✅ Bed transfer functionality
- ✅ Bed assignment history tracking

### ✅ **Phase 2: Clinical Documentation** (COMPLETED)

**Implemented Features:**

- ✅ Vital signs recording with full vitals tracking
- ✅ Vital signs history table with delete functionality (1-hour window)
- ✅ CPPT (Integrated Progress Notes) for doctors and nurses
- ✅ CPPT history with edit/delete functionality
- ✅ Vitals trend chart for clinical analysis
- ✅ CPPT timeline view
- ✅ Lock/Unlock feature for visits (ready_for_billing status)

### ✅ **Phase 3.1: Material Usage & Additional Features** (COMPLETED)

**Implemented Features:**

- ✅ Material usage recording from unified inventory
- ✅ Material usage history with cost tracking
- ✅ Material delete functionality (1-hour window)
- ✅ Inpatient prescriptions (create, list, delete, administer)
- ✅ Inpatient procedures (create, list, status updates, delete)
- ✅ Billing integration - "Selesai Rawat Inap" button (CompleteDischargeDialog)
  - Aggregates room charges, materials, procedures, prescriptions
  - Creates billing record
  - Available when visit status allows

---

### **Phase 1: Core Inpatient Management** (REFERENCE - COMPLETED)

**Goal:** Enable basic inpatient admission, bed assignment, and patient list management

#### Phase 1.1: Bed Assignment/Allocation

**User Story:** "Perawat/Admin melihat Dashboard Kamar → Memilih/mengalokasikan Kamar/Bed"

**Tasks:**

1. **Create bed assignment dialog component**
   - Location: `/components/inpatient/assign-bed-dialog.tsx`
   - Features:
     - Room selection dropdown (filter by availability)
     - Bed number input
     - Patient search/selection
     - Visit validation (must be visitType='inpatient')
     - Assignment notes field
   - Validation:
     - Room must have available beds
     - Patient must have active inpatient visit
     - Bed number must be unique within room

2. **Create bed assignment API endpoint**
   - Location: `/app/api/inpatient/assign-bed/route.ts`
   - Method: POST
   - Business Logic:
     - Create bed_assignments record
     - Update rooms.availableBeds (decrement)
     - Update visits.roomId
     - Validate room availability
   - Transaction: Ensure atomic operation

3. **Update room dashboard page**
   - Location: `/app/dashboard/inpatient/rooms/page.tsx` (existing)
   - Add "Alokasi Bed" button on each room card
   - Show current bed assignments with patient names
   - Real-time bed count updates

4. **Create custom hooks**
   - `/hooks/use-bed-assignment.ts` - Handles bed assignment logic
   - `/hooks/use-available-rooms.ts` - Fetches rooms with available beds

**API Endpoints:**

- `POST /api/inpatient/assign-bed` - Assign patient to bed
- `GET /api/inpatient/available-rooms` - Get rooms with available beds
- `GET /api/inpatient/bed-assignments?roomId={id}` - Get assignments for specific room

**Components:**

- `/components/inpatient/assign-bed-dialog.tsx`
- `/components/inpatient/bed-assignment-card.tsx`

**Acceptance Criteria:**

- [ ] Perawat can allocate bed from room dashboard
- [ ] System validates room availability before assignment
- [ ] availableBeds count updates automatically
- [ ] Cannot assign bed to non-inpatient visits
- [ ] Cannot assign more beds than room capacity

---

#### Phase 1.2: Inpatient Patient List

**User Story:** "Perawat melihat daftar pasien rawat inap aktif dengan informasi ringkas"

**Tasks:**

1. **Create inpatient patient list page**
   - Location: `/app/dashboard/inpatient/patients/page.tsx`
   - Features:
     - Table view with patient info (MR Number, Name, Room, Bed, Admission Date, Days)
     - Search by patient name, MR number, room number
     - Filter by room type, floor, admission date range
     - Sort by admission date, room number, patient name
     - Click row to navigate to patient detail dashboard
   - Real-time updates (polling or WebSocket)

2. **Create inpatient list API endpoint**
   - Location: `/app/api/inpatient/patients/route.ts`
   - Method: GET
   - Query params: search, roomType, floor, admissionDateFrom, admissionDateTo, sortBy, sortOrder
   - Returns: Array of active inpatient visits with patient, room, bed assignment, latest vitals

3. **Create inpatient list components**
   - `/components/inpatient/patient-list-table.tsx` - Main table component
   - `/components/inpatient/patient-list-row.tsx` - Table row component
   - `/components/inpatient/patient-list-filters.tsx` - Filter controls

4. **Create custom hooks**
   - `/hooks/use-inpatient-list.ts` - Fetch and manage patient list with filters/search
   - `/hooks/use-patient-search.ts` - Reusable patient search logic

**API Endpoints:**

- `GET /api/inpatient/patients` - Get all active inpatient patients with filters

**Components:**

- `/components/inpatient/patient-list-table.tsx`
- `/components/inpatient/patient-list-row.tsx`
- `/components/inpatient/patient-list-filters.tsx`

**Acceptance Criteria:**

- [ ] Show all active inpatient patients (admissionDate exists, dischargeDate is null)
- [ ] Search works across patient name, MR number, room number
- [ ] Filters work correctly (room type, floor, date range)
- [ ] Click patient row navigates to detail dashboard
- [ ] List updates when new patient admitted or discharged
- [ ] Calculate and display "Days in Hospital"

---

#### Phase 1.3: Patient Detail Dashboard

**User Story:** "Perawat/Dokter mengakses dashboard detail pasien rawat inap untuk melihat ringkasan dan melakukan tindakan"

**Tasks:**

1. **Create patient detail dashboard page**
   - Location: `/app/dashboard/inpatient/patients/[visitId]/page.tsx`
   - Layout: Tabs or cards for different sections
   - Sections:
     - **Patient Info Card**: Name, MR Number, NIK, Age, Gender, Insurance
     - **Admission Info Card**: Admission Date, Days in Hospital, Room, Bed, Admitting Doctor
     - **Latest Vitals Card**: Display most recent vital signs with timestamp
     - **Quick Actions**: Record Vitals, Add CPPT, Record Materials, View Full History
   - Navigation: Back to patient list, discharge patient (if authorized)

2. **Create patient detail API endpoint**
   - Location: `/app/api/inpatient/patients/[visitId]/route.ts`
   - Method: GET
   - Returns: Complete patient data including:
     - Patient demographics
     - Visit info (admission date, room, bed, doctor)
     - Latest vital signs
     - Latest CPPT entries (last 3)
     - Material usage summary (total cost)
     - Billing summary (current total)

3. **Create dashboard components**
   - `/components/inpatient/patient-info-card.tsx`
   - `/components/inpatient/admission-info-card.tsx`
   - `/components/inpatient/latest-vitals-card.tsx`
   - `/components/inpatient/quick-actions-panel.tsx`

4. **Create custom hooks**
   - `/hooks/use-inpatient-details.ts` - Fetch patient detail data

**API Endpoints:**

- `GET /api/inpatient/patients/[visitId]` - Get complete patient dashboard data

**Components:**

- `/components/inpatient/patient-info-card.tsx`
- `/components/inpatient/admission-info-card.tsx`
- `/components/inpatient/latest-vitals-card.tsx`
- `/components/inpatient/quick-actions-panel.tsx`

**Acceptance Criteria:**

- [ ] Dashboard displays complete patient information
- [ ] Latest vitals shown with timestamp and recorded by
- [ ] Quick actions navigate to respective forms/dialogs
- [ ] Calculate days in hospital accurately
- [ ] Show billing summary (total charges to date)
- [ ] Refresh data on return from quick actions

---

### **Phase 2: Clinical Documentation** (NEXT PHASE)

**Goal:** Enable comprehensive clinical documentation for inpatient care

#### Phase 2.1: Vital Signs Recording

**User Story:** "Perawat mencatat Tanda-Tanda Vital secara berkala (misal: per 8 jam)"

**Tasks:**

1. **Create vitals recording dialog**
   - Location: `/components/inpatient/record-vitals-dialog.tsx`
   - Fields: All fields from vitals_history table
   - Auto-calculate BMI from height and weight
   - Validation: Realistic ranges for each vital sign
   - Quick entry mode for common vitals (temp, BP, pulse, RR, SpO2)
   - Extended mode for full vitals including weight, height, pain scale

2. **Create vitals recording API endpoint**
   - Location: `/app/api/inpatient/vitals/route.ts`
   - Method: POST
   - Validation: Check visit exists and is inpatient type
   - Auto-populate recordedBy from session
   - Auto-populate recordedAt timestamp

3. **Create vitals history component**
   - Location: `/components/inpatient/vitals-history-table.tsx`
   - Display vitals in chronological order
   - Highlight abnormal values (high/low thresholds)
   - Filter by date range
   - Export to PDF for medical records

**API Endpoints:**

- `POST /api/inpatient/vitals` - Create vitals record
- `GET /api/inpatient/vitals?visitId={id}` - Get vitals history
- `DELETE /api/inpatient/vitals/[id]` - Delete vitals record (within 1 hour)

**Components:**

- `/components/inpatient/record-vitals-dialog.tsx`
- `/components/inpatient/vitals-history-table.tsx`
- `/components/inpatient/vitals-chart.tsx` (line chart for trends)

**Acceptance Criteria:**

- [ ] Perawat can quickly record common vitals
- [ ] BMI auto-calculated when height and weight entered
- [ ] Abnormal values highlighted (configurable thresholds)
- [ ] Vitals history shows who recorded and when
- [ ] Cannot edit vitals after 1 hour (create new entry instead)

---

#### Phase 2.2: CPPT (Integrated Progress Notes)

**User Story:** "Perawat/Dokter mencatat Catatan Perkembangan Pasien Terintegrasi (CPPT)"

**Tasks:**

1. **Create CPPT recording dialog**
   - Location: `/components/inpatient/cppt-dialog.tsx`
   - Fields: subjective, objective, assessment, plan, progressNote, instructions
   - Auto-populate authorRole based on user role
   - Support for both doctor and nurse entries
   - Rich text editor for progress notes

2. **Create CPPT API endpoint**
   - Location: `/app/api/inpatient/cppt/route.ts`
   - Method: POST
   - Auto-populate authorId from session
   - Validation: Visit must be active inpatient

3. **Create CPPT history component**
   - Location: `/components/inpatient/cppt-history.tsx`
   - Timeline view with alternating doctor/nurse entries
   - Color-coded by role (doctor: blue, nurse: green)
   - Expandable/collapsible entries
   - Filter by author role, date range

**API Endpoints:**

- `POST /api/inpatient/cppt` - Create CPPT entry
- `GET /api/inpatient/cppt?visitId={id}` - Get CPPT history
- `PUT /api/inpatient/cppt/[id]` - Edit CPPT (within 2 hours)
- `DELETE /api/inpatient/cppt/[id]` - Delete CPPT (within 1 hour)

**Components:**

- `/components/inpatient/cppt-dialog.tsx`
- `/components/inpatient/cppt-history.tsx`
- `/components/inpatient/cppt-entry-card.tsx`

**Acceptance Criteria:**

- [ ] Both doctors and nurses can create CPPT entries
- [ ] Entries clearly show author name, role, and timestamp
- [ ] Timeline view shows chronological progression
- [ ] Cannot edit CPPT after 2 hours (accountability)
- [ ] Full SOAP format supported for doctors

---

#### Phase 2.3: Vitals & CPPT Charts/Trends

**User Story:** "Dokter melihat grafik tren vital signs dan riwayat CPPT untuk analisis klinis"

**Tasks:**

1. **Create vitals trend chart component**
   - Location: `/components/inpatient/vitals-trend-chart.tsx`
   - Use recharts or similar library
   - Multi-line chart: Temperature, BP (systolic/diastolic), Pulse, RR, SpO2
   - Date range selector (24h, 3 days, 7 days, full admission)
   - Hover tooltip with exact values and timestamp
   - Normal range shading (background color for normal zones)

2. **Create CPPT timeline component**
   - Location: `/components/inpatient/cppt-timeline.tsx`
   - Visual timeline with date markers
   - Group entries by day
   - Quick preview on hover, click for full view

3. **Integrate into patient detail dashboard**
   - Add "Charts & Trends" tab
   - Side-by-side: Vitals chart (left), CPPT timeline (right)

**Components:**

- `/components/inpatient/vitals-trend-chart.tsx`
- `/components/inpatient/cppt-timeline.tsx`

**Acceptance Criteria:**

- [ ] Charts render with smooth animations
- [ ] Date range filtering works correctly
- [ ] Normal ranges clearly visible
- [ ] Abnormal values highlighted on chart
- [ ] CPPT timeline grouped by day

---

### **Phase 3: Billing Integration** (PARTIALLY COMPLETED)

**Goal:** Seamless integration with billing system for room charges and materials

**✅ COMPLETED: "Selesai Rawat Inap" - Billing Creation**

- Implemented via `CompleteDischargeDialog` component
- Location: `/components/inpatient/complete-discharge-dialog.tsx`
- Pre-check: Discharge summary must exist
- Aggregates all billing items: room charges, materials, procedures, prescriptions
- Creates comprehensive billing record
- Status remains 'ready_for_billing' for payment processing

<!-- #### Phase 3.1: Daily Room Charges (DEPRECATED - handled by CompleteDischargeDialog)
**User Story:** "Sistem otomatis menghitung biaya kamar harian dan menambahkan ke billing"

**Tasks:**
1. **Create daily room charge cron job**
   - Location: `/app/api/cron/daily-room-charges/route.ts`
   - Schedule: Run at midnight daily (00:00)
   - Logic:
     - Find all active inpatient visits (admissionDate exists, dischargeDate null)
     - For each visit, calculate days stayed
     - Add billing_items for room charges (itemType: 'room')
     - Update billing subtotal and totalAmount
   - Use database transactions

2. **Create manual room charge trigger**
   - Location: `/components/inpatient/manual-room-charge-dialog.tsx`
   - Use case: Manual adjustment, backdated charges
   - Fields: Date range, room rate override, notes
   - Validation: Cannot charge for future dates

3. **Update billing detail panel**
   - Show room charges separately in billing breakdown
   - Display: Daily rate × Number of days

**API Endpoints:**
- `POST /api/cron/daily-room-charges` - Cron job to calculate daily charges
- `POST /api/inpatient/room-charges/manual` - Manual room charge entry

**Components:**
- `/components/inpatient/manual-room-charge-dialog.tsx`

**Acceptance Criteria:**
- [ ] Cron job runs reliably at midnight
- [ ] Room charges added to billing automatically
- [ ] Manual charges require admin/cashier authorization
- [ ] Room rate changes handled correctly (use rate at admission)
- [ ] Partial day charges on discharge date -->

---

#### Phase 3.1: Material Usage Recording

**User Story:** "Perawat/Dokter mencatat pemakaian alat/material medis yang dikenakan biaya"

**Tasks:**

1. **Create material usage dialog**
   - Location: `/components/inpatient/record-material-dialog.tsx`
   - Features:
     - Material search (autocomplete from master data)
     - Quantity input with unit
     - Unit price (auto-filled, can override)
     - Auto-calculate total price
     - Usage notes
   - Save to material_usage table

2. **Create material usage API endpoint**
   - Location: `/app/api/inpatient/materials/route.ts`
   - Method: POST
   - Transaction:
     - Insert into material_usage

3. **Create material usage history component**
   - Location: `/components/inpatient/material-usage-history.tsx`
   - Display materials used with date, quantity, cost
   - Group by date
   - Show total material cost

**API Endpoints:**

- `POST /api/inpatient/materials` - Record material usage
- `GET /api/inpatient/materials?visitId={id}` - Get material usage history
- `DELETE /api/inpatient/materials/[id]` - Delete material record (within 1 hour)

**Components:**

- `/components/inpatient/record-material-dialog.tsx`
- `/components/inpatient/material-usage-history.tsx`

**Acceptance Criteria:**

- [ ] Unit price auto-filled from master data
- [ ] Can override price with notes
- [ ] Material usage history shows who recorded
- [ ] Cannot delete material after 1 hour

---

### **Phase 4: Discharge Process** (CURRENT PHASE)

**Goal:** Complete discharge workflow with medical summary and final discharge

**Real-Life Hospital Discharge Flow:**

```
Step 1: Discharge Summary (Resume Medis) by Doctor
   ↓ Sets visit status to 'ready_for_billing' (LOCKS visit clinically)

Step 2: "Selesai Rawat Inap" - Billing Creation [✅ ALREADY IMPLEMENTED]
   ↓ Pre-check: Discharge summary must exist
   ↓ Aggregates all existing billing items (room, materials, procedures, prescriptions)
   ↓ Status remains 'ready_for_billing'

Step 3: Payment Processing (Kasir Module)
   ↓ Cashier processes payment until LUNAS

Step 4: Final Discharge
   ↓ Release bed, set dischargeDate, status to 'completed'
```

#### Phase 4.1: Discharge Summary (Resume Medis)

**User Story:** "Dokter mengisi Ringkasan Medis Pulang dan instruksi kontrol"

**Important Notes:**

- This is a **MEDICAL DOCUMENT** for patient to take home
- "Procedures performed" = **documentation only** (already billed during hospitalization)
- "Medications on discharge" = **prescriptions for HOME use** (NOT what was given during hospitalization)
- Completing this summary **LOCKS the visit** by setting status to 'ready_for_billing'

**Tasks:**

1. **Create discharge summary form dialog**
   - Location: `/components/inpatient/discharge-summary-dialog.tsx`
   - Fields from discharge_summaries table:
     - Admission diagnosis (ICD-10)
     - Discharge diagnosis (ICD-10)
     - Clinical summary (course of treatment during hospitalization)
     - Procedures performed (documentation - list of procedures already done and billed)
     - Medications on discharge (prescriptions for patient to buy at pharmacy for home use)
     - Discharge instructions (wound care, activity restrictions, etc.)
     - Dietary restrictions
     - Activity restrictions
     - Follow-up date
     - Follow-up instructions
   - Rich text editor for lengthy fields
   - ICD-10 autocomplete for diagnoses

2. **Create discharge summary API endpoint**
   - Location: `/app/api/inpatient/discharge-summary/route.ts`
   - Method: POST, GET
   - Validation: Visit must be inpatient type and in 'in_examination' status
   - **On save: Update visit.status to 'ready_for_billing'** (LOCKS the visit)
   - Only doctors can create discharge summary

3. **Create discharge summary view component**
   - Location: `/components/inpatient/discharge-summary-view.tsx`
   - Display discharge summary in readable format
   - Printable format
   - Export to PDF (future enhancement)

**API Endpoints:**

- `POST /api/inpatient/discharge-summary` - Create discharge summary and lock visit
- `GET /api/inpatient/discharge-summary?visitId={id}` - Get discharge summary

**Components:**

- `/components/inpatient/discharge-summary-dialog.tsx`
- `/components/inpatient/discharge-summary-view.tsx`

**Acceptance Criteria:**

- [ ] Only doctors can create discharge summary
- [ ] ICD-10 autocomplete for admission and discharge diagnosis
- [ ] Visit status changes to 'ready_for_billing' on save (LOCKS visit)
- [ ] Discharge summary appears on patient detail page
- [ ] Cannot create discharge summary if visit already locked

---

#### Phase 4.2: Final Discharge (Pasien Pulang)

**User Story:** "Pasien pulang fisik dari rumah sakit setelah billing lunas dan bed dirilis"

**Important Notes:**

- This is the **FINAL STEP** after payment is LUNAS
- "Selesai Rawat Inap" (billing creation) is **ALREADY IMPLEMENTED** via `CompleteDischargeDialog`
- This phase is about the **physical discharge** - releasing the bed and completing the visit

**Tasks:**

1. **Create final discharge dialog**
   - Location: `/components/inpatient/final-discharge-dialog.tsx`
   - Pre-checks before allowing discharge:
     - Discharge summary exists ✅
     - Billing status is 'paid' (LUNAS) ✅
     - Visit status is 'ready_for_billing' ✅
   - Show pre-check status with visual indicators (checkmarks)
   - Confirmation dialog with patient info
   - Actions on discharge:
     - Set visit.dischargeDate (current timestamp)
     - Set bed_assignments.dischargedAt (current timestamp)
     - Update rooms.availableBeds (increment by 1)
     - Set visit.status to 'completed'

2. **Create final discharge API endpoint**
   - Location: `/app/api/inpatient/final-discharge/route.ts`
   - Method: POST
   - Pre-check validations:
     - Discharge summary must exist
     - Billing must be 'paid'
     - Visit must be 'ready_for_billing'
   - Transaction: Update visit, bed_assignments, rooms atomically
   - Permissions: discharge:write

3. **Update patient detail dashboard**
   - Add "Pasien Pulang" button (visible after billing is paid)
   - Show discharge eligibility status
   - Disable button if pre-checks fail
   - Show helpful error messages for failed pre-checks

**API Endpoints:**

- `POST /api/inpatient/final-discharge` - Complete final discharge
- `GET /api/inpatient/discharge/eligibility?visitId={id}` - Check discharge eligibility

**Components:**

- `/components/inpatient/final-discharge-dialog.tsx`
- `/components/inpatient/discharge-eligibility-check.tsx` (shows pre-check status)

**Acceptance Criteria:**

- [ ] Cannot discharge if billing status is not 'paid'
- [ ] Cannot discharge without discharge summary
- [ ] Bed released automatically (availableBeds incremented)
- [ ] Visit status changes to 'completed'
- [ ] visit.dischargeDate is set to current timestamp
- [ ] bed_assignments.dischargedAt is set to current timestamp
- [ ] All operations happen in a transaction (atomic)
- [ ] Clear error messages if pre-checks fail

---

## Technical Architecture

### Directory Structure

```
app/
├── dashboard/
│   └── inpatient/
│       ├── patients/
│       │   ├── page.tsx                    # Patient list
│       │   └── [visitId]/
│       │       └── page.tsx                # Patient detail dashboard
│       └── rooms/
│           └── page.tsx                    # Room dashboard (existing)
└── api/
    └── inpatient/
        ├── assign-bed/
        │   └── route.ts                    # Bed assignment
        ├── patients/
        │   ├── route.ts                    # Patient list
        │   └── [visitId]/
        │       └── route.ts                # Patient detail
        ├── vitals/
        │   ├── route.ts                    # Create/list vitals
        │   └── [id]/
        │       └── route.ts                # Delete vitals
        ├── cppt/
        │   ├── route.ts                    # Create/list CPPT
        │   └── [id]/
        │       └── route.ts                # Edit/delete CPPT
        ├── materials/
        │   ├── route.ts                    # Record/list materials
        │   └── [id]/
        │       └── route.ts                # Delete material
        ├── discharge-summary/
        │   ├── route.ts                    # Create/get summary
        │   └── [id]/
        │       ├── route.ts                # Update summary
        │       └── finalize/
        │           └── route.ts            # Finalize summary
        └── discharge/
            ├── route.ts                    # Discharge patient
            └── pre-check/
                └── route.ts                # Check discharge eligibility

components/
└── inpatient/
    ├── assign-bed-dialog.tsx
    ├── bed-assignment-card.tsx
    ├── patient-list-table.tsx
    ├── patient-list-row.tsx
    ├── patient-list-filters.tsx
    ├── patient-info-card.tsx
    ├── admission-info-card.tsx
    ├── latest-vitals-card.tsx
    ├── quick-actions-panel.tsx
    ├── record-vitals-dialog.tsx
    ├── vitals-history-table.tsx
    ├── vitals-trend-chart.tsx
    ├── cppt-dialog.tsx
    ├── cppt-history.tsx
    ├── cppt-timeline.tsx
    ├── cppt-entry-card.tsx
    ├── record-material-dialog.tsx
    ├── material-usage-history.tsx
    ├── discharge-summary-form.tsx
    ├── discharge-summary-view.tsx
    ├── discharge-patient-dialog.tsx
    └── discharge-pre-check.tsx

hooks/
└── use-bed-assignment.ts
└── use-available-rooms.ts
└── use-inpatient-list.ts
└── use-patient-search.ts
└── use-inpatient-details.ts
└── use-vitals-recording.ts
└── use-cppt.ts
└── use-material-usage.ts
└── use-discharge.ts

types/
└── inpatient.ts                            # TypeScript interfaces
```

### Key Patterns

**Custom Hooks Pattern:**

- All data fetching in custom hooks
- Hooks handle loading states, errors, and mutations
- Components remain presentational

**Modular Components:**

- Break down complex forms into sub-components
- Reusable dialog components
- Separate view and edit modes

**API Design:**

- RESTful endpoints
- Consistent error handling
- Transaction support for multi-table operations
- Validation at API level

**Type Safety:**

- TypeScript interfaces for all data structures
- Drizzle ORM for type-safe database queries
- Zod validation schemas

---

## Security & Access Control

### Role-Based Permissions

| Feature                  | Admin | Doctor | Nurse | Cashier |
| ------------------------ | ----- | ------ | ----- | ------- |
| Assign bed               | ✅    | ✅     | ✅    | ❌      |
| Record vitals            | ✅    | ✅     | ✅    | ❌      |
| Create CPPT (doctor)     | ✅    | ✅     | ❌    | ❌      |
| Create CPPT (nurse)      | ✅    | ❌     | ✅    | ❌      |
| Record materials         | ✅    | ✅     | ✅    | ❌      |
| Create discharge summary | ✅    | ✅     | ❌    | ❌      |
| Discharge patient        | ✅    | ✅     | ❌    | ❌      |
| View billing             | ✅    | ✅     | ✅    | ✅      |

**Implementation:**

- Use Better Auth session to get user role
- Middleware checks on API routes
- UI elements hidden based on role
- Database triggers for audit trail

---

## Testing Strategy

### Unit Tests

- Test custom hooks (use-inpatient-list, use-bed-assignment, etc.)
- Test utility functions (BMI calculation, days calculation)
- Test validation schemas

### Integration Tests

- Test API endpoints with mock data
- Test bed assignment workflow (assign → update counts)
- Test discharge workflow (all pre-checks)

### E2E Tests

- Complete inpatient journey: Admission → Vitals → CPPT → Materials → Discharge
- Bed assignment and release
- Billing integration (room charges, materials)

---

## Performance Considerations

### Database Optimization

- Index on visits.visitType, visits.status for patient list queries
- Index on bed_assignments.visitId, bed_assignments.roomId
- Index on vitals_history.visitId, vitals_history.recordedAt for chronological queries
- Compound index on cppt (visitId, createdAt) for timeline queries

### Caching Strategy

- Room dashboard: Cache room occupancy for 30 seconds (high read frequency)
- Patient list: Polling every 30 seconds (real-time feel without WebSocket overhead)
- Vitals history: Cache per visit for 5 minutes

### Query Optimization

- Use Drizzle's `with` for eager loading (patient + visit + room + bed_assignments in one query)
- Paginate patient list (20 per page)
- Limit vitals history to last 100 entries, with "Load More" option

---

## Migration Plan

### Phase 1 Rollout

1. Deploy database schema (already done ✅)
2. Deploy room dashboard (already done ✅)
3. Deploy bed assignment feature
4. Deploy patient list page
5. Deploy patient detail dashboard
6. User training: Perawat and Admin roles
7. Monitor for bugs and performance issues

### Phase 2 Rollout

1. Deploy vitals recording
2. Deploy CPPT
3. Deploy charts/trends
4. User training: Doctors and Nurses
5. Parallel run: Use paper forms + system for 1 week
6. Full cutover

### Phase 3 & 4 Rollout

- Similar phased approach
- Intensive testing before production

---

## Success Metrics

### Phase 1

- [ ] 100% of inpatient admissions use bed assignment feature
- [ ] Average time to assign bed: < 2 minutes
- [ ] Zero bed count discrepancies

### Phase 2

- [ ] Vitals recorded every 8 hours for all inpatient patients
- [ ] CPPT entries: Minimum 1 per day per patient
- [ ] Doctor satisfaction score: ≥ 4/5 with charts feature

### Phase 3

- [ ] 100% room charges automated
- [ ] Material usage recording: < 5 minutes per entry
- [ ] Billing discrepancies: < 1% of cases

### Phase 4

- [ ] Discharge summary completion time: < 15 minutes
- [ ] Discharge process time: < 30 minutes (from decision to bed release)
- [ ] Patient satisfaction with discharge instructions: ≥ 4.5/5

---

## Appendix

### Related Documentation

- `/documentation/user_journey.md` - User journey for Rawat Inap (10 steps)
- `/documentation/app_flow_document.md` - Modul 3 user stories
- `/documentation/backend_structure_document.md` - Database schema details
- `/documentation/frontend_guidelines_document.md` - UI/UX patterns

### Database Schema Reference

- `/db/schema/inpatient.ts` - rooms, bed_assignments, vitals_history, material_usage
- `/db/schema/medical-records.ts` - cppt
- `/db/schema/billing.ts` - discharge_summaries, billing_items

### External Resources

- ICD-10 codes: https://www.icd10data.com/
- Vital signs normal ranges: WHO guidelines
- Drizzle ORM docs: https://orm.drizzle.team/
- Next.js 15 docs: https://nextjs.org/docs

---

**Document Version:** 2.0
**Last Updated:** 2026-01-05
**Author:** Development Team
**Status:** Phase 4 (Discharge Process) In Progress

**Change Log:**

- v2.0 (2026-01-05): Updated to reflect completed Phases 1-3, clarified discharge workflow
- v1.0 (2025-12-21): Initial implementation plan
