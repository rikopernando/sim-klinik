# Laboratory Module - Quick Test Checklist

**Date:** 2025-01-09
**Tester:** **\*\***\_\_\_**\*\***
**Status:** ⏳ IN PROGRESS

---

## 🚀 Setup (Do Once)

- [x] Database is running
- [x] Dev server is running (`npm run dev`)
- [x] Lab tests are seeded
- [x] Test users exist (doctor, lab_technician, lab_supervisor)
- [x] Test patient with active visit exists

---

## ✅ Core Workflow Test (Happy Path)

### Step 1: Doctor Orders Lab Test

**Login as:** Doctor

- [x] Navigate to patient's medical record page
- [x] Find lab orders section
- [x] Click "Order Lab" or similar button
- [x] Select a test from catalog (e.g., "Complete Blood Count")
- [x] Set urgency (routine/urgent/stat)
- [x] Add clinical indication (optional)
- [x] Submit order
- [x] ✅ Success: Order created, toast notification appears
- [x] ✅ Success: Order appears in patient's lab orders list with status "ordered"

**Notes/Issues:**

```
1. Doctor Orders Lab Test nont appears on outpatient feature, doctor should able to order lab test on outpatient feature also not just in inpatient
2. formatDistanceToNow on LabOrdersList component not accurately, i think we have problem on timezone format. for example, I just ordered 1 minutes ago but on LabOrdersList display 8 hours ago
```

---

### Step 2: Lab Tech Views Order in Queue

**Login as:** Lab Technician

- [x] Check sidebar - "Antrian Laboratorium" menu item exists
- [x] Navigate to `/dashboard/laboratory/queue`
- [x] Queue page loads without errors
- [x] Check "Perlu Diproses" tab
- [x] ✅ Success: Previously created order appears in the table
- [x] ✅ Success: Patient name, test name, urgency visible
- [x] ✅ Success: Action buttons present (Update Status, View Detail)

**Notes/Issues:**

```
1. formatDistanceToNow on LabOrdersList component not accurately, i think we have problem on timezone format. for example, I just ordered 1 minutes ago but on LabOrdersList display 8 hours ago

```

---

### Step 3: Update Status to "Specimen Collected"

**Still logged in as:** Lab Technician

- [x] Click "Update Status" button on the order
- [x] Select "Specimen Collected" from dropdown/dialog
- [x] Confirm the action
- [x] ✅ Success: Status updates, toast notification appears
- [x] ✅ Success: Order still visible in "Perlu Diproses" tab (specimen_collected is actionable)

**Notes/Issues:**

```


```

---

### Step 4: Update Status to "In Progress"

**Still logged in as:** Lab Technician

- [x] Click "Update Status" again on the same order
- [x] Select "In Progress"
- [x] Confirm the action
- [x] ✅ Success: Status updates to "in_progress"
- [x] Switch to "Sedang Dikerjakan" tab
- [x] ✅ Success: Order appears in this tab

**Notes/Issues:**

```


```

---

### Step 5: Enter Lab Results

**Still logged in as:** Lab Technician

- [x] Click "Input Hasil" button on the in-progress order
- [x] Result entry dialog opens
- [x] Form shows test details, unit (if numeric), reference range (if numeric)
- [x] Enter result value (e.g., "120" for numeric test)
- [x] Optionally check "Nilai Kritis" checkbox
- [x] Add technician notes (optional)
- [x] Click "Simpan Hasil"
- [x] ✅ Success: Result saved, toast notification appears
- [x] ✅ Success: Order status updates to "completed"
- [x] Switch to "Selesai Hari Ini" tab
- [x] ✅ Success: Order appears in completed orders

**Notes/Issues:**

```
1. on ResultEntryDialog we just provide result template for numeric, for another result template like multi_parameter and descriptive
2. we have to make sure the result data is valid based on result template
```

---

### Step 6: Supervisor Verifies Result

**Login as:** Lab Supervisor

