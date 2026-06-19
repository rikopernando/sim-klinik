# Review

## Pharmacy Page Redesign

### Files Changed

| File                                                         | Change                                                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/dashboard/pharmacy/page.tsx`                            | Replaced PharmacyHeader with PageHeader, pill filter buttons (Semua/Rawat Jalan/Rawat Inap) replacing Select, inline-flex TabsList, badge counts on tabs, max-w-5xl container                                                              |
| `components/pharmacy/stats/stat-card.tsx`                    | Removed Card/CardHeader/CardContent → flat `rounded-xl border shadow-sm` panel with icon slot on right, colored icon backgrounds per variant                                                                                               |
| `components/pharmacy/pharmacy-stats-cards.tsx`               | Added icons: ClipboardList (queue), AlertTriangle (expired), Clock (expiring soon), Eye (warning). Changed grid to `grid-cols-2 md:grid-cols-4`                                                                                            |
| `components/pharmacy/prescription-queue-table.tsx`           | Removed double Card wrapping (Card > CardContent > div.border). Single flat panel with `rounded-xl border bg-card shadow-sm overflow-hidden`. Added Skeleton loading states, proper empty state with ClipboardX icon. Added "Waktu" column |
| `components/pharmacy/queue/prescription-row.tsx`             | Replaced 📍 emoji with MapPin icon. Fixed visit type badges to use colored variants (blue/emerald/red). Added prescription timestamp column                                                                                                |
| `components/pharmacy/expiring-drugs-list.tsx`                | Changed prop from `drugs: DrugInventoryWithDetails[]` to `data: ExpiringDrugsData`. Groups items by severity (Sudah Kadaluarsa / Segera Kadaluarsa / Perhatian) with colored dot headers. Proper empty/loading states with icons           |
| `components/pharmacy/expiring/expiring-drug-card.tsx`        | Replaced heavy Card with border-2 → flat `rounded-lg border p-3 hover:bg-muted/30` row. Inline detail pills (batch, expiry, stock, supplier). Added "Inventaris" ghost button linking to inventory page                                    |
| `components/pharmacy/bulk-fulfillment/header.tsx`            | Complete rewrite: patient context strip with name, MR, visit type badge, doctor, and total count. No longer abusing DialogDescription                                                                                                      |
| `components/pharmacy/bulk-fulfillment/prescription-item.tsx` | Removed ml-8 indents → flat layout with circular numbered badge. Drug details as compact inline pills (frequency, quantity, instructions). Compound label as inline badge                                                                  |
| `components/pharmacy/fulfillment/batch-selector.tsx`         | Replaced Card + CardContent per batch → flat `rounded-lg border p-2.5` rows. Smaller inputs (h-6), tighter spacing. Reduced max-h to 48                                                                                                    |
| `components/pharmacy/bulk-fulfillment-dialog.tsx`            | Moved "Tambah Resep" button to dialog header (flex row with BulkFulfillmentHeader). Removed floating Separator before it. Action buttons now have `border-t pt-4` divider. Reduced space-y from 6 to 5                                     |

### What Improved

- **Zero double-Card wrapping** — every list is a single flat panel
- **Consistent icon language** — no more emoji, all Lucide icons
- **Visit type badges** — blue/emerald/red system matches the rest of the app
- **Pill filter** — replaces the Select dropdown for visit type filtering, faster to use
- **Expiring drugs grouped by urgency** — expired → expiring soon → warning, with section headers
- **Dialog patient context** — pharmacist can see patient name, MR, doctor, visit type at a glance without scrolling
- **"Tambah Resep" in header** — no longer orphaned in the middle of the form
- **Clear action row** — border-t separates dialog actions from form content

---

## Cashier Mobile Responsive + Emergency Redesign + Design Feedback Pass

### Files Changed

| File                                            | Change                                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/billing/process-payment-dialog.tsx` | Mobile: renders as Drawer (vaul bottom sheet); desktop: Dialog unchanged. Shared `formSections` JSX variable eliminates duplication                                  |
| `components/ui/page-header.tsx`                 | `bg-[#74c69d]` → `bg-primary` on accent bar                                                                                                                          |
| `lib/emergency/triage-utils.ts`                 | Added `getTriageLabelShort()` (returns "Merah"/"Kuning"/"Hijau"); rewrote `getTriageCardClasses()` with explicit switch cases for Tailwind dark mode static analysis |
| `components/emergency/er-queue-item.tsx`        | Flat `rounded-xl border` card layout; `getTriageLabelShort` in triage badge; Edit + Handover moved into `...` DropdownMenu; only primary CTA stays visible           |
| `components/emergency/er-queue-stats.tsx`       | Replaced Card blocks with flat `rounded-xl border p-4` panels; colored dot indicators; dark mode variants                                                            |
| `components/emergency/er-queue-tabs.tsx`        | `grid w-full grid-cols-4` → `inline-flex` with `overflow-x-auto` wrapper; shortened tab labels ("Diperiksa", "Selesai")                                              |
| `components/emergency/er-queue-loading.tsx`     | 3 skeleton rows matching flat card structure                                                                                                                         |
| `components/emergency/er-queue-empty.tsx`       | Flat `rounded-xl border bg-card py-16` with `CheckCircle` icon                                                                                                       |
| `app/dashboard/emergency/page.tsx`              | Responsive header with accent bar; `cn()` for RefreshCw animation; `variant="destructive"` CTA; sticky-footer pattern on Quick Register dialog                       |
| `components/doctor/doctor-queue-tabs.tsx`       | `overflow-x-auto` wrapper around `TabsList`; "RME Belum Dikunci" → "Belum Dikunci"; `bg-[#74c69d]` → `bg-primary` on "Sekarang" badge                                |
| `app/dashboard/laboratory/queue/page.tsx`       | Responsive header (`flex-col gap-4 sm:flex-row`) with accent bar; `inline-flex` tabs with `overflow-x-auto`; flex-wrap controls row                                  |
| `app/dashboard/inpatient/patients/page.tsx`     | Responsive header with accent bar; template string animation → `cn()`; `self-start sm:self-auto` on Refresh button                                                   |
| `app/dashboard/registration/page.tsx`           | Step indicator row: `flex items-center justify-between` → `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`                                       |

