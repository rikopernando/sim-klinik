# Sim-Klinik Feature Planner

Priority order from `documentation/priority-summary.png`:

| Priority | Feature                                    | Status     |
| -------- | ------------------------------------------ | ---------- |
| P0       | Reports page with real financial data      | ✅ Done    |
| P0       | Discharge management page                  | ✅ Done    |
| P1       | Queue ticket print                         | ⬜ Pending |
| P1       | Stok Opname                                | ✅ Done    |
| P1       | Dashboard home with real live stats        | ⬜ Pending |
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
