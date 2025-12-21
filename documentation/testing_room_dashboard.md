# Testing Guide: Room Management Dashboard (Refactored)

## Pre-requisites

### 1. Database Running
```bash
npm run db:up
```

### 2. Seed Room Data (if not done yet)
```bash
npm run db:seed:rooms
```

**Expected Output:**
```
🌱 Starting rooms seeder...
📦 Inserting 21 rooms...
✅ Successfully seeded rooms!

Room Summary:
- VIP: 3 rooms (3 beds total)
- Class 1: 4 rooms (8 beds total)
- Class 2: 4 rooms (16 beds total)
- Class 3: 3 rooms (18 beds total)
- ICU: 4 rooms (4 beds total)
- Isolation: 3 rooms (3 beds total)

Total: 21 rooms with 52 beds
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Testing Checklist

### ✅ Phase 1: Basic Display

#### 1.1 Navigate to Room Dashboard
- **URL:** `http://localhost:3000/dashboard/inpatient/rooms`
- **Expected:** Page loads without errors

#### 1.2 Verify Header
- [ ] Title: "Dashboard Kamar Rawat Inap" displays
- [ ] Description: "Manajemen dan visualisasi status hunian kamar" displays
- [ ] Refresh button visible and enabled
- [ ] Last update time displays (format: HH:MM:SS)

#### 1.3 Verify Statistics Cards (4 cards)
- [ ] **Total Kamar:** Shows "21" (neutral styling)
- [ ] **Kamar Kosong:** Shows "21" (green styling)
- [ ] **Terisi Sebagian:** Shows "0" (yellow styling)
- [ ] **Tingkat Hunian:** Shows "0%" (blue styling)

#### 1.4 Verify Filter Buttons
- [ ] "Semua (21)" - default selected (primary style)
- [ ] "Kosong (21)" - outline style
- [ ] "Terisi (0)" - outline style
- [ ] "Penuh (0)" - outline style

#### 1.5 Verify Room Grid
- [ ] Displays 21 room cards in grid layout
- [ ] Responsive: 1 column (mobile), 2 (tablet), 3 (laptop), 4 (desktop)
- [ ] All cards have green left border (empty status)
- [ ] All cards show "Kosong" badge (green)

---

### ✅ Phase 2: Room Card Details

Pick any room card and verify:

#### 2.1 Room Header
- [ ] Room number displays (e.g., "Kamar VIP-101")
- [ ] Room type displays (e.g., "VIP")
- [ ] Status badge shows "Kosong" (green)

#### 2.2 Bed Information
- [ ] Bed icon displays
- [ ] Shows "0 / X bed terisi" (X = bed count)

#### 2.3 Occupancy Bar
- [ ] Label shows "Hunian"
- [ ] Percentage shows "0%"
- [ ] Progress bar is empty
- [ ] Bar color is green

#### 2.4 Location Info
- [ ] Building displays (e.g., "Gedung A")
- [ ] Floor displays (e.g., "Lantai 1")
- [ ] Building icon shows

#### 2.5 Daily Rate
- [ ] Label: "Tarif Harian"
- [ ] Amount formatted correctly (e.g., "Rp 1.500.000")
- [ ] Indonesian number format (dots for thousands)

#### 2.6 Bed Assignments Section
- [ ] Should NOT show (no patients assigned yet)

#### 2.7 Action Button
- [ ] "Alokasi Bed" button visible
- [ ] Button enabled (not disabled)
- [ ] UserPlus icon displays

---

### ✅ Phase 3: Filtering

#### 3.1 Filter: Kosong (Empty)
- **Action:** Click "Kosong (21)" button
- **Expected:**
  - [ ] Button becomes primary styled (active)
  - [ ] Shows all 21 rooms
  - [ ] All cards have green borders
  - [ ] All show "Kosong" badge

#### 3.2 Filter: Terisi (Occupied)
- **Action:** Click "Terisi (0)" button
- **Expected:**
  - [ ] Button becomes primary styled (active)
  - [ ] Shows empty state message
  - [ ] Message: "Tidak ada kamar yang sesuai filter"
  - [ ] Sub-message: "Coba ubah filter atau refresh data"

#### 3.3 Filter: Penuh (Full)
- **Action:** Click "Penuh (0)" button
- **Expected:**
  - [ ] Button becomes primary styled (active)
  - [ ] Shows empty state message

#### 3.4 Filter: Semua (All)
- **Action:** Click "Semua (21)" button
- **Expected:**
  - [ ] Shows all 21 rooms again

---

### ✅ Phase 4: Bed Assignment (Manual)

