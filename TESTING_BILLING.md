# Testing Guide: Cashier/Billing Module

## Prerequisites

Before testing, ensure you have:
1. ✅ Database running (`npm run db:dev` or `npm run db:up`)
2. ✅ Database schema pushed (`npm run db:push`)
3. ✅ Test data seeded (patients, visits, medical records, etc.)
4. ✅ Development server running (`npm run dev`)

## Step-by-Step Testing Guide

### Phase 1: Prepare Test Data

#### 1.1 Check Existing Data
```bash
# Open Drizzle Studio to view database
npm run db:studio
# Opens at http://localhost:4983
```

**What to check:**
- **Patients table**: At least 1-2 patients exist
- **Visits table**: At least 1 visit with status that allows billing
- **Medical Records**: At least 1 record with `isLocked = true`
- **Services table**: Has administration fee, consultation fee services
- **Drugs table**: Has some medications
- **Prescriptions table**: At least 1 prescription linked to a medical record

#### 1.2 Create Test Data Manually (if needed)

**Option A: Using Drizzle Studio**
1. Open `http://localhost:4983`
2. Navigate to each table
3. Click "Add Row" to create test data

**Option B: Using SQL Script** (I'll create this next)

---

### Phase 2: Test Billing Queue API

#### 2.1 Test Queue Endpoint
```bash
# Test the queue API directly
curl http://localhost:3000/api/billing/queue
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "visit": {
        "id": 1,
        "visitNumber": "V20250129001",
        "visitType": "outpatient",
        "status": "completed"
      },
      "patient": {
        "id": 1,
        "mrNumber": "MR000001",
        "name": "John Doe"
      },
      "billing": null,
      "medicalRecord": {
        "id": 1,
        "isLocked": true
      }
    }
  ]
}
```

**What to verify:**
- ✅ Returns visits with `isLocked = true`
- ✅ Only shows visits not fully paid
- ✅ Includes patient, visit, and medical record data

---

### Phase 3: Test Billing Calculation

#### 3.1 Calculate Billing for a Visit
```bash
# Replace {visitId} with actual visit ID from queue
curl -X POST http://localhost:3000/api/billing/{visitId}/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "discount": 0,
    "discountPercentage": 0,
    "insuranceCoverage": 0
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "billingId": 1
  }
}
```

#### 3.2 Verify Billing Details
```bash
# Get billing details
curl http://localhost:3000/api/billing/{visitId}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "billing": {
      "id": 1,
      "visitId": 1,
      "subtotal": "150000",
      "discount": "0",
      "totalAmount": "150000",
      "patientPayable": "150000",
      "paymentStatus": "pending"
    },
    "items": [
      {
        "itemType": "service",
        "itemName": "Biaya Administrasi",
        "quantity": 1,
        "unitPrice": "50000",
        "totalPrice": "50000"
      },
      {
        "itemType": "service",
        "itemName": "Konsultasi Dokter Umum",
        "quantity": 1,
        "unitPrice": "100000",
        "totalPrice": "100000"
      }
    ],
    "payments": []
  }
}
```

**What to verify:**
- ✅ Subtotal = sum of all items
- ✅ Items include: Administration fee, Consultation fee, Procedures, Medications
- ✅ Payment status is "pending"
- ✅ Patient payable = totalAmount (if no discount/insurance)

---

### Phase 4: Test Payment Processing

#### 4.1 Process Cash Payment
```bash
# Process payment with cash
curl -X POST http://localhost:3000/api/billing/{visitId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "paymentMethod": "cash",
    "amountReceived": 200000,
    "notes": "Test payment"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "paid",
    "paidAmount": 150000,
    "remainingAmount": 0,
    "changeGiven": 50000
  }
}
```

**What to verify:**
- ✅ Payment status changes to "paid"
- ✅ Change calculation is correct (200000 - 150000 = 50000)
- ✅ Remaining amount is 0

#### 4.2 Test Partial Payment
```bash
# Process partial payment
curl -X POST http://localhost:3000/api/billing/{visitId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "paymentMethod": "cash",
    "amountReceived": 50000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "partial",
    "paidAmount": 50000,
    "remainingAmount": 100000,
    "changeGiven": 0
  }
}
```

#### 4.3 Test Transfer Payment
```bash
# Process transfer payment
curl -X POST http://localhost:3000/api/billing/{visitId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "paymentMethod": "transfer",
    "paymentReference": "TRF123456789"
  }'
```

---

### Phase 5: Test Frontend (Cashier Dashboard)

#### 5.1 Access Cashier Dashboard
1. Navigate to `http://localhost:3000/dashboard/cashier`
2. You should see:
   - **Header**: "Kasir" with last refresh time
   - **Search Box**: Search by Visit ID
   - **Queue Table**: List of visits ready for billing

#### 5.2 Test Queue Display
**What to verify:**
- ✅ Queue shows visits with locked RME
- ✅ Displays: Visit Number, MR Number, Patient Name, Visit Type
- ✅ Shows Total Amount and Payment Status
- ✅ Auto-refreshes every 30 seconds (watch timestamp)
- ✅ Manual refresh button works

#### 5.3 Test Search Functionality
1. Enter a Visit ID in the search box
2. Click "Cari" button

**What to verify:**
- ✅ Shows billing details if visit exists
- ✅ Shows error if visit not found
- ✅ Loading state appears during search

#### 5.4 Test Visit Selection from Queue
1. Click "Pilih" button on any visit in the queue
2. Button should change to "Terpilih"
3. Billing details should appear below

**What to verify:**
- ✅ Patient information displays correctly
- ✅ Billing items list shows all cost components
- ✅ Payment history is visible (if any payments made)
- ✅ Sticky total box shows correct amounts on the right

#### 5.5 Test Calculate Billing
1. Select a visit that doesn't have billing yet
2. The system should automatically calculate billing
3. Or manually trigger calculation if needed

**What to verify:**
- ✅ All costs are aggregated:
  - Administration fee
  - Doctor consultation
  - Medical procedures (ICD-9)
  - Medications from prescriptions
- ✅ Subtotal is correct
- ✅ Total amount is calculated

#### 5.6 Test Discount and Insurance
**Note**: This requires UI components that may need to be added. For now, test via API.

#### 5.7 Test Payment Dialog
1. Click "Proses Pembayaran" button in sticky total box
2. Payment dialog should open

**What to verify in dialog:**
- ✅ Shows remaining amount to pay
- ✅ Payment method dropdown (Cash, Transfer, Debit, Credit)
- ✅ For cash: Amount received input field appears
- ✅ For transfer: Payment reference input appears
- ✅ Notes field available
- ✅ Change calculation for cash (if amount received > total)

#### 5.8 Process Payment via UI
1. Select payment method: **Cash**
2. Enter amount received: **200,000**
3. Remaining amount: **150,000**
4. Click "Proses Pembayaran"

**What to verify:**
- ✅ Change is calculated correctly (50,000)
- ✅ Payment is processed
- ✅ Dialog closes
- ✅ Billing details refresh automatically
- ✅ Payment status updates to "Lunas"
- ✅ Payment appears in payment history
- ✅ Visit removed from queue (if fully paid)

---

### Phase 6: Test Edge Cases

#### 6.1 Test Validation
- ✅ Try processing payment without selecting a visit
- ✅ Try processing payment with amount = 0
- ✅ Try cash payment without amount received
- ✅ Try searching with invalid visit ID

#### 6.2 Test Concurrent Updates
- ✅ Open cashier dashboard in two browser tabs
- ✅ Process payment in one tab
- ✅ Verify queue updates in second tab (within 30 seconds)

#### 6.3 Test Multiple Partial Payments
1. Process payment for 50,000
2. Verify status = "partial"
3. Process another payment for 50,000
4. Verify status = "partial"
5. Process final payment for remaining 50,000
6. Verify status = "paid"

---

### Phase 7: Test Integration Points

#### 7.1 Test with Medical Records
1. Create a new visit
2. Add medical record with SOAP notes
3. Lock the medical record
4. Verify visit appears in billing queue

#### 7.2 Test with Pharmacy
1. Add prescriptions to medical record
2. Verify medications appear in billing items
3. Verify medication costs are included in total

#### 7.3 Test with Procedures
1. Add procedures to medical record
2. Verify procedures appear in billing items
3. Verify procedure costs are included

---

## Common Issues and Solutions

### Issue 1: Queue is Empty
**Cause**: No visits with locked medical records
**Solution**:
1. Create a visit
2. Add medical record
3. Lock the medical record (`isLocked = true`)

### Issue 2: Billing Doesn't Calculate
**Cause**: Missing master data (services, drugs)
**Solution**:
1. Check services table has administration and consultation fees
2. Verify drugs table has medications
3. Ensure proper foreign key relationships

### Issue 3: Payment Fails
**Cause**: Authentication or validation error
**Solution**:
1. Ensure user is logged in
2. Check browser console for errors
3. Verify API returns proper error messages

### Issue 4: Auto-refresh Not Working
**Cause**: Hook configuration or React state issue
**Solution**:
1. Check browser console for errors
2. Verify `useBillingQueue` hook is called with `autoRefresh: true`
3. Check network tab to see if API calls are being made

---

## Performance Testing

### Test Auto-refresh Performance
1. Open Network tab in browser DevTools
2. Watch for API calls to `/api/billing/queue`
3. Verify calls happen every 30 seconds
4. Check response times are reasonable (<500ms)

### Test with Large Dataset
1. Create 50+ visits with locked medical records
2. Verify queue loads quickly
3. Verify pagination if implemented
4. Check table scrolling performance

---

## Testing Checklist

Use this checklist to track your testing progress:

- [ ] Database has test data
- [ ] Queue API returns visits
- [ ] Calculate billing API works
- [ ] Payment processing API works
- [ ] Queue displays in UI
- [ ] Search functionality works
- [ ] Visit selection works
- [ ] Billing details display correctly
- [ ] Payment dialog opens and closes
- [ ] Cash payment with change calculation works
- [ ] Transfer payment works
- [ ] Partial payment works
- [ ] Payment history displays
- [ ] Auto-refresh works (30 seconds)
- [ ] Manual refresh works
- [ ] Validation works (empty fields, invalid data)
- [ ] Multiple payments on same billing works
- [ ] Visit removed from queue after full payment
- [ ] Integration with medical records works
- [ ] Integration with pharmacy works
- [ ] Integration with procedures works

---

## Next Steps

After all tests pass:
1. ✅ Implement receipt generation (print functionality)
2. ✅ Add discount UI in payment dialog
3. ✅ Add insurance coverage UI
4. ✅ Implement receipt printing
5. ✅ Add export functionality (Excel, PDF)
6. ✅ Add reporting (daily sales, payment methods breakdown)

---

## Quick Test Script

Here's a quick script to test the complete flow:

```bash
# 1. Get queue
curl http://localhost:3000/api/billing/queue

# 2. Calculate billing for visit ID 1
curl -X POST http://localhost:3000/api/billing/1/calculate \
  -H "Content-Type: application/json" \
  -d '{"discount": 0, "discountPercentage": 0, "insuranceCoverage": 0}'

# 3. Get billing details
curl http://localhost:3000/api/billing/1

# 4. Process payment
curl -X POST http://localhost:3000/api/billing/1/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "paymentMethod": "cash",
    "amountReceived": 200000,
    "notes": "Test payment"
  }'

# 5. Verify billing is paid
curl http://localhost:3000/api/billing/1
```

Test via Browser (Recommended for First Time)

  1. Open Cashier Dashboard
    - Navigate to: http://localhost:3000/dashboard/cashier
    - You should see the billing queue interface
  2. Verify Queue Display
    - You should see at least 1 test visit in the queue
    - Check: Visit Number (V20250129999), Patient MR (MR999001), Name (Test Patient Billing)
    - Status should show "Belum Dihitung" (Not Calculated)
  3. Select Visit from Queue
    - Click the "Pilih" button on the test visit
    - The button changes to "Terpilih" (Selected)
    - Billing details should appear below
  4. Review Billing Items
    - You should see itemized costs:
        - ✅ Biaya Administrasi (Rp 50,000)
      - ✅ Konsultasi Dokter Umum (Rp 100,000)
      - ✅ Medications from prescriptions (2 items)
    - Check total amount is correct
  5. Process Payment
    - Click "Proses Pembayaran" button in the sticky total box (right side)
    - Payment dialog opens
    - Select payment method: Cash
    - Enter amount received (e.g., Rp 200,000)
    - System calculates change automatically
    - Click "Proses Pembayaran" to complete
  6. Verify Payment Success
    - ✅ Dialog closes
    - ✅ Payment status updates to "Lunas" (Paid)
    - ✅ Payment appears in payment history
    - ✅ Visit removed from queue (refresh to verify)

Happy Testing! 🎉
