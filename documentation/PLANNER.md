# Sim-Klinik Feature Planner

Priority order from `documentation/priority-summary.png`:

| Priority | Feature                                    | Status     |
| -------- | ------------------------------------------ | ---------- |
| P0       | Reports page with real financial data      | ✅ Done    |
| P0       | Discharge management page                  | ✅ Done    |
| P0       | Master Data Obat & Bahan Medis             | ✅ Done    |
| P0       | Master Data Pemeriksaan Lab                | ✅ Done    |
| P0       | Master Data Panel Lab                      | ✅ Done    |
| P1       | Queue ticket print                         | ⬜ Pending |
| P1       | Design improvements (main pages)           | ⬜ Pending |
| P1       | Stok Opname                                | ✅ Done    |
| P1       | Dashboard home with real live stats        | ✅ Done    |
| P2       | Lab → Doctor notifications                 | ⬜ Pending |
| P2       | Doctor schedule / jadwal                   | ⬜ Pending |
| P2       | Drug purchase orders & supplier management | ⬜ Pending |
| P1       | DB query optimization                      | ⬜ Pending |
| P1       | API fetching optimization                  | ⬜ Pending |
| P3       | Referral letter                            | ⬜ Pending |
| P3       | Medical record print                       | ⬜ Pending |
| P3       | UGD quick-register in global header        | ⬜ Pending |

---

## P0: Discharge Management Page (`/dashboard/discharge`)

### Context

The `/dashboard/discharge` route ("Pasien Pulang") is already wired in the sidebar for
`super_admin`, `admin`, `doctor`, and `cashier` — but the page file doesn't exist and 404s.

The discharge page is the **final step** in the patient visit lifecycle. After a cashier
marks payment as `paid`, a nurse/admin needs to physically confirm the patient has left
and mark the visit as `completed`. For inpatient visits, this also releases the bed.

**Visit state machine endpoint:** `paid` → `completed` (only valid transition from `paid`)

---

### What's Already Built (no new APIs needed)

| Asset                     | Location                                          | Usage                                                                                                       |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Visit history API         | `GET /api/visits/history?status=paid`             | Fetch discharge queue — returns patient name, MR, poli, doctor                                              |
| Visit status API          | `PATCH /api/visits/status`                        | Transition outpatient/emergency to `completed`                                                              |
| Final inpatient discharge | `POST /api/inpatient/final-discharge`             | Releases bed + marks inpatient visit `completed`                                                            |
| `FinalDischargeDialog`    | `components/inpatient/final-discharge-dialog.tsx` | Reusable inpatient discharge UI (props: `visitId`, `patientName`, `roomNumber?`, `bedNumber?`, `onSuccess`) |
| `updateVisitStatus()`     | `lib/services/visits.service.ts`                  | Client service for PATCH /api/visits/status                                                                 |

---

### Files to Create

| File                               | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| `hooks/use-discharge-queue.ts`     | Fetches `paid` visits with 30s auto-refresh |
| `app/dashboard/discharge/page.tsx` | Full discharge management page              |

---

### Hook Design (`hooks/use-discharge-queue.ts`)

```typescript
// Pattern: same as useBillingQueue (30s polling, AbortController)
// Calls: GET /api/visits/history?status=paid&limit=100
// Optional filter: visitType param for tab filtering
// Returns: { visits, isLoading, refresh }
// Type: VisitHistoryItem[] (already typed from visits history API)
```

---

### Page Layout (`app/dashboard/discharge/page.tsx`)

```
DischargePage
└── PageGuard roles={["super_admin", "admin", "doctor", "cashier", "nurse", "receptionist"]}
    └── DischargeContent (client component)
        ├── Header
        │   ├── Icon + "Pasien Pulang" title + "Konfirmasi kepulangan pasien" description
        │   └── Refresh button (triggers manual refetch)
        ├── Visit type tabs: Semua | Rawat Jalan | Rawat Inap | UGD
        │   (filters the already-fetched list client-side, no re-fetch)
        ├── Visit count badge (e.g. "3 pasien menunggu")
        ├── Visit card list (for each paid visit):
        │   ├── Patient name + MR number
        │   ├── Visit number + visit type badge (color-coded)
        │   ├── Poli name (outpatient) | Room info (inpatient) | "UGD" (emergency)
        │   ├── Arrival time (formatted in id-ID locale)
        │   └── Action button (right side):
        │       - Outpatient/Emergency → "Selesaikan" → AlertDialog confirmation
        │                                             → updateVisitStatus(visitId, "completed")
        │       - Inpatient          → FinalDischargeDialog (existing component, reused as-is)
        └── Empty state: "Tidak ada pasien yang menunggu kepulangan"
            (shown when filtered list is empty)
```