#### 4.1 Open Assignment Dialog
- **Action:** Click "Alokasi Bed" on any VIP room card
- **Expected:**
  - [ ] Dialog opens
  - [ ] Title: "Alokasi Bed Pasien"
  - [ ] Description: "Cari pasien rawat inap yang belum memiliki bed"
  - [ ] Patient search section visible

#### 4.2 Search Patient (No Results)
- **Action:** Type "test" in search box, click "Cari"
- **Expected:**
  - [ ] Shows "Mencari pasien..." while loading
  - [ ] Shows "Tidak ada hasil pencarian" (no matches)

#### 4.3 Close Dialog
- **Action:** Click "Batal" or click outside dialog
- **Expected:**
  - [ ] Dialog closes
  - [ ] Returns to dashboard

---

### ✅ Phase 5: Bed Assignment (From Registration)

#### 5.1 Register Inpatient Patient
- **Action:**
  1. Navigate to `/dashboard/registration`
  2. Click "Pasien Baru"
  3. Fill patient form (NIK: 1234567890123456, Name: Test Patient, etc.)
  4. Submit Step 1
  5. Select "Rawat Inap" as visit type
  6. Submit registration

- **Expected:**
  - [ ] Success screen shows
  - [ ] Shows "Alokasi Bed Sekarang" button (blue/secondary)
  - [ ] Button is prominent and visible

#### 5.2 Click Bed Assignment
- **Action:** Click "Alokasi Bed Sekarang"
- **Expected:**
  - [ ] Redirects to room dashboard
  - [ ] URL has query params: `?assignBed=visit-id&patientName=Test%20Patient`
  - [ ] Bed assignment dialog AUTO-OPENS
  - [ ] Patient already selected (shows patient card)
  - [ ] Patient name displays: "Test Patient"
  - [ ] "Ubah" button visible to change patient

#### 5.3 Assign Room and Bed
- **Action:**
  1. Select room (e.g., "Kamar VIP-101")
  2. Enter bed number: "1"
  3. Click "Alokasikan Bed"

- **Expected:**
  - [ ] Button shows "Memproses..." while submitting
  - [ ] Success toast: "Bed berhasil dialokasikan"
  - [ ] Dialog closes
  - [ ] Dashboard refreshes automatically

#### 5.4 Verify Room Updated
- **Expected:**
  - [ ] VIP-101 card border changes to yellow
  - [ ] Badge changes to "Tersedia Sebagian"
  - [ ] Bed info: "1 / 1 bed terisi"
  - [ ] Occupancy bar: 100% (red)
  - [ ] "Pasien di Kamar Ini" section appears
  - [ ] Shows patient card with:
    - Patient name
    - MR number
    - Bed number badge
    - Days stayed info
  - [ ] "Alokasi Bed" button becomes DISABLED

#### 5.5 Verify Statistics Updated
- **Expected:**
  - [ ] Total Kamar: 21 (unchanged)
  - [ ] Kamar Kosong: 20 (decreased by 1)
  - [ ] Terisi Sebagian: 1 (increased by 1)
  - [ ] Tingkat Hunian: 2% (1/52 beds = 1.9%)

#### 5.6 Verify Filter Counts Updated
- **Expected:**
  - [ ] Semua (21)
  - [ ] Kosong (20)
  - [ ] Terisi (1)
  - [ ] Penuh (1)

---

### ✅ Phase 6: Multiple Bed Assignments

#### 6.1 Assign Another Bed (Class 1 Room)
- **Action:**
  1. Register another inpatient patient
  2. Assign to "K1-103" (2 beds), Bed 1
  3. Submit

- **Expected:**
  - [ ] K1-103 shows yellow border
  - [ ] Badge: "Tersedia Sebagian"
  - [ ] Bed info: "1 / 2 bed terisi"
  - [ ] Occupancy: 50%
  - [ ] Button still enabled (1 bed available)

#### 6.2 Fill Same Room
- **Action:**
  1. Register another patient
  2. Assign to "K1-103", Bed 2
  3. Submit

- **Expected:**
  - [ ] K1-103 shows red border
  - [ ] Badge: "Penuh"
  - [ ] Bed info: "2 / 2 bed terisi"
  - [ ] Occupancy: 100%
  - [ ] Shows 2 patient cards
  - [ ] Button becomes DISABLED

#### 6.3 Updated Statistics
- **Expected:**
  - [ ] Kamar Kosong: 19
  - [ ] Terisi Sebagian: 0
  - [ ] Penuh (Tingkat Hunian): Increases to ~6% (3/52)

---

### ✅ Phase 7: Auto-Refresh

#### 7.1 Wait 30 Seconds
- **Action:** Wait and observe
- **Expected:**
  - [ ] Dashboard refreshes automatically
  - [ ] "Update" time changes
  - [ ] Data stays consistent
  - [ ] No visual glitches

