# Laboratory & Radiology Module - Testing Plan

**Date Created:** 2025-01-09
**Module:** Laboratory & Radiology
**Overall Progress:** 90% Complete
**Testing Status:** 🧪 IN PROGRESS

---

## Testing Objectives

1. ✅ Validate complete end-to-end workflow (Order → Collection → Analysis → Result → Verification)
2. ✅ Verify RBAC permissions work correctly for all roles
3. ✅ Test critical value alerts and notifications
4. ✅ Validate auto-refresh functionality in queue page
5. ✅ Test edge cases and error handling
6. ✅ Ensure UI/UX is intuitive and user-friendly
7. ✅ Verify data integrity and type safety

---

## Test Environment Setup

### Prerequisites
- [ ] PostgreSQL database running
- [ ] Test users created with different roles:
  - [ ] Doctor (role: `doctor`)
  - [ ] Lab Technician (role: `lab_technician`)
  - [ ] Lab Supervisor (role: `lab_supervisor`)
  - [ ] Admin (role: `admin`)
- [ ] Test patients created
- [ ] Test visits created (inpatient/outpatient)
- [ ] Lab test catalog seeded
- [ ] Dev server running

### Setup Commands
```bash
# Start database
npm run db:up

# Push schema (if needed)
npm run db:push

# Seed lab tests
npm run db:seed:lab-tests

# Start dev server
npm run dev
```

---

## Test Cases

### 1. End-to-End Workflow Testing 🔄

#### Test Case 1.1: Doctor Orders Lab Test
**Role:** Doctor
**Preconditions:**
- Logged in as doctor
- Patient with active visit exists
- Lab test catalog is populated

**Steps:**
1. Navigate to patient's medical record/CPPT page
2. Click "Order Lab Tests" or open lab order dialog
3. Search and select a test (e.g., "Complete Blood Count")
4. Set urgency level (routine/urgent/stat)
5. Add clinical indication (optional)
6. Submit the order

**Expected Results:**
- [ ] Order is created successfully
- [ ] Success toast notification appears
- [ ] Order appears in lab orders list with status "ordered"
- [ ] Order number is auto-generated (format: LAB-YYYYMMDD-XXXX)
- [ ] Order is visible in Lab Technician Queue Page

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.2: Lab Tech Views Order in Queue
**Role:** Lab Technician
**Preconditions:**
- Logged in as lab technician
- At least one order exists with status "ordered"

**Steps:**
1. Navigate to `/dashboard/laboratory/queue`
2. Check "Perlu Diproses" tab
3. Verify order appears in the table

**Expected Results:**
- [ ] Queue page loads without errors
- [ ] Navigation menu shows "Antrian Laboratorium"
- [ ] Order appears in "Perlu Diproses" tab
- [ ] Order details are correct (patient name, test name, urgency, ordered time)
- [ ] Action buttons are visible (Update Status, View Detail)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.3: Lab Tech Collects Specimen
**Role:** Lab Technician
**Preconditions:**
- Order exists with status "ordered"

**Steps:**
1. In queue page, click "Update Status" on an order
2. Select "Specimen Collected"
3. Confirm the status update

**Expected Results:**
- [ ] Status updates to "specimen_collected"
- [ ] Success toast notification appears
- [ ] Order moves to appropriate section in queue
- [ ] Timestamp is recorded

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.4: Lab Tech Starts Analysis (In Progress)
**Role:** Lab Technician
**Preconditions:**
- Order exists with status "specimen_collected"

**Steps:**
1. Click "Update Status" on order with specimen collected
2. Select "In Progress"
3. Confirm the status update

**Expected Results:**
- [ ] Status updates to "in_progress"
- [ ] Order appears in "Sedang Dikerjakan" tab
- [ ] Success notification appears

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.5: Lab Tech Enters Results (Numeric)
**Role:** Lab Technician
**Preconditions:**
- Order exists with status "in_progress"
- Test is numeric type (e.g., Glucose)

**Steps:**
1. Click "Input Hasil" button on the order
2. Enter numeric value (e.g., "120")
3. Check "Nilai Kritis" if applicable
4. Add technician notes (optional)
5. Submit the result

