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

| File                                            | Change                                                                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/dashboard/inpatient/patients/page.tsx`     | Full rewrite: `PageHeader` + `SearchInput` + `TablePanel`; removed Card/CardAction/CardHeader; Refresh button in PageHeader children slot                                |
| `components/inpatient/patient-list-table.tsx`   | Stripped loading/empty state (now in TablePanel); updated header to `bg-muted/40` + `text-xs font-semibold tracking-wider uppercase`; merged Kamar + Bed into one column |
| `components/inpatient/patient-list-row.tsx`     | Mono `bg-muted` pill for MR number; room/bed shown as `ROOM · bed`; days stay as plain font-mono semibold (red when long stay, not Badge)                                |
| `components/inpatient/inpatient-pagination.tsx` | Removed outer `div` wrapper — TablePanel provides the footer row                                                                                                         |
| `hooks/use-inpatient-filters.ts`                | Exported `debouncedSearch` so page can compute `isSearching` for SearchInput spinner                                                                                     |

### What Improved

- **Consistent table chrome** — same header style, panel, loading/empty states as Rooms, Patients, Services pages
- **Cleaner row layout** — 6 columns instead of 7; Kamar + Bed merged into one compact cell
- **No more Badge overuse** — MR uses mono pill (like room numbers), days stay uses colored text (not a badge chip)

---

## Inpatient Detail Page — Phase 1 Fixes + Tab Layout

### Files Changed

| File | Change |
| ---- | ------ |
| `components/smart-breadcrumb.tsx` | UUID segment detection: raw visit UUID → "Detail Pasien" in breadcrumb |
| `components/inpatient/bed-assignment-history.tsx` | "1 total assignment" → "1 riwayat penempatan" |
| `components/inpatient/patient-info-card.tsx` | Added `ROOM_TYPE_LABELS` map ("Class 1" → "Kelas 1"); two-tier "Rawat Lama" badge (amber 7–13 days, red 14+); replaced `IconCurrencyDollar` with `IconReceipt`; hide null demographic fields (Jenis Kelamin, DOB, NIK, Telepon, Alamat) instead of showing "-" |
| `app/dashboard/inpatient/patients/[visitId]/page.tsx` | Full rewrite: PageHeader-style header with green accent bar + status badge + Kembali/Refresh buttons; 4-tab layout (Ringkasan / Klinis / Tindakan & Obat / Pemulangan); Grafik & Analisis inside Card (no more floating h2); fixed typo "lat kesehatan" → "alat kesehatan"; shortened CPPT card title; `max-w-5xl` container to match PageHeader |

### What Improved

- **Breadcrumb** — "Detail Pasien" instead of the raw UUID
- **Status badge** — visit status shown inline with patient name (color-coded by state)
- **Tab navigation** — 10+ scroll sections collapsed into 4 purposeful tabs; a nurse can jump straight to Klinis or Tindakan & Obat without scrolling past everything
- **Grafik & Analisis** — now inside a Card, consistent with other sections (was a free-floating h2)
- **Room type localized** — "Class 1" → "Kelas 1" in patient info card (fixes same bug that was already fixed on the list)
- **Two-tier long-stay badge** — amber for 7–13 days, red for 14+ (matches list page, was always destructive-red before)
- **Empty demographics hidden** — left card no longer shows 5 dashes for seed patients with missing data
- **Currency icon** — `IconCurrencyDollar` (USD) replaced with `IconReceipt` for Rupiah fields

---

## Inpatient Detail Page — Design Improvements

### Files Changed

| File | Change |
| ---- | ------ |
| `app/dashboard/inpatient/patients/[visitId]/page.tsx` | Clinical context strip in header; underline tab style replacing default pill tabs; ROOM_TYPE_LABELS + inpatient constants imported |
| `components/inpatient/patient-info-card.tsx` | Right card restructured from vertical icon+label list to 3-col × 2-row stats grid; days-in-hospital as 2xl hero number; removed unused icon imports (`IconBed`, `IconReceipt`, `IconCalendarEvent`) and `formatDateTime` |

### What Improved

- **Clinical context strip** — room number, bed, type, and days-in-hospital appear in the header below the MR/Visit line. Stays visible on every tab so nurses never lose patient orientation when switching between Klinis and Tindakan & Obat
- **Underline tabs** — replaced shadcn's default pill/rounded tab buttons with a border-bottom style. Active tab gets a green underline; inactive tabs are plain text. Feels like a medical chart file divider rather than a generic UI filter
- **Stats grid on right card** — "Informasi Rawat Inap" changed from a list of 6 icon+label+value rows to two compact rows: (Tanggal Masuk / Kamar & Bed / Tipe) and (Hari Rawat / Tarif/Hari / Total Biaya). The day count is now a large `text-2xl` number colored amber/red by severity — scannable in under 2 seconds
- **Left card with real data** — with a patient who has demographics filled in (DOB, NIK, phone), the left card now shows all those fields naturally since empty fields are hidden rather than showing dashes

---

## Inpatient Detail Page — Direction C + Tab Content Overhaul

### Files Changed

| File | Change |
| ---- | ------ |
| `app/dashboard/inpatient/patients/[visitId]/page.tsx` | Direction C: `bg-slate-50` page bg, white header, ghost buttons, more breathing, underline tabs |
| `components/inpatient/vitals-history-table.tsx` | Standard header; 11 → 8 cols (dropped BB/TB + Kesadaran, merged Waktu+Oleh); consistent empty state with icon; pain scale uses colored mono text not Badge |
| `components/inpatient/material-usage-card.tsx` | Standard header; empty state with icon |
| `components/inpatient/prescriptions-list.tsx` | Standard header; 11 → 7 cols (merged jenis/rute into Obat cell, dropped Harga Satuan); `window.confirm()` → AlertDialog; consistent empty state |
| `components/inpatient/procedures-list.tsx` | Standard header; 9 → 6 cols (merged personel, notes into tindakan cell); `window.confirm()` → AlertDialog |
| `components/inpatient/bed-assignment-history.tsx` | Full rewrite: colored left-border divs → clean table; Lucide icons removed; fixed double-Rp bug on past assignments; Aktif/Selesai badge in Status column |
| `components/inpatient/cppt-entry-card.tsx` | Removed Card-in-Card nesting → flat `rounded-lg border p-4`; removed `border-l-4` colored borders; role shown only as soft outline Badge |
| `components/inpatient/cppt-history.tsx` | Empty state with icon |
| `components/inpatient/vitals-trend-chart.tsx` | Removed wrapping Card (was Card-in-Card); removed dual Y-axis "all" mode → 5 individual metric tabs; metric + date range selectors now compact pill groups instead of heavy Button rows |

### What Improved

- **Table standard applied everywhere** — all table headers now `bg-muted/40` + `text-xs font-semibold uppercase tracking-wider`, matching the patient list page
- **Column counts reduced** — vitals 11→8, prescriptions 11→7, procedures 9→6; no more horizontal overflow
- **Delete dialogs** — prescriptions and procedures replaced `window.confirm()` with proper AlertDialog (consistent with vitals and materials which already did this)
- **Bed history** — goes from a heavy visual design (green/gray left-border cards) to a clean table; the Rp double-prefix bug on past assignments is fixed
- **CPPT entries** — no longer Card-in-Card; role differentiation simplified to one soft outline Badge (was: icon + Badge + colored border = triple signaling)
- **Vitals chart** — no longer wraps itself in a Card (was double-wrapped in page); the confusing dual-Y-axis "Semua" mode removed; metric selector is now a compact segment control
- **Empty states** — all now have an icon, consistent across all 5 tables/lists

---

## Inpatient Detail Page — Round 3 Design Refinements

### Files Changed

| File | Change |
| ---- | ------ |
| `app/dashboard/inpatient/patients/[visitId]/page.tsx` | Fixed tab active-state border (box → clean underline); Pemulangan section wrapped in Card for consistency |
| `components/inpatient/patient-info-card.tsx` | Left card: replaced icon+label+value rows with compact `dl` definition-list; removed all icon imports |

### What Improved

- **Tab underline fixed** — The base shadcn `TabsTrigger` has `border border-transparent` on all 4 sides. Changing `data-[state=active]:border-primary` (all sides) → `data-[state=active]:border-b-primary` (bottom only) eliminates the box outline. Active tab now shows a single clean underline.
- **Informasi Pasien compact dl** — Removed 6 icon imports and the verbose icon+label+value row pattern (2 DOM lines per field). Replaced with a `<dl>` where each entry is `<dt className="text-muted-foreground shrink-0 text-sm">` left-aligned and `<dd className="text-right text-sm font-medium">` right-aligned. NIK rendered in `font-mono`. Left card now matches the right card's height, the two-column layout looks balanced.

---

## Inpatient Mobile/Tablet Polish — Phase 6

### Files Changed

| File | Change |
| ---- | ------ |
| `components/ui/responsive-dialog.tsx` | **New file.** Compound component wrapping Dialog (desktop) ↔ Drawer/bottom-sheet (mobile) using `useIsMobile()`. Exports `ResponsiveDialog`, `ResponsiveDialogTrigger`, `ResponsiveDialogContent`, `ResponsiveDialogHeader`, `ResponsiveDialogTitle`, `ResponsiveDialogDescription`. |
| `components/smart-breadcrumb.tsx` | Added `cn` import. Middle breadcrumb items (all except last 2) get `hidden sm:contents` — on mobile only parent + current page show, eliminating the two-line wrap. |
| `app/dashboard/inpatient/patients/[visitId]/page.tsx` | TabsList: replaced `overflow-x-auto` with `flex-wrap` so 4 tabs wrap 2×2 on mobile. TabsTrigger: added `basis-1/2 justify-center sm:basis-auto sm:justify-start`. All 7 CardHeader inner divs: replaced `flex items-center justify-between` with `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` so action buttons drop below the title on narrow screens. |
| `components/inpatient/record-vitals-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/cppt-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/record-material-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/create-prescription-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/create-procedure-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/discharge-summary-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/complete-discharge-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/inpatient/final-discharge-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |
| `components/laboratory/create-lab-order-dialog.tsx` | Dialog → `ResponsiveDialog` (bottom sheet on mobile). |

### What Improved

- **Breadcrumb no longer wraps** — On a 4-segment path (Dashboard / Rawat Inap / Daftar Pasien / Detail Pasien), mobile now shows only "Daftar Pasien / Detail Pasien". Middle segments are hidden below `sm`.
- **Tabs 2×2 grid on mobile** — The 4 detail-page tabs (Ringkasan / Klinis / Tindakan & Obat / Pemulangan) wrap into two rows of two on mobile instead of requiring horizontal scroll.
- **Card headers stack on mobile** — Every CardHeader action button (Catat Tanda Vital, Tambah CPPT, etc.) drops below its title on narrow screens, preventing overflow.
- **All inpatient dialogs are bottom sheets on mobile** — 9 dialogs updated via `ResponsiveDialog`. On desktop they remain standard centered dialogs; on mobile they slide up from the bottom (vaul drawer), which is the native mobile modal pattern. `DialogFooter` is reused as-is inside both modes since it's just a styled div.
- **Pemulangan in Card** — The free-standing `h2` + naked `div` was inconsistent with all other tabs using `Card > CardHeader > CardTitle`. Replaced with a single Card: header always shows title + description, empty state renders as `CardContent` text, `DischargeSummaryCard` renders below when present.