- [x] Navigate to `/dashboard/laboratory/queue`
- [x] Go to "Selesai Hari Ini" tab
- [x] Find the completed order from previous step
- [x] Click "Verify" button (or similar action)
- [x] Confirm verification
- [x] ✅ Success: Result is verified, toast notification appears
- [x] ✅ Success: Order status updates to "verified"
- [x] ✅ Success: Verified badge/indicator appears

**Notes/Issues:**

```
1.  "Verify" button not appears on "Selesai Hari Ini" tab
2. I just see "Lihat Detail" button

```

---

### Step 7: Doctor Views Verified Result

**Login as:** Doctor (same doctor who ordered)

- [x] Navigate back to patient's medical record page
- [x] Open lab orders section
- [x] Find the verified order
- [x] Click "Lihat Detail" button
- [x] Order detail dialog opens
- [x] ✅ Success: All order info displayed correctly
- [x] ✅ Success: Result value shown with unit
- [x] ✅ Success: Verification badge visible (green check or similar)
- [x] ✅ Success: Verifier name and timestamp displayed
- [x] ✅ Success: Timeline shows all status changes (Order → Collection → In Progress → Result Entered → Verified)
- [x] Close dialog

**Notes/Issues:**

```
1."Lihat Detail" button  not appears
2. Failed: Result value shown with unit
3. Failed: Verification badge visible (green check or similar)
4. Failed: Verifier name and timestamp displayed
5. Failed: Timeline shows all status changes (Order → Collection → In Progress → Result Entered → Verified)

```

---

## 🔐 RBAC Quick Check

### Test 1: Doctor Cannot Access Queue

**Login as:** Doctor

- [x] Check sidebar navigation
- [x] ✅ Success: "Antrian Laboratorium" is NOT visible in sidebar
- [x] Try to navigate directly to `/dashboard/laboratory/queue`
- [x] ✅ Success: Redirected to dashboard OR permission denied message

**Notes/Issues:**

```


```

---

### Test 2: Lab Tech Cannot Verify

**Login as:** Lab Technician

- [x] Navigate to queue page → "Selesai Hari Ini" tab
- [x] Find a completed order
- [x] ✅ Success: "Verify" button is NOT visible OR disabled
- [x] (Verification should only be available to lab_supervisor)

**Notes/Issues:**

```


```

---

## 🚨 Critical Value Alert Test

### Test: Critical Value Detection

**Login as:** Lab Technician

- [x] Enter a result for any order
- [x] **Check the "Nilai Kritis" checkbox** before submitting
- [x] Submit the result
- [x] ✅ Success: Warning toast appears: "Nilai kritis terdeteksi! Notifikasi telah dikirim ke dokter."
- [x] View the order detail as doctor
- [x] ✅ Success: Red alert banner displayed with warning icon
- [x] ✅ Success: Alert title: "Nilai Kritis"
- [x] ✅ Success: Alert description mentions urgent attention needed

**Notes/Issues:**

```


```

---

## 🔄 Auto-Refresh Test

### Test 1: Manual Refresh

**Login as:** Lab Technician

- [x] Navigate to queue page
- [x] Note current order count
- [x] Click "Refresh" button
- [x] ✅ Success: Page data refreshes (no full page reload)
- [x] ✅ Success: Tables update

**Notes/Issues:**

```


```

---

### Test 2: Auto-Refresh Toggle

**Login as:** Lab Technician

- [x] Navigate to queue page
- [x] Toggle "Auto-refresh (30s)" switch **ON**
- [x] Wait 30-40 seconds
- [x] ✅ Success: Page auto-refreshes (observe network activity in DevTools)
- [x] Toggle switch **OFF**
- [x] Wait 30-40 seconds
- [x] ✅ Success: No auto-refresh happens

**Notes/Issues:**

```


```

---

## 🎨 UI/UX Quick Check

### Queue Page Tabs

**Login as:** Lab Technician