**Expected Results:**
- [ ] Result entry dialog opens
- [ ] Form shows unit and reference range
- [ ] Validation works (requires numeric value)
- [ ] Critical value checkbox functions
- [ ] Result is saved successfully
- [ ] Order status updates to "completed"
- [ ] Success toast appears

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.6: Lab Tech Enters Results (Descriptive)
**Role:** Lab Technician
**Preconditions:**
- Order exists with status "in_progress"
- Test is descriptive type (e.g., Urinalysis)

**Steps:**
1. Click "Input Hasil" button on the order
2. Enter descriptive findings (e.g., "No bacteria seen")
3. Add interpretation/notes
4. Submit the result

**Expected Results:**
- [ ] Result entry dialog opens
- [ ] Form accepts text input
- [ ] Result is saved with correct structure
- [ ] Order status updates to "completed"

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.7: Supervisor Verifies Result
**Role:** Lab Supervisor
**Preconditions:**
- Order exists with status "completed"
- Result has been entered but not verified

**Steps:**
1. Navigate to queue page
2. Go to "Selesai Hari Ini" tab
3. Click "Verify" button on a completed order
4. Confirm verification

**Expected Results:**
- [ ] Verification dialog/confirmation appears
- [ ] Result is marked as verified
- [ ] Order status updates to "verified"
- [ ] Verifier name and timestamp recorded
- [ ] Success notification appears

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 1.8: Doctor Views Verified Result
**Role:** Doctor
**Preconditions:**
- Order exists with status "verified"
- Result has been entered and verified

**Steps:**
1. Navigate to patient's medical record
2. Open lab orders section
3. Click "Lihat Detail" on verified order

**Expected Results:**
- [ ] OrderDetailDialog opens
- [ ] All order information displayed correctly
- [ ] Result value shown with unit (numeric) or findings (descriptive)
- [ ] Verification badge/indicator visible
- [ ] Verifier name and time displayed
- [ ] Timeline shows all status changes
- [ ] No TypeScript errors in console

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 2. RBAC Permission Testing 🔐

#### Test Case 2.1: Doctor Permissions
**Role:** Doctor

**Steps:**
1. Log in as doctor
2. Check sidebar navigation
3. Try accessing various pages

**Expected Results:**
- [ ] Can access: Dashboard, Patients, Medical Records, Inpatient
- [ ] Can order lab tests
- [ ] Can view lab results
- [ ] **Cannot** access: Lab Queue page (lab:write permission required)
- [ ] **Cannot** enter lab results
- [ ] **Cannot** verify lab results

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 2.2: Lab Technician Permissions
**Role:** Lab Technician

**Steps:**
1. Log in as lab technician
2. Check sidebar navigation
3. Access lab queue page
4. Try various actions

**Expected Results:**
- [ ] Sidebar shows "Antrian Laboratorium"
- [ ] Can access lab queue page
- [ ] Can update order status
- [ ] Can enter results
- [ ] **Cannot** verify results (requires lab:verify permission)
- [ ] **Cannot** access admin features

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 2.3: Lab Supervisor Permissions
**Role:** Lab Supervisor

**Steps:**
1. Log in as lab supervisor
2. Check available features
3. Try verification actions

**Expected Results:**
- [ ] Has all lab technician permissions
- [ ] Can verify results (lab:verify permission)
- [ ] Can access reports
- [ ] Can view all lab orders (not just assigned ones)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 2.4: Admin Permissions
**Role:** Admin

**Steps:**
1. Log in as admin
2. Check access to all lab features

**Expected Results:**
- [ ] Can access all lab pages
- [ ] Can manage lab test catalog
- [ ] Can view all orders and results
- [ ] Full system access

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 3. Critical Value Alert Testing 🚨

#### Test Case 3.1: Critical Value Detection
**Role:** Lab Technician

**Steps:**
1. Enter a result and check "Nilai Kritis"
2. Submit the result