---

### Discharge Action Logic

```typescript
// Outpatient / Emergency
// Simple AlertDialog: "Konfirmasi Kepulangan" → OK → updateVisitStatus(visitId, "completed")

// Inpatient
// Render <FinalDischargeDialog
//   visitId={visit.visit.id}
//   patientName={visit.patient.name}
//   onSuccess={() => refresh()}
// />
// (roomNumber/bedNumber omitted — props are optional, dialog still works)
```

On success for both: remove visit from list optimistically + sonner toast + trigger refresh.

---

### Verification

1. Navigate to `/dashboard/discharge` as `super_admin` — page renders (no 404).
2. Seed a visit to `paid` status via Drizzle Studio or cashier flow — it appears in the list.
3. Tab filter "Rawat Jalan" hides inpatient/emergency rows and vice versa.
4. Click "Selesaikan" on an outpatient visit → confirm → visit disappears from list.
5. Click "Pulangkan Pasien" on an inpatient visit → FinalDischargeDialog opens → completes → bed freed in `/dashboard/inpatient/rooms`.
6. Log in as `doctor` role → page is accessible. Log in as `pharmacist` → page is inaccessible.

---

## P0: Master Data Obat & Bahan Medis (`/dashboard/master-data/drugs`)

### Context

The `inventoryItems` table (SQL: `drugs`) holds the master catalog for all drugs and medical materials, distinguished by `itemType` (`"drug"` | `"material"`). Currently there is no UI to add/edit/deactivate items — pharmacists must use DB tooling. The pharmacy inventory page (`/dashboard/pharmacy/inventory`) only manages batches/stock, not the master drug records.

### Table Fields

| Field                  | Type    | Notes                                         |
| ---------------------- | ------- | --------------------------------------------- |
| `name`                 | string  | Required                                      |
| `genericName`          | string  | Optional, drugs only                          |
| `itemType`             | enum    | `"drug"` \| `"material"` — toggle/select      |
| `category`             | string  | e.g. "Antibiotik", "Analgesik", "Consumables" |
| `unit`                 | string  | tablet, kapsul, ml, pcs, box, roll            |
| `price`                | decimal | Prescription price                            |
| `generalPrice`         | decimal | Optional general price                        |
| `minimumStock`         | integer | Alert threshold, default 10                   |
| `requiresPrescription` | boolean | TRUE for drugs, FALSE for materials           |
| `isActive`             | boolean | Soft delete via toggle                        |
| `description`          | text    | Optional                                      |

### Roles

- **View:** `super_admin`, `admin`, `pharmacist`
- **Create/Edit/Toggle Active:** `super_admin`, `admin`, `pharmacist`

### Sidebar

Add to Master Data section in `lib/rbac/navigation.ts`:

```
{ title: "Obat & Bahan Medis", url: "/dashboard/master-data/drugs", icon: Pill }
```

### Page Layout

```
DrugsPage (server, PageGuard roles=["super_admin","admin","pharmacist"])
└── DrugsContent (client)
    ├── Header: "Obat & Bahan Medis" + [+ Tambah] button
    ├── Tabs: Semua | Obat | Bahan Medis  (client-side filter on itemType)
    ├── Search input (debounced, server-side via query param)
    ├── Table: Nama | Nama Generik | Tipe | Kategori | Satuan | Harga | Min Stok | Status | Aksi
    │   - Status badge: Aktif (green) / Tidak Aktif (gray)
    │   - Aksi: Edit | Toggle Active
    └── Create/Edit Dialog (Sheet or Dialog)
        - Form fields matching table above
        - itemType toggle changes which fields are shown (genericName hidden for material)
```

### API

- `GET /api/master-data/drugs?search=&itemType=&page=` — paginated list
- `POST /api/master-data/drugs` — create
- `PATCH /api/master-data/drugs/[id]` — update / toggle isActive

---

## P0: Master Data Pemeriksaan Lab (`/dashboard/master-data/lab-tests`)