- [x] Navigate to queue page
- [x] ✅ Success: 4 tabs visible (🎯 Perlu Diproses, 🚨 Urgent/STAT, ⏳ Sedang Dikerjakan, ✅ Selesai Hari Ini)
- [x] Click each tab
- [x] ✅ Success: Each tab shows appropriate orders
- [x] ✅ Success: Tab switching is smooth, no errors

**Notes/Issues:**

```


```

---

### Urgent/STAT Color Coding

**Login as:** Lab Technician

- [x] Navigate to queue page → "Urgent/STAT" tab
- [x] ✅ Success: STAT card has **red** background
- [x] ✅ Success: URGENT card has **orange** background
- [x] ✅ Success: Cards are visually distinct

**Notes/Issues:**

```


```

---

### Result Entry Form Validation

**Login as:** Lab Technician

- [ ] Try to open result entry dialog
- [ ] Leave "Nilai Hasil" empty
- [ ] Try to submit
- [ ] ✅ Success: Error message appears: "Nilai hasil harus diisi"
- [ ] ✅ Success: Form prevents submission
- [ ] Fill in the value
- [ ] ✅ Success: Form submits successfully

**Notes/Issues:**

```


```

---

## ⚠️ Edge Cases

### Empty State

**Login as:** Lab Technician

- [ ] Navigate to a queue tab with no orders (or clear all orders)
- [ ] ✅ Success: Shows "No orders found" or similar helpful message
- [ ] ✅ Success: Not a blank/broken UI

**Notes/Issues:**

```


```

---

### Invalid Data

**Login as:** Lab Technician

- [ ] Try entering **letters** in a numeric test result field
- [ ] ✅ Success: Validation error appears OR field only accepts numbers
- [ ] ✅ Success: No server error/crash

**Notes/Issues:**

```


```

---

## 💻 Code Quality Check

### TypeScript Compilation

**Run in terminal:**

```bash
npx tsc --noEmit
```

- [ ] ✅ Success: 0 TypeScript errors

**Errors Found:**

```


```

---

### ESLint

**Run in terminal:**

```bash
npm run lint
```

- [ ] ✅ Success: No critical ESLint errors
- [ ] Only acceptable warnings (if any)

**Errors Found:**

```


```

---

### Browser Console

**While testing all features above:**

- [ ] Open Chrome/Firefox DevTools → Console tab
- [ ] Navigate through all lab pages
- [ ] Perform all actions
- [ ] ✅ Success: **No red console errors**
- [ ] ✅ Success: No unhandled promise rejections
- [ ] ✅ Success: No React key warnings

**Errors Found:**

```


```

---

## 📊 Test Results Summary

**Total Checkboxes:** ~60+

**Completed:** **\_** / 60+

**Pass Rate:** **\_**%

**Critical Issues Found:** **\_**

**Status:**

- [ ] ✅ ALL TESTS PASSED - Ready for production
- [ ] ⚠️ MINOR ISSUES - Can proceed with caution
- [ ] ❌ CRITICAL ISSUES - Must fix before proceeding

---

## 🐛 Issues Found During Testing

### Issue 1

**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Description:**

```


```

**Steps to Reproduce:**

```


```

**Expected vs Actual:**

```


```

---

### Issue 2

**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Description:**

```


```

**Steps to Reproduce:**

```


```

**Expected vs Actual:**

```


```

---

### Issue 3

**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Description:**

```


```

**Steps to Reproduce:**

```


```

**Expected vs Actual:**

```


```

---

## ✍️ Sign-off

**Tester Name:** **\*\***\_\_\_**\*\***

**Date Completed:** **\*\***\_\_\_**\*\***

**Overall Status:**

- [ ] ✅ PASSED - Module is production-ready
- [ ] ⚠️ PASSED WITH ISSUES - Minor bugs documented
- [ ] ❌ FAILED - Critical bugs must be fixed

**Next Steps:**

```


```

---

## 📝 Notes

Use this space for any additional observations, suggestions, or comments:

```






```
