# Discharge Dashboard Feature Plan

**Version**: 1.0
**Created**: 2025-01-05
**Status**: Planned (Not Yet Implemented)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Purpose & Goals](#purpose--goals)
3. [User Stories](#user-stories)
4. [Feature Requirements](#feature-requirements)
5. [UI/UX Design](#uiux-design)
6. [Technical Implementation](#technical-implementation)
7. [API Endpoints](#api-endpoints)
8. [Database Queries](#database-queries)
9. [Component Structure](#component-structure)
10. [Integration Points](#integration-points)
11. [Implementation Checklist](#implementation-checklist)

---

## Overview

The **Discharge Dashboard** is a centralized monitoring and management page for tracking all inpatient discharge workflows. Unlike the discharge features embedded in individual patient detail pages (which are for clinical workflow), this dashboard provides an **overview and administrative perspective** of all patients in various stages of discharge.

### Current State vs. Future State

**Current State:**

- ✅ Discharge Summary feature exists in patient detail page
- ✅ Final Discharge feature exists in patient detail page
- ✅ Navigation menu has `/dashboard/discharge` link
- ❌ `/dashboard/discharge` page does NOT exist yet

**Future State (This Document):**

- ✅ Discharge Dashboard at `/dashboard/discharge`
- ✅ Lists all patients in discharge pipeline
- ✅ Grouped by discharge status
- ✅ Quick actions for each stage
- ✅ Role-based views and permissions

---

## Purpose & Goals

### Primary Goals

1. **Visibility**: Provide real-time overview of all patients in discharge workflow
2. **Efficiency**: Enable quick access to discharge-related tasks
3. **Accountability**: Track discharge bottlenecks and pending actions
4. **Multi-Role**: Serve doctors, nurses, cashiers, and administrators

### Key Benefits

- **Doctors**: See which patients need discharge summaries, prioritize workload
- **Nurses/Admin**: Monitor discharge progress, coordinate patient flow
- **Cashiers**: Identify patients ready for billing/payment processing
- **Management**: Track discharge metrics and workflow efficiency

---

## User Stories

### Doctor (Role: doctor)

**US-D1**: As a doctor, I want to see all my inpatient patients who need discharge summaries, so I can prioritize which ones to complete first.

**US-D2**: As a doctor, I want to click on a patient from the discharge dashboard to view their full detail and fill the discharge summary.

**US-D3**: As a doctor, I want to see patients I've already created discharge summaries for, so I can track their progress through billing and payment.

### Nurse (Role: nurse)

**US-N1**: As a nurse, I want to see all patients in the discharge pipeline, so I can coordinate bed management and prepare discharge materials.

**US-N2**: As a nurse, I want to see which patients are waiting for doctors to complete discharge summaries, so I can follow up with the doctors.

**US-N3**: As a nurse, I want to see which patients are ready for final discharge, so I can prepare discharge instructions and medications.

### Cashier (Role: cashier)

**US-C1**: As a cashier, I want to see patients whose discharge summaries are complete and billing is ready to be created, so I can process billing.

**US-C2**: As a cashier, I want to see patients with pending payments, so I can follow up on unpaid bills.

**US-C3**: As a cashier, I want to see patients with paid bills who are ready for final discharge, so I can coordinate with nursing.

### Admin/Super Admin (Role: admin, super_admin)

**US-A1**: As an admin, I want to see all patients in the discharge pipeline with full details, so I can monitor workflow and resolve bottlenecks.

**US-A2**: As an admin, I want to see discharge metrics (average time, pending count), so I can track operational efficiency.

**US-A3**: As an admin, I want to filter patients by room type, doctor, or date range, so I can generate reports.

---

## Feature Requirements

### Functional Requirements

#### FR-1: Discharge Status Groups

The dashboard MUST display patients grouped by these statuses:

1. **Menunggu Discharge Summary** (Waiting for Discharge Summary)
   - Status: `in_examination`
   - Condition: No discharge summary exists
   - Action: Doctor fills discharge summary
   - Color: Yellow/Warning

2. **Menunggu Billing** (Waiting for Billing)
   - Status: `ready_for_billing`
   - Condition: Discharge summary exists, but NO billing record
   - Action: Admin/cashier creates billing (via "Selesai Rawat Inap")
   - Color: Blue/Info

3. **Menunggu Pembayaran** (Waiting for Payment)
   - Status: `ready_for_billing`
   - Condition: Billing exists, payment status = 'pending' or 'partial'
   - Action: Cashier processes payment
   - Color: Orange/Warning

4. **Siap Dipulangkan** (Ready for Final Discharge)
   - Status: `ready_for_billing`
   - Condition: Billing exists, payment status = 'paid'
   - Action: Nurse/doctor/cashier executes final discharge
   - Color: Green/Success

#### FR-2: Patient Information Display

Each patient card MUST show:

- Patient name
- MR Number
- Room number & bed number
- Days in hospital
- Doctor in charge (if applicable)
- Insurance type
- Latest vital signs (optional)
- Discharge summary status
- Billing amount (if applicable)
- Payment status (if applicable)

#### FR-3: Quick Actions

Each patient card MUST provide context-appropriate actions:

- **Waiting for Discharge Summary**: "Isi Resume Medis" button → Opens discharge summary dialog OR navigates to patient detail
- **Waiting for Billing**: "Buat Billing" button → Navigates to patient detail
- **Waiting for Payment**: "Proses Pembayaran" button → Navigates to cashier/billing page
- **Ready for Discharge**: "Pulangkan Pasien" button → Opens final discharge dialog

#### FR-4: Filters & Search

- Search by patient name, MR number, room number
- Filter by room type (VIP, Class 1, Class 2, etc.)
- Filter by doctor (for admins)
- Filter by date range (admission date)
- Sort by: days in hospital, admission date, patient name

#### FR-5: Metrics Dashboard (Optional - Phase 2)

Display summary cards:

- Total patients in discharge pipeline
- Patients waiting for discharge summary (count)
- Patients waiting for payment (count + total amount)
- Patients ready for discharge (count)
- Average discharge processing time
- Today's discharges count

### Non-Functional Requirements

#### NFR-1: Performance

- Page load time < 2 seconds
- Support up to 100 patients in discharge pipeline
- Real-time or near real-time updates (refresh every 30 seconds, or manual refresh)

#### NFR-2: Usability

- Mobile-responsive design
- Color-coded status groups for quick scanning
- Clear call-to-action buttons
- Accessible (ARIA labels, keyboard navigation)

#### NFR-3: Security

- Role-based access control (RBAC)
- Doctors only see actions relevant to clinical workflow
- Cashiers only see billing/payment-related patients
- Audit logging for final discharge actions

---

## UI/UX Design

### Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard Discharge                                    [🔄]    │
│  Monitor semua pasien dalam proses pemulangan                  │
├────────────────────────────────────────────────────────────────┤
│  [Search: Cari pasien...]  [Filter: Tipe Kamar ▼]  [Sort ▼]  │
├────────────────────────────────────────────────────────────────┤
│  📊 METRICS (Optional)                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Total: 12  │ │ Summary: 5 │ │ Payment: 4 │ │ Ready: 3   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  ⚠️  MENUNGGU DISCHARGE SUMMARY (5 pasien)                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Tn. Ahmad Surya (12345)          🏥 VIP 101 • Bed 1   │ │
│  │ 📅 5 hari rawat • Dr. Budi          💳 BPJS              │ │
│  │ [➤ Lihat Detail] [📝 Isi Resume Medis]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Ny. Siti Aminah (12346)          🏥 Kelas 1 • Bed 2   │ │
│  │ 📅 3 hari rawat • Dr. Ani           💳 Umum              │ │
│  │ [➤ Lihat Detail] [📝 Isi Resume Medis]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  ℹ️  MENUNGGU BILLING (2 pasien)                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Tn. Budi Santoso (12347)         🏥 Kelas 2 • Bed 3   │ │
│  │ 📅 4 hari rawat • Dr. Citra         ✅ Resume medis OK   │ │
│  │ [➤ Lihat Detail] [💰 Buat Billing]                       │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  🟠 MENUNGGU PEMBAYARAN (4 pasien)                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Ny. Dewi Lestari (12348)         🏥 VIP 102 • Bed 1   │ │
│  │ 📅 7 hari rawat • Dr. Eko           💵 Rp 5.000.000      │ │
│  │ Status: Belum Lunas (Rp 5.000.000 tersisa)               │ │
│  │ [➤ Lihat Detail] [💳 Proses Pembayaran]                  │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  ✅ SIAP DIPULANGKAN (3 pasien)                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Tn. Eko Prasetyo (12349)         🏥 Kelas 3 • Bed 4   │ │
│  │ 📅 2 hari rawat • Dr. Fani          ✅ Lunas             │ │
│  │ [➤ Lihat Detail] [🚪 Pulangkan Pasien]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DischargeDashboardPage
├── DashboardHeader (title, refresh button)
├── SearchAndFilters (search, filters, sort)
├── DischargeMetrics (optional summary cards)
├── DischargeStatusGroup (section 1)
│   ├── GroupHeader ("Menunggu Discharge Summary")
│   └── PatientCard[]
│       ├── PatientInfo
│       ├── RoomInfo
│       ├── StatusIndicator
│       └── QuickActions
├── DischargeStatusGroup (section 2)
│   ├── GroupHeader ("Menunggu Billing")
│   └── PatientCard[]
├── DischargeStatusGroup (section 3)
│   ├── GroupHeader ("Menunggu Pembayaran")
│   └── PatientCard[]
└── DischargeStatusGroup (section 4)
    ├── GroupHeader ("Siap Dipulangkan")
    └── PatientCard[]
```

### Status Colors

```typescript
const DISCHARGE_STATUS_COLORS = {
  waiting_summary: {
    badge: "warning",
    border: "border-yellow-500",
    icon: "⚠️",
    label: "Menunggu Discharge Summary",
  },
  waiting_billing: {
    badge: "info",
    border: "border-blue-500",
    icon: "ℹ️",
    label: "Menunggu Billing",
  },
  waiting_payment: {
    badge: "warning",
    border: "border-orange-500",
    icon: "🟠",
    label: "Menunggu Pembayaran",
  },
  ready_discharge: {
    badge: "success",
    border: "border-green-500",
    icon: "✅",
    label: "Siap Dipulangkan",
  },
}
```

---

## Technical Implementation

### File Structure

```
app/
├── dashboard/
│   └── discharge/
│       ├── page.tsx                 # Main discharge dashboard page
│       └── loading.tsx              # Loading skeleton

components/
└── discharge/
    ├── discharge-dashboard.tsx      # Main dashboard container
    ├── discharge-metrics.tsx        # Summary metrics cards
    ├── discharge-filters.tsx        # Search and filter controls
    ├── discharge-status-group.tsx   # Status group section
    ├── discharge-patient-card.tsx   # Individual patient card
    ├── discharge-quick-actions.tsx  # Action buttons per status
    └── discharge-summary-quick-dialog.tsx  # Quick discharge summary dialog (optional)

hooks/
└── use-discharge-dashboard.ts       # Custom hook for dashboard data

lib/
└── services/
    └── discharge.service.ts         # API calls for discharge dashboard

types/
└── discharge.ts                     # Type definitions
```

### Type Definitions

```typescript
// types/discharge.ts

export type DischargeStage =
  | "waiting_summary" // No discharge summary
  | "waiting_billing" // Has summary, no billing
  | "waiting_payment" // Has billing, not paid
  | "ready_discharge" // Paid, ready to discharge

export interface DischargePipelinePatient {
  // Visit & Patient Info
  visitId: string
  visitNumber: string
  patientId: string
  mrNumber: string
  patientName: string

  // Admission Info
  admissionDate: Date
  daysInHospital: number

  // Room Info
  roomNumber: string
  roomType: string
  bedNumber: string

  // Clinical Info
  doctorId: string | null
  doctorName: string | null
  insurance: string | null

  // Discharge Workflow Status
  dischargeStage: DischargeStage
  hasDischargeSummary: boolean
  dischargeSummaryCreatedAt: Date | null
  dischargeSummaryCreatedBy: string | null

  // Billing Info (if applicable)
  billingId: string | null
  billingTotalAmount: string | null
  billingPaymentStatus: "pending" | "partial" | "paid" | null
  billingPaidAmount: string | null
  billingRemainingAmount: string | null

  // Latest Vitals (optional)
  latestTemperature: string | null
  latestBloodPressure: string | null
  latestPulse: number | null
}

export interface DischargeMetrics {
  totalInPipeline: number
  waitingSummary: number
  waitingBilling: number
  waitingPayment: number
  waitingPaymentAmount: string
  readyForDischarge: number
  avgDaysInHospital: number
  todayDischarges: number
}

export interface DischargeDashboardData {
  metrics: DischargeMetrics
  patients: {
    waitingSummary: DischargePipelinePatient[]
    waitingBilling: DischargePipelinePatient[]
    waitingPayment: DischargePipelinePatient[]
    readyDischarge: DischargePipelinePatient[]
  }
}

export interface DischargeFilters {
  search?: string // Patient name, MR, room number
  roomType?: string | "all" // VIP, Class 1, etc.
  doctorId?: string | "all" // Filter by doctor
  admissionDateFrom?: string
  admissionDateTo?: string
  sortBy?: "daysInHospital" | "admissionDate" | "patientName"
  sortOrder?: "asc" | "desc"
}
```

---

## API Endpoints

### GET /api/discharge/dashboard

**Purpose**: Fetch all patients in discharge pipeline with grouped data

**Query Parameters**:

```typescript
{
  search?: string
  roomType?: string
  doctorId?: string
  admissionDateFrom?: string
  admissionDateTo?: string
  sortBy?: string
  sortOrder?: string
}
```

**Response**:

```typescript
{
  status: 200,
  message: "Discharge dashboard data fetched successfully",
  data: {
    metrics: {
      totalInPipeline: 12,
      waitingSummary: 5,
      waitingBilling: 2,
      waitingPayment: 4,
      waitingPaymentAmount: "15000000",
      readyForDischarge: 3,
      avgDaysInHospital: 4.5,
      todayDischarges: 2
    },
    patients: {
      waitingSummary: [...],
      waitingBilling: [...],
      waitingPayment: [...],
      readyDischarge: [...]
    }
  }
}
```

**Permissions**: `discharge:read`

**Accessible By**: All roles (doctor, nurse, cashier, admin, super_admin)

---

## Database Queries

### Main Query Logic

```typescript
// lib/services/discharge.service.ts or lib/discharge/api-service.ts

export async function getDischargeDashboardData(filters: DischargeFilters) {
  // Base query: Get all active inpatient visits (not yet completed)
  // Join with patients, bed assignments, rooms, users (doctor), discharge_summaries, billings

  const baseQuery = db
    .select({
      // Visit & Patient
      visitId: visits.id,
      visitNumber: visits.visitNumber,
      patientId: patients.id,
      mrNumber: patients.mrNumber,
      patientName: patients.name,
      insurance: patients.insuranceType,

      // Admission
      admissionDate: visits.admissionDate,
      visitStatus: visits.status,

      // Room
      roomNumber: rooms.roomNumber,
      roomType: rooms.roomType,
      bedNumber: bedAssignments.bedNumber,

      // Doctor
      doctorId: visits.doctorId,
      doctorName: user.name,

      // Discharge Summary
      dischargeSummaryId: dischargeSummaries.id,
      dischargeSummaryCreatedAt: dischargeSummaries.dischargedAt,
      dischargeSummaryCreatedBy: dischargeSummaries.dischargedBy,

      // Billing
      billingId: billings.id,
      billingTotalAmount: billings.totalAmount,
      billingPaymentStatus: billings.paymentStatus,
      billingPaidAmount: billings.paidAmount,
      billingRemainingAmount: billings.remainingAmount,
    })
    .from(visits)
    .innerJoin(patients, eq(visits.patientId, patients.id))
    .innerJoin(
      bedAssignments,
      and(eq(bedAssignments.visitId, visits.id), isNull(bedAssignments.dischargedAt))
    )
    .innerJoin(rooms, eq(bedAssignments.roomId, rooms.id))
    .leftJoin(user, eq(visits.doctorId, user.id))
    .leftJoin(dischargeSummaries, eq(dischargeSummaries.visitId, visits.id))
    .leftJoin(billings, eq(billings.visitId, visits.id))
    .where(
      and(
        eq(visits.visitType, "inpatient"),
        isNull(visits.dischargeDate), // Not yet discharged
        // Visit status is either in_examination OR ready_for_billing
        // (excludes 'completed' which means already discharged)
        or(eq(visits.status, "in_examination"), eq(visits.status, "ready_for_billing"))
      )
    )

  // Apply filters
  if (filters.search) {
    // Add search conditions
  }

  if (filters.roomType && filters.roomType !== "all") {
    // Add room type filter
  }

  // ... more filters

  const results = await baseQuery

  // Calculate days in hospital for each patient
  const patientsWithDays = results.map((patient) => ({
    ...patient,
    daysInHospital: calculateDaysInHospital(patient.admissionDate),
  }))

  // Classify patients into discharge stages
  const classified = classifyPatientsByDischargeStage(patientsWithDays)

  // Calculate metrics
  const metrics = calculateDischargeMetrics(classified)

  return {
    metrics,
    patients: classified,
  }
}

function classifyPatientsByDischargeStage(patients: any[]) {
  const waitingSummary: DischargePipelinePatient[] = []
  const waitingBilling: DischargePipelinePatient[] = []
  const waitingPayment: DischargePipelinePatient[] = []
  const readyDischarge: DischargePipelinePatient[] = []

  for (const patient of patients) {
    const hasSummary = !!patient.dischargeSummaryId
    const hasBilling = !!patient.billingId
    const isPaid = patient.billingPaymentStatus === "paid"

    // Stage 1: Waiting for discharge summary
    if (!hasSummary) {
      waitingSummary.push({
        ...patient,
        dischargeStage: "waiting_summary",
        hasDischargeSummary: false,
      })
    }
    // Stage 2: Has summary, waiting for billing
    else if (hasSummary && !hasBilling) {
      waitingBilling.push({
        ...patient,
        dischargeStage: "waiting_billing",
        hasDischargeSummary: true,
      })
    }
    // Stage 3: Has billing, waiting for payment
    else if (hasBilling && !isPaid) {
      waitingPayment.push({
        ...patient,
        dischargeStage: "waiting_payment",
        hasDischargeSummary: true,
      })
    }
    // Stage 4: Paid, ready for final discharge
    else if (hasBilling && isPaid) {
      readyDischarge.push({
        ...patient,
        dischargeStage: "ready_discharge",
        hasDischargeSummary: true,
      })
    }
  }

  return {
    waitingSummary,
    waitingBilling,
    waitingPayment,
    readyDischarge,
  }
}
```

---

## Component Structure

### Main Page Component

```tsx
// app/dashboard/discharge/page.tsx

export default function DischargeDashboardPage() {
  const { data, isLoading, refresh } = useDischargeDashboard()
  const { hasPermission } = usePermission()
  const session = useSession()

  if (isLoading) {
    return <DischargeDashboardSkeleton />
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Discharge</h1>
          <p className="text-muted-foreground">Monitor semua pasien dalam proses pemulangan</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <DischargeFilters onFilterChange={handleFilterChange} />

      {/* Metrics (Optional) */}
      {hasPermission("discharge:read") && <DischargeMetrics metrics={data.metrics} />}

      {/* Status Groups */}
      <DischargeStatusGroup
        title="Menunggu Discharge Summary"
        stage="waiting_summary"
        patients={data.patients.waitingSummary}
        onPatientAction={refresh}
      />

      <DischargeStatusGroup
        title="Menunggu Billing"
        stage="waiting_billing"
        patients={data.patients.waitingBilling}
        onPatientAction={refresh}
      />

      <DischargeStatusGroup
        title="Menunggu Pembayaran"
        stage="waiting_payment"
        patients={data.patients.waitingPayment}
        onPatientAction={refresh}
      />

      <DischargeStatusGroup
        title="Siap Dipulangkan"
        stage="ready_discharge"
        patients={data.patients.readyDischarge}
        onPatientAction={refresh}
      />
    </div>
  )
}
```

### Patient Card Component

```tsx
// components/discharge/discharge-patient-card.tsx

interface DischargePatientCardProps {
  patient: DischargePipelinePatient
  stage: DischargeStage
  onAction: () => void
}

export function DischargePatientCard({ patient, stage, onAction }: DischargePatientCardProps) {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const session = useSession()

  const getActionButton = () => {
    switch (stage) {
      case "waiting_summary":
        // Only doctors can fill discharge summary
        if (session?.user?.role === "doctor" && hasPermission("inpatient:write")) {
          return (
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/inpatient/patients/${patient.visitId}`)}
            >
              <IconFileDescription className="mr-2 h-4 w-4" />
              Isi Resume Medis
            </Button>
          )
        }
        break

      case "waiting_billing":
        if (hasPermission("discharge:write") || hasPermission("billing:write")) {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/inpatient/patients/${patient.visitId}`)}
            >
              <IconCash className="mr-2 h-4 w-4" />
              Buat Billing
            </Button>
          )
        }
        break

      case "waiting_payment":
        if (hasPermission("billing:write")) {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/cashier?visitId=${patient.visitId}`)}
            >
              <IconCreditCard className="mr-2 h-4 w-4" />
              Proses Pembayaran
            </Button>
          )
        }
        break

      case "ready_discharge":
        if (hasPermission("discharge:write")) {
          return (
            <FinalDischargeDialog
              visitId={patient.visitId}
              patientName={patient.patientName}
              roomNumber={patient.roomNumber}
              bedNumber={patient.bedNumber}
              onSuccess={onAction}
            />
          )
        }
        break
    }

    return null
  }

  return (
    <Card className={cn("border-l-4", getStageColor(stage))}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Patient Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconUser className="text-muted-foreground h-4 w-4" />
              <span className="font-semibold">{patient.patientName}</span>
              <Badge variant="outline">{patient.mrNumber}</Badge>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <IconBed className="h-4 w-4" />
                {patient.roomNumber} • Bed {patient.bedNumber}
              </span>

              <span className="flex items-center gap-1">
                <IconCalendar className="h-4 w-4" />
                {patient.daysInHospital} hari rawat
              </span>

              {patient.doctorName && <span>Dr. {patient.doctorName}</span>}
            </div>

            {/* Billing Info (if applicable) */}
            {stage === "waiting_payment" && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="warning">
                  Belum Lunas: {formatCurrency(patient.billingRemainingAmount || "0")}
                </Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/dashboard/inpatient/patients/${patient.visitId}`)}
            >
              Lihat Detail
            </Button>
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Integration Points

### 1. Navigation Menu

Already exists in `/lib/rbac/navigation.ts`:

- Line 140-143 (super_admin)
- Line 247-251 (admin)
- Line 306-309 (doctor)
- Line 421-425 (cashier)

No changes needed.

### 2. Existing Discharge Features

The discharge dashboard will **link to** existing features:

- **Discharge Summary**: Users click patient → Navigate to patient detail page → Fill discharge summary there
- **Final Discharge**: Dialog can be embedded in discharge dashboard OR navigate to patient detail

### 3. Real-time Updates

Consider implementing:

- Auto-refresh every 30 seconds
- WebSocket/SSE for real-time status updates (future enhancement)
- Manual refresh button (MVP)

### 4. Permissions

Uses existing RBAC permissions:

- `discharge:read` - View discharge dashboard
- `discharge:write` - Execute final discharge
- `inpatient:write` - Fill discharge summary (doctors only)
- `billing:write` - Create billing, process payment

---

## Implementation Checklist

### Phase 1: Core Dashboard (MVP)

- [ ] Create type definitions (`types/discharge.ts`)
- [ ] Create API endpoint (`/api/discharge/dashboard`)
- [ ] Implement database query logic (`lib/discharge/api-service.ts`)
- [ ] Create custom hook (`hooks/use-discharge-dashboard.ts`)
- [ ] Create main page (`app/dashboard/discharge/page.tsx`)
- [ ] Create status group component (`components/discharge/discharge-status-group.tsx`)
- [ ] Create patient card component (`components/discharge/discharge-patient-card.tsx`)
- [ ] Implement basic filtering (search by name/MR)
- [ ] Add navigation buttons to patient detail pages
- [ ] Test with different roles (doctor, nurse, cashier)

### Phase 2: Enhanced Features

- [ ] Add metrics dashboard component
- [ ] Implement advanced filters (room type, doctor, date range)
- [ ] Add sorting options
- [ ] Implement auto-refresh (every 30 seconds)
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Optimize query performance
- [ ] Add pagination (if > 50 patients)

### Phase 3: Advanced Features (Optional)

- [ ] Real-time updates (WebSocket/SSE)
- [ ] Export to Excel/PDF
- [ ] Discharge analytics/reports
- [ ] Notification system for pending discharges
- [ ] Bulk actions (e.g., send reminders)
- [ ] Historical discharge data view

---

## Testing Scenarios

### Test Case 1: Doctor View

**Given**: User logged in as doctor
**When**: Navigate to `/dashboard/discharge`
**Then**:

- See all patients waiting for discharge summary
- Can click "Isi Resume Medis" button
- Can view patient details

### Test Case 2: Cashier View

**Given**: User logged in as cashier
**When**: Navigate to `/dashboard/discharge`
**Then**:

- See patients waiting for billing
- See patients waiting for payment with amounts
- Can click "Proses Pembayaran" button
- See patients ready for discharge

### Test Case 3: Filter by Room Type

**Given**: Multiple patients in different room types
**When**: Filter by "VIP"
**Then**: Only show patients in VIP rooms

### Test Case 4: Empty State

**Given**: No patients in discharge pipeline
**When**: Navigate to `/dashboard/discharge`
**Then**: Show empty state message with helpful text

### Test Case 5: Final Discharge from Dashboard

**Given**: Patient is ready for discharge (paid)
**When**: Click "Pulangkan Pasien" button from dashboard
**Then**:

- Open final discharge dialog
- Complete discharge
- Patient removed from dashboard
- Redirect or refresh list

---

## Notes & Considerations

### Performance Optimization

1. **Database Indexes**: Ensure indexes on:
   - `visits.status`
   - `visits.visit_type`
   - `visits.discharge_date` (for NULL checks)
   - `bed_assignments.discharged_at` (for NULL checks)
   - `billings.payment_status`

2. **Query Optimization**:
   - Use single query with all joins instead of N+1 queries
   - Consider caching for 30 seconds (if auto-refresh enabled)
   - Limit to active patients only (not completed visits)

3. **Pagination**:
   - If > 50 patients, implement pagination
   - Default: 20 patients per page

### UX Considerations

1. **Color Coding**: Use consistent colors across all discharge-related UI
2. **Icons**: Use intuitive icons for each stage
3. **Mobile Responsive**: Ensure cards stack nicely on mobile
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Security Considerations

1. **RBAC**: Enforce role-based actions (doctors only for discharge summary)
2. **Audit Logging**: Log all final discharge actions
3. **Data Privacy**: Mask sensitive patient info if needed for certain roles

---

## Related Documentation

- `/documentation/inpatient_implementation_plan.md` - Inpatient feature implementation
- `/documentation/user_journey.md` - User journey for discharge (line 35-38)
- `/lib/rbac/navigation.ts` - Navigation configuration
- `/lib/rbac/permissions.ts` - Permission definitions

---

## Future Enhancements

1. **Mobile App**: Native mobile app for discharge monitoring
2. **Push Notifications**: Notify doctors when discharge summary is due
3. **Analytics Dashboard**: Discharge metrics over time
4. **Discharge Checklist**: Customizable checklist before final discharge
5. **Patient Portal**: Let patients track their discharge progress
6. **Integration with Hospital Bed Management System**: Automatic bed status updates
7. **Discharge Prediction**: ML model to predict discharge date
8. **Automated Reminders**: Email/SMS reminders for pending discharges

---

**End of Document**