### Context

The `labTests` table is the catalog for all lab and radiology tests. Doctors order from this catalog, and lab technicians use it to process results. Currently there is no UI — tests must be seeded directly. Proper management is required for the lab module to work end-to-end.

### Table Fields

| Field             | Type    | Notes                                           |
| ----------------- | ------- | ----------------------------------------------- |
| `code`            | string  | Unique, e.g. "CBC", "HBA1C", "XRAY-CHEST"       |
| `name`            | string  | Full name                                       |
| `category`        | string  | "Hematologi", "Kimia Klinik", "Radiologi", etc. |
| `department`      | enum    | `"LAB"` \| `"RAD"`                              |
| `price`           | decimal | Test price                                      |
| `specimenType`    | string  | "Darah", "Urin", etc. (optional)                |
| `tatHours`        | integer | Turnaround time in hours, default 24            |
| `requiresFasting` | boolean | Patient prep flag                               |
| `isActive`        | boolean | Soft delete                                     |
| `description`     | text    | Optional                                        |
| `instructions`    | text    | Patient preparation instructions (optional)     |

### Roles

- **View:** `super_admin`, `admin`, `lab_technician`, `lab_supervisor`
- **Create/Edit/Toggle:** `super_admin`, `admin`, `lab_supervisor`

### Sidebar

Add to Master Data section:

```
{ title: "Pemeriksaan Lab", url: "/dashboard/master-data/lab-tests", icon: FlaskConical }
```

### Page Layout

```
LabTestsPage (server, PageGuard)
└── LabTestsContent (client)
    ├── Header: "Pemeriksaan Lab" + [+ Tambah] button
    ├── Tabs: Semua | LAB | RAD  (filter by department)
    ├── Search input (debounced)
    ├── Table: Kode | Nama | Kategori | Dept | Harga | TAT | Puasa | Status | Aksi
    └── Create/Edit Dialog
        - Full form for all fields above
```

### API

- `GET /api/master-data/lab-tests?search=&department=&page=`
- `POST /api/master-data/lab-tests`
- `PATCH /api/master-data/lab-tests/[id]`

---

## P0: Master Data Panel Lab (`/dashboard/master-data/lab-panels`)

### Context

`labTestPanels` groups multiple tests into reusable panels (e.g., "Paket Diabetes" = HBA1C + FBS + Urine Routine) with a discounted combined price. The many-to-many link is via `labTestPanelItems`. No UI exists.

### Table Fields

| Field         | Type     | Notes                                |
| ------------- | -------- | ------------------------------------ |
| `code`        | string   | Unique, e.g. "DIABETES-PANEL"        |
| `name`        | string   | e.g. "Paket Diabetes"                |
| `description` | text     | Optional                             |
| `price`       | decimal  | Discounted panel price               |
| `isActive`    | boolean  | Soft delete                          |
| `tests`       | relation | Many-to-many via `labTestPanelItems` |

### Roles

Same as lab-tests: `super_admin`, `admin`, `lab_supervisor` for write.

### Sidebar

Add to Master Data section:

```
{ title: "Panel Lab", url: "/dashboard/master-data/lab-panels", icon: LayoutList }
```

### Page Layout

```
LabPanelsPage (server, PageGuard)
└── LabPanelsContent (client)
    ├── Header: "Panel Lab" + [+ Tambah] button
    ├── Table: Kode | Nama | Jumlah Tes | Harga | Status | Aksi
    │   - "Jumlah Tes" = count of linked labTestPanelItems
    └── Create/Edit Dialog
        - code, name, description, price, isActive
        - Multi-select combobox: pick tests from labTests catalog
        - Shows selected tests as badge list with remove button
```

### API

- `GET /api/master-data/lab-panels?search=&page=`
- `POST /api/master-data/lab-panels` — creates panel + inserts panel items
- `PATCH /api/master-data/lab-panels/[id]` — update panel + replace panel items
- `DELETE /api/master-data/lab-panels/[id]` — soft delete (set isActive=false)

---

## Design Enhancement Plan

### What's Already Done

| Area                                                                           | Status  |
| ------------------------------------------------------------------------------ | ------- |
| Dashboard home page (welcome banner, stat cards, quick actions, recent visits) | ✅ Done |
| Dashboard page refactoring into `_components/`                                 | ✅ Done |
| Reports page KPI cards layout (3-col → 6-col at 2xl)                           | ✅ Done |
| Sidebar: active item pill indicator, group separators, site header date        | ✅ Done |