**Expected Results:**
- [ ] Warning toast appears: "Nilai kritis terdeteksi! Notifikasi telah dikirim ke dokter."
- [ ] Result saved with `criticalValue: true`
- [ ] Critical value alert shown in OrderDetailDialog (red warning badge)
- [ ] Auto-dismiss alert appears for 5 seconds

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 3.2: Critical Value Display
**Role:** Doctor

**Steps:**
1. View an order with critical value result
2. Check OrderDetailDialog

**Expected Results:**
- [ ] Red destructive alert banner displayed
- [ ] Alert title: "Nilai Kritis"
- [ ] Alert description: "Hasil ini ditandai sebagai nilai kritis dan memerlukan perhatian segera"
- [ ] IconAlertTriangle visible

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 4. Auto-Refresh Testing 🔄

#### Test Case 4.1: Manual Refresh
**Role:** Lab Technician

**Steps:**
1. Open queue page
2. Click "Refresh" button
3. Observe behavior

**Expected Results:**
- [ ] Page refreshes data immediately
- [ ] All tables re-fetch
- [ ] No page reload (SPA behavior)
- [ ] Refresh key increments

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 4.2: Auto-Refresh Toggle
**Role:** Lab Technician

**Steps:**
1. Open queue page
2. Toggle "Auto-refresh (30s)" switch ON
3. Wait 30 seconds
4. Observe behavior

**Expected Results:**
- [ ] Switch toggles correctly
- [ ] Page auto-refreshes every 30 seconds
- [ ] Interval clears when toggled OFF
- [ ] No memory leaks (check useEffect cleanup)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 5. UI/UX Testing 🎨

#### Test Case 5.1: Queue Page Tabs
**Role:** Lab Technician

**Steps:**
1. Navigate to queue page
2. Switch between all 4 tabs

**Expected Results:**
- [ ] 4 tabs visible: Perlu Diproses, Urgent/STAT, Sedang Dikerjakan, Selesai Hari Ini
- [ ] Each tab shows correct filtered orders
- [ ] Tab switching is smooth
- [ ] Emojis display correctly (🎯 🚨 ⏳ ✅)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 5.2: Urgency Color Coding
**Role:** Lab Technician

**Steps:**
1. Open "Urgent/STAT" tab
2. Check color coding of cards

**Expected Results:**
- [ ] STAT card has red background (border-red-200, bg-red-50)
- [ ] STAT title is red (text-red-700)
- [ ] URGENT card has orange background (border-orange-200, bg-orange-50)
- [ ] URGENT title is orange (text-orange-700)
- [ ] Cards are visually distinct

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 5.3: Result Entry Form Validation
**Role:** Lab Technician

**Steps:**
1. Open result entry dialog
2. Try submitting empty form
3. Fill in required fields
4. Submit

**Expected Results:**
- [ ] Empty value shows error: "Nilai hasil harus diisi"
- [ ] Form prevents submission until valid
- [ ] Error messages in Indonesian
- [ ] Submit button disabled during save

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 5.4: Order Detail Dialog
**Role:** Any user with permissions

**Steps:**
1. Click "Lihat Detail" on any order
2. Scroll through dialog content

**Expected Results:**
- [ ] Dialog opens smoothly
- [ ] All sections visible: Header, Test Info, Results (if exists), Timeline
- [ ] Badges show correct colors
- [ ] Timeline icons appropriate (IconClock, IconDroplet, IconFileText, IconCheck)
- [ ] Dialog scrollable (max-h-[90vh])
- [ ] Close button works

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 6. Edge Cases & Error Handling ⚠️

#### Test Case 6.1: Network Error Handling
**Steps:**
1. Simulate network failure (disconnect WiFi or use DevTools Network throttling)
2. Try to submit an order/result

**Expected Results:**
- [ ] Error toast appears with meaningful message
- [ ] Form data not lost
- [ ] User can retry after network restored
- [ ] No silent failures

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 6.2: Concurrent Edits
**Steps:**
1. Open same order in two browser windows
2. Update status in window A
3. Try to enter result in window B

**Expected Results:**
- [ ] System handles gracefully
- [ ] Last write wins OR conflict detection
- [ ] No data corruption
- [ ] User notified of conflict

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 6.3: Invalid Data Handling
**Steps:**
1. Try entering non-numeric value for numeric test
2. Try extremely large values
3. Try special characters

