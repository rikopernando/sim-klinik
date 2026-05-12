# Sim-Klinik Feature Planner

Priority order from `documentation/priority-summary.png`:

| Priority | Feature                                    | Status     |
| -------- | ------------------------------------------ | ---------- |
| P0       | Reports page with real financial data      | ✅ Done    |
| P0       | Discharge management page                  | ✅ Done    |
| P0       | Master Data Obat & Bahan Medis             | ✅ Done    |
| P0       | Master Data Pemeriksaan Lab                | ✅ Done    |
| P0       | Master Data Panel Lab                      | ⬜ Pending |
| P1       | Queue ticket print                         | ⬜ Pending |
| P1       | Stok Opname                                | ✅ Done    |
| P1       | Dashboard home with real live stats        | ✅ Done    |
| P2       | Lab → Doctor notifications                 | ⬜ Pending |
| P2       | Doctor schedule / jadwal                   | ⬜ Pending |
| P2       | Drug purchase orders & supplier management | ⬜ Pending |
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

| Field                 | Type     | Notes                                          |
| --------------------- | -------- | ---------------------------------------------- |
| `name`                | string   | Required                                       |
| `genericName`         | string   | Optional, drugs only                           |
| `itemType`            | enum     | `"drug"` \| `"material"` — toggle/select       |
| `category`            | string   | e.g. "Antibiotik", "Analgesik", "Consumables"  |
| `unit`                | string   | tablet, kapsul, ml, pcs, box, roll             |
| `price`               | decimal  | Prescription price                             |
| `generalPrice`        | decimal  | Optional general price                         |
| `minimumStock`        | integer  | Alert threshold, default 10                    |
| `requiresPrescription`| boolean  | TRUE for drugs, FALSE for materials            |
| `isActive`            | boolean  | Soft delete via toggle                         |
| `description`         | text     | Optional                                       |

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

| Field              | Type     | Notes                                          |
| ------------------ | -------- | ---------------------------------------------- |
| `code`             | string   | Unique, e.g. "CBC", "HBA1C", "XRAY-CHEST"     |
| `name`             | string   | Full name                                      |
| `category`         | string   | "Hematologi", "Kimia Klinik", "Radiologi", etc.|
| `department`       | enum     | `"LAB"` \| `"RAD"`                             |
| `price`            | decimal  | Test price                                     |
| `specimenType`     | string   | "Darah", "Urin", etc. (optional)               |
| `tatHours`         | integer  | Turnaround time in hours, default 24           |
| `requiresFasting`  | boolean  | Patient prep flag                              |
| `isActive`         | boolean  | Soft delete                                    |
| `description`      | text     | Optional                                       |
| `instructions`     | text     | Patient preparation instructions (optional)   |

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

| Field         | Type     | Notes                                          |
| ------------- | -------- | ---------------------------------------------- |
| `code`        | string   | Unique, e.g. "DIABETES-PANEL"                  |
| `name`        | string   | e.g. "Paket Diabetes"                          |
| `description` | text     | Optional                                       |
| `price`       | decimal  | Discounted panel price                         |
| `isActive`    | boolean  | Soft delete                                    |
| `tests`       | relation | Many-to-many via `labTestPanelItems`           |

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