---

### D1: Shared `PageHeader` Component

**File:** `components/ui/page-header.tsx`

**Why:** Every page currently rolls its own inline header (`div.mb-6.flex.items-center.justify-between` + h1 + p). Extract this into one reusable component so all pages look consistent.

**Props:**

```typescript
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode // action buttons slot (right side)
}
```

**Design:**

- `container mx-auto max-w-5xl px-6 pt-6 pb-0` wrapper matching dashboard container
- Left: `h1` (`text-2xl font-bold tracking-tight`) + optional `p` description (`text-sm text-muted-foreground`)
- Right: `children` slot for buttons
- No border, no card — just spacing and typography

**Used by:** D2, D3, D4 and any future page that adopts it.

---

### D2: Patients Page Redesign

**File:** `app/dashboard/patients/page.tsx`

**Current issues:**

- Inline header div (not `PageHeader`)
- Entire table wrapped in a heavy `<Card>`
- Search bar is inside `CardAction` — small and right-aligned

**Changes:**

1. Replace inline header with `<PageHeader title="Data Pasien" description="...">` + "Pasien Baru" button as `children`
2. Remove outer `<Card>`. Replace with a flat `<div className="rounded-xl border bg-card shadow-sm overflow-hidden">` — same panel style as the dashboard's recent-visits section
3. Move search input into a toolbar row between header and table — full-width on mobile, `max-w-sm` on desktop
4. `PatientsTable`, `PatientsPagination`, `usePatients` unchanged — no logic changes

---

### D3: Queue Page Redesign

**File:** `app/dashboard/queue/page.tsx`

**Current issues:**

- Inline header div
- `TabsList` is `grid w-full grid-cols-3` — full-width, boxy
- Filter controls loose inside `TabsContent` with no clear grouping
- Emergency and Inpatient tabs wrap filters in an extra `<Card>`

**Changes:**

1. `<PageHeader title="Antrian Pasien" description="Pantau antrian per layanan">`
2. `TabsList` → `inline-flex` (width fits content, not full-width)
3. Move poli select + date filter into a `flex flex-wrap items-center gap-3` filter bar below tabs — remove the extra `<Card>` wrappers from Emergency/Inpatient tabs

**No logic/API changes.**

---

### D4: Lab Queue Page Redesign

**File:** `app/dashboard/laboratory/queue/page.tsx`

**Current issues:** Same pattern as queue page — inline header, Card wrapper, boxy full-width tabs.

**Changes (same pattern as D3):**

1. `<PageHeader title="Antrian Pemeriksaan" description="Order laboratorium & radiologi masuk">` + refresh button as children
2. `TabsList` → `inline-flex`
3. Remove extra Card wrapper — flat panel for the table

**No logic/API changes.**

---

### Implementation Order

| Step | Task                         | Effort |
| ---- | ---------------------------- | ------ |
| D1   | Build `PageHeader` component | Small  |
| D2   | Patients page                | Small  |
| D3   | Queue page                   | Small  |
| D4   | Lab queue page               | Small  |

All four steps are pure frontend changes — no new APIs, no schema changes, no hook changes.

---

## P1: Design Improvements — Main Feature Pages

### Approach

Each page gets a full redesign — page shell AND all child components — using the `frontend-design` skill. Pages are processed in priority order. After each page: verify in browser, no logic/API changes, only UI/UX.

### Priority Order