### What Improved

- **Process Payment on mobile** — bottom sheet instead of center modal; dismissible, scrollable form, sticky action buttons above home indicator
- **PageHeader accent bar** — uses `bg-primary` theme token everywhere, no more hardcoded green
- **Triage badge labels** — short form ("Merah" not "🔴 MERAH - Gawat Darurat") fits on one line at any width
- **Emergency card action row** — single primary CTA + `...` dropdown; always single-line regardless of card width
- **Dark mode triage cards** — static class strings let Tailwind detect `dark:bg-red-950/20` etc. at build time
- **Overflow tabs** — all tab bars scroll horizontally on mobile instead of squishing content
- **Responsive headers** — all 4 remaining pages (Doctor, Lab Queue, Inpatient, Registration) stack vertically on small screens

---

## Inpatient Patients — Table Design Unification

### Files Changed

| File | Change |
|------|--------|
| `app/dashboard/inpatient/patients/page.tsx` | Full rewrite: `PageHeader` + `SearchInput` + `TablePanel`; removed Card/CardAction/CardHeader; Refresh button in PageHeader children slot |
| `components/inpatient/patient-list-table.tsx` | Stripped loading/empty state (now in TablePanel); updated header to `bg-muted/40` + `text-xs font-semibold tracking-wider uppercase`; merged Kamar + Bed into one column |
| `components/inpatient/patient-list-row.tsx` | Mono `bg-muted` pill for MR number; room/bed shown as `ROOM · bed`; days stay as plain font-mono semibold (red when long stay, not Badge) |
| `components/inpatient/inpatient-pagination.tsx` | Removed outer `div` wrapper — TablePanel provides the footer row |
| `hooks/use-inpatient-filters.ts` | Exported `debouncedSearch` so page can compute `isSearching` for SearchInput spinner |

### What Improved

- **Consistent table chrome** — same header style, panel, loading/empty states as Rooms, Patients, Services pages
- **Cleaner row layout** — 6 columns instead of 7; Kamar + Bed merged into one compact cell
- **No more Badge overuse** — MR uses mono pill (like room numbers), days stay uses colored text (not a badge chip)