#### 7.2 Manual Refresh
- **Action:** Click "Refresh" button
- **Expected:**
  - [ ] Button shows spinning icon
  - [ ] Data reloads
  - [ ] Update time changes
  - [ ] Spinner stops when done

---

### ✅ Phase 8: Responsive Design

#### 8.1 Mobile View (< 640px)
- **Action:** Resize browser to mobile width
- **Expected:**
  - [ ] Header stacks vertically
  - [ ] Statistics: 2 columns
  - [ ] Filter buttons wrap
  - [ ] Room grid: 1 column
  - [ ] Room cards stack nicely

#### 8.2 Tablet View (640px - 1024px)
- **Expected:**
  - [ ] Statistics: 2 columns
  - [ ] Room grid: 2 columns

#### 8.3 Desktop View (1024px+)
- **Expected:**
  - [ ] Statistics: 4 columns
  - [ ] Room grid: 3 columns

#### 8.4 Large Desktop (1280px+)
- **Expected:**
  - [ ] Room grid: 4 columns

---

### ✅ Phase 9: Dark Mode (Optional)

#### 9.1 Toggle Dark Mode
- **Action:** Toggle theme switcher
- **Expected:**
  - [ ] All cards adapt to dark theme
  - [ ] Statistics cards maintain color coding
  - [ ] Text remains readable
  - [ ] Border colors adjusted
  - [ ] No white flashes

---

### ✅ Phase 10: Error Handling

#### 10.1 Network Error Simulation
- **Action:**
  1. Open DevTools → Network tab
  2. Set throttling to "Offline"
  3. Click "Refresh" button

- **Expected:**
  - [ ] Error state handled gracefully
  - [ ] Shows error message or retry option
  - [ ] Doesn't crash

#### 10.2 Invalid Bed Number
- **Action:**
  1. Open bed assignment dialog
  2. Select room with 1 bed
  3. Enter bed number "999"
  4. Try to submit

- **Expected:**
  - [ ] Validation error shows
  - [ ] Cannot submit
  - [ ] Error message: "Nomor bed harus antara 1 dan X"

---

## Performance Testing

### Check Console
- [ ] No errors in console
- [ ] No warnings about re-renders
- [ ] No memory leaks (use React DevTools Profiler)

### Check Network
- [ ] Only 1 API call on page load (`/api/rooms`)
- [ ] Auto-refresh calls every 30 seconds
- [ ] No unnecessary duplicate requests

### Check Rendering
- [ ] Page loads quickly (< 1 second)
- [ ] Filtering is instant
- [ ] No lag when scrolling
- [ ] Smooth animations

---

## Known Issues / Expected Behavior

### ✅ Expected Behaviors
1. **Empty State:** When no patients assigned, shows all green cards
2. **Auto-Refresh:** Updates every 30 seconds automatically
3. **Filter Counts:** Change dynamically based on assignments
4. **Disabled Buttons:** Full rooms have disabled "Alokasi Bed" button

### ⚠️ Edge Cases to Test
1. **Duplicate Bed Assignment:** Try assigning same patient to bed twice
   - Should show error: "Pasien sudah memiliki alokasi bed aktif"

2. **Same Bed Number:** Try assigning 2 patients to same bed
   - Should show error: "Bed X sudah ditempati"

3. **Non-Inpatient Visit:** Try searching for outpatient patient
   - Should NOT appear in search results

---

## Rollback Plan

If issues found, restore backup:

```bash
# Restore original file
cd /Users/rikopernando/workspace/me/sim-klinik/app/dashboard/inpatient/rooms
mv page.tsx page-refactored.tsx
mv page.tsx.backup page.tsx
```

Then restart dev server.

---

## Test Results Template

### Summary
- **Test Date:** [Date]
- **Tester:** [Name]
- **Environment:** Development / Production
- **Browser:** Chrome / Firefox / Safari
- **Device:** Desktop / Mobile

### Results
- [ ] Phase 1: Basic Display - PASS / FAIL
- [ ] Phase 2: Room Card Details - PASS / FAIL
- [ ] Phase 3: Filtering - PASS / FAIL
- [ ] Phase 4: Manual Assignment - PASS / FAIL
- [ ] Phase 5: Registration Flow - PASS / FAIL
- [ ] Phase 6: Multiple Assignments - PASS / FAIL
- [ ] Phase 7: Auto-Refresh - PASS / FAIL
- [ ] Phase 8: Responsive Design - PASS / FAIL
- [ ] Phase 9: Dark Mode - PASS / FAIL
- [ ] Phase 10: Error Handling - PASS / FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]

---

**Happy Testing! 🧪**