| #   | Page               | Route                                | File                                             | Status                                                                                  |
| --- | ------------------ | ------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | Registration       | /dashboard/registration              | app/dashboard/registration/page.tsx              | ✅ Done — full redesign (page + all child components) + UI/UX polish                    |
| 2   | Medical Records    | /dashboard/medical-records/[visitId] | app/dashboard/medical-records/[visitId]/page.tsx | ✅ Done — patient strip, tab badges, save/lock flow, locked banner, transfer to inpatient |
| 3   | Cashier            | /dashboard/cashier                   | app/dashboard/cashier/page.tsx                   | ⬜                                                                                        |
| 4   | Doctor Dashboard   | /dashboard/doctor                    | app/dashboard/doctor/page.tsx                    | ✅ Done                                                                                   |
| 5   | Pharmacy           | /dashboard/pharmacy                  | app/dashboard/pharmacy/page.tsx                  | ✅ Done — PageHeader, flat stat panels with icons, pill filters, flat queue table, severity-grouped expiring drugs, improved fulfillment dialog |
| 6   | Emergency          | /dashboard/emergency                 | app/dashboard/emergency/page.tsx                 | ⬜                                                                                      |
| 7   | Queue              | /dashboard/queue                     | app/dashboard/queue/page.tsx                     | ✅ Done — full redesign (page + all child components) + UI/UX polish + API improvements |
| 8   | Laboratory Queue   | /dashboard/laboratory/queue          | app/dashboard/laboratory/queue/page.tsx          | ⬜                                                                                      |
| 9   | Inpatient Patients | /dashboard/inpatient/patients        | app/dashboard/inpatient/patients/page.tsx        | ⬜                                                                                      |

### Rules

- Use `frontend-design` skill for each page
- Redesign page shell AND all relevant child components (not just the wrapper)
- Reuse `components/ui/page-header.tsx` (already built as D1)
- No logic, hook, or API changes
- Consistent: PageHeader, flat panels (not heavy Cards), inline-flex tabs
- Polish UX: empty states, loading states, confirmation dialogs, button hierarchy, context cues

---

## P1: DB Query Optimization

### Issues to Fix (by severity)

#### CRITICAL — N+1 in `lib/lab/service.ts`

**`getLabTestPanelsWithTests()` (lines 226–253)**

- Problem: Loops over panels, fires one query per panel to fetch its tests → N+1
- Fix: Single query joining `labTestPanels` → `labTestPanelItems` → `labTests`, group result in JS

**`getLabTestPanelById()` (lines 192–221)**

- Problem: Two sequential queries — panel first, then tests as separate roundtrip
- Fix: Single JOIN query for both in one roundtrip

#### HIGH — `app/api/medical-records/route.ts` POST (lines 36–70)

- Problem: Visit existence check and existing-record check are two separate queries
- Fix: Reorder or batch to reduce to one roundtrip

#### MEDIUM — `lib/pharmacy/api-service.ts` `getPaginatedDrugInventory()` (lines 258–275)

- Problem: WHERE clause built twice — once for data query, once for count query
- Fix: Extract shared `whereConditions` variable, reuse in both

#### Reference (best practice patterns — do not change)

- `lib/pharmacy/api-service.ts:553–644` (`getPendingPrescriptions`) — exemplar single JOIN across multiple tables
- `lib/lab/service.ts:409–432` — correct batch fetch with `inArray()`, use as template

### Out of scope

- Index additions (schema changes, separate task)
- Billing transactions query (late date filter is acceptable at current scale)

---

## P1: API Fetching Optimization

### Reference implementation

`hooks/use-discharge-queue.ts` — correct pattern with AbortController + cleanup on unmount. Use as the model for all fixes.

### Issues to Fix

#### 1. Missing AbortController in polling hooks

These hooks use `setInterval` but don't cancel in-flight requests when component unmounts:

- `hooks/use-expiring-drugs.ts` (line 73)
- `hooks/use-pharmacy-queue.ts` (line 71)
- `hooks/use-doctor-queue.ts` (line 49)
- `hooks/use-inventory.ts` (lines 56–57)

Fix pattern (copied from `use-discharge-queue.ts`):

```typescript
const controller = new AbortController()
// pass controller.signal to fetch call
// in cleanup: controller.abort()
```

#### 2. Missing request cancellation in search hooks

Stale requests not cancelled when user types fast or component unmounts:

- `hooks/use-drug-search.ts` (line 26) — Axios: add `signal` option
- `hooks/use-icd10-search.ts` (line 28) — fetch: add `signal` to options

#### 3. Over-aggressive polling on Doctor page

- `hooks/use-doctor-stats.ts` — 60s poll for slow-changing stats data
- `hooks/use-doctor-queue.ts` — 30s poll running in parallel with stats = 2 independent intervals
- Fix: Raise stats interval to 120s; keep queue at 30s but add AbortController

#### 4. No action needed (already correct)

- `hooks/use-diagnoses.ts` — React Query with 5 min stale time ✅
- `hooks/use-discharge-queue.ts` — AbortController + proper cleanup ✅
