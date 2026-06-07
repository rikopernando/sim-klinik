# Review

## Pharmacy Page Redesign

### Files Changed

| File | Change |
|------|--------|
| `app/dashboard/pharmacy/page.tsx` | Replaced PharmacyHeader with PageHeader, pill filter buttons (Semua/Rawat Jalan/Rawat Inap) replacing Select, inline-flex TabsList, badge counts on tabs, max-w-5xl container |
| `components/pharmacy/stats/stat-card.tsx` | Removed Card/CardHeader/CardContent → flat `rounded-xl border shadow-sm` panel with icon slot on right, colored icon backgrounds per variant |
| `components/pharmacy/pharmacy-stats-cards.tsx` | Added icons: ClipboardList (queue), AlertTriangle (expired), Clock (expiring soon), Eye (warning). Changed grid to `grid-cols-2 md:grid-cols-4` |
| `components/pharmacy/prescription-queue-table.tsx` | Removed double Card wrapping (Card > CardContent > div.border). Single flat panel with `rounded-xl border bg-card shadow-sm overflow-hidden`. Added Skeleton loading states, proper empty state with ClipboardX icon. Added "Waktu" column |
| `components/pharmacy/queue/prescription-row.tsx` | Replaced 📍 emoji with MapPin icon. Fixed visit type badges to use colored variants (blue/emerald/red). Added prescription timestamp column |
| `components/pharmacy/expiring-drugs-list.tsx` | Changed prop from `drugs: DrugInventoryWithDetails[]` to `data: ExpiringDrugsData`. Groups items by severity (Sudah Kadaluarsa / Segera Kadaluarsa / Perhatian) with colored dot headers. Proper empty/loading states with icons |
| `components/pharmacy/expiring/expiring-drug-card.tsx` | Replaced heavy Card with border-2 → flat `rounded-lg border p-3 hover:bg-muted/30` row. Inline detail pills (batch, expiry, stock, supplier). Added "Inventaris" ghost button linking to inventory page |
| `components/pharmacy/bulk-fulfillment/header.tsx` | Complete rewrite: patient context strip with name, MR, visit type badge, doctor, and total count. No longer abusing DialogDescription |
| `components/pharmacy/bulk-fulfillment/prescription-item.tsx` | Removed ml-8 indents → flat layout with circular numbered badge. Drug details as compact inline pills (frequency, quantity, instructions). Compound label as inline badge |
| `components/pharmacy/fulfillment/batch-selector.tsx` | Replaced Card + CardContent per batch → flat `rounded-lg border p-2.5` rows. Smaller inputs (h-6), tighter spacing. Reduced max-h to 48 |
| `components/pharmacy/bulk-fulfillment-dialog.tsx` | Moved "Tambah Resep" button to dialog header (flex row with BulkFulfillmentHeader). Removed floating Separator before it. Action buttons now have `border-t pt-4` divider. Reduced space-y from 6 to 5 |

### What Improved
- **Zero double-Card wrapping** — every list is a single flat panel
- **Consistent icon language** — no more emoji, all Lucide icons
- **Visit type badges** — blue/emerald/red system matches the rest of the app
- **Pill filter** — replaces the Select dropdown for visit type filtering, faster to use
- **Expiring drugs grouped by urgency** — expired → expiring soon → warning, with section headers
- **Dialog patient context** — pharmacist can see patient name, MR, doctor, visit type at a glance without scrolling
- **"Tambah Resep" in header** — no longer orphaned in the middle of the form
- **Clear action row** — border-t separates dialog actions from form content