**Expected Results:**
- [ ] Zod validation catches invalid data
- [ ] Helpful error messages shown
- [ ] No server errors
- [ ] No SQL injection possible (parameterized queries)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 6.4: Empty States
**Steps:**
1. View queue page with no orders
2. View lab orders list with no orders for patient

**Expected Results:**
- [ ] "No orders found" or similar message
- [ ] Not blank/broken UI
- [ ] Helpful message suggesting next action

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 6.5: Large Dataset Performance
**Steps:**
1. Create 50+ lab orders
2. Open queue page
3. Test filtering and sorting

**Expected Results:**
- [ ] Page loads within 2 seconds
- [ ] Filtering is responsive
- [ ] No UI freezing
- [ ] Pagination works (if implemented)

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 7. Data Integrity Testing 🗄️

#### Test Case 7.1: Result Data Structure
**Steps:**
1. Enter numeric result
2. Enter descriptive result
3. Query database directly

**Expected Results:**
- [ ] Numeric result stored as: `{ value, unit, referenceRange, flag }`
- [ ] Descriptive result stored as: `{ findings, interpretation }`
- [ ] JSONB structure matches TypeScript types
- [ ] No data loss on save/retrieve

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 7.2: Timestamp Accuracy
**Steps:**
1. Create order
2. Update status multiple times
3. Enter result
4. Verify result

**Expected Results:**
- [ ] `orderedAt` timestamp correct
- [ ] `enteredAt` timestamp correct
- [ ] `verifiedAt` timestamp correct
- [ ] All timestamps in correct timezone
- [ ] Timeline displays in Indonesian locale

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 7.3: User Attribution
**Steps:**
1. Check who created order
2. Check who entered result
3. Check who verified result

**Expected Results:**
- [ ] `orderedByUser` references correct doctor
- [ ] `enteredBy` shows correct lab tech name
- [ ] `verifiedBy` shows correct supervisor name
- [ ] User IDs correctly stored

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

### 8. TypeScript & Code Quality Testing 💻

#### Test Case 8.1: Type Safety
**Steps:**
1. Run `npx tsc --noEmit`
2. Check console for runtime errors

**Expected Results:**
- [ ] 0 TypeScript compilation errors
- [ ] No `any` types used without justification
- [ ] All API responses properly typed
- [ ] No type assertion abuse

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 8.2: Linting
**Steps:**
1. Run `npm run lint`

**Expected Results:**
- [ ] No ESLint errors
- [ ] Only acceptable warnings (if any)
- [ ] Code follows project conventions

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

#### Test Case 8.3: Browser Console
**Steps:**
1. Open DevTools console
2. Navigate through all lab pages
3. Perform all actions

**Expected Results:**
- [ ] No console errors (red)
- [ ] No console warnings (yellow) except acceptable ones
- [ ] No unhandled promise rejections
- [ ] No React key warnings

**Actual Results:**
- Status: ⏳ Pending
- Notes:

---

## Test Results Summary

### Passed Tests
- Count: 0 / 38
- Percentage: 0%

### Failed Tests
- Count: 0
- Critical: 0

### Blocked/Skipped Tests
- Count: 38
- Reason: Testing not yet started

---

## Known Issues & Bugs

### Critical Issues (P0)
_None found yet_

### High Priority Issues (P1)
_None found yet_

### Medium Priority Issues (P2)
_None found yet_

### Low Priority Issues (P3)
_None found yet_

---

## Test Environment Details

**Browser Tested:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

**Screen Resolutions Tested:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Database:**
- PostgreSQL version: 16

**Node.js:**
- Version: (check with `node -v`)

---

## Sign-off

**Tester:** _________________
**Date:** _________________
**Status:** ⏳ IN PROGRESS

---

## Next Steps After Testing

1. Fix all critical and high-priority bugs
2. Re-test failed test cases
3. Document any workarounds for known issues
4. Update progress to 100% when all tests pass
5. Proceed to Week 4 remaining features:
   - Result trend visualization
   - Result comparison view
   - Print/Download PDF reports
