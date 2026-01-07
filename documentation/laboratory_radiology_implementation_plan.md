# Laboratory & Radiology Module - Implementation Plan

**Version**: 1.0
**Created**: 2025-01-07
**Status**: Phase 2 Priority - Ready for Implementation
**Phase**: Phase 2 (Ekspansi & Integrasi)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Module Overview](#module-overview)
3. [User Stories](#user-stories)
4. [Clinical Workflow](#clinical-workflow)
5. [Feature Requirements](#feature-requirements)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [UI/UX Design](#uiux-design)
9. [Component Structure](#component-structure)
10. [Integration Points](#integration-points)
11. [Technical Implementation](#technical-implementation)
12. [Master Data](#master-data)
13. [Notifications System](#notifications-system)
14. [Reports & Analytics](#reports--analytics)
15. [Security & Permissions](#security--permissions)
16. [Implementation Roadmap](#implementation-roadmap)
17. [Testing Scenarios](#testing-scenarios)
18. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The **Laboratory & Radiology Module (LIS/RIS)** is a critical component of Phase 2 that completes the clinical workflow by enabling digital ordering, tracking, and result management for diagnostic services. This module bridges the gap between clinical documentation (RME/CPPT) and diagnostic support services.

### Why This is Priority

1. **Completes Clinical Workflow**: Doctors currently document in CPPT but cannot order lab tests digitally
2. **Reduces Manual Work**: Eliminates paper-based lab requisitions and manual result entry
3. **Improves Patient Care**: Faster turnaround time for test results
4. **Foundation for Integrations**: Required for SatuSehat and BPJS integrations
5. **Revenue Tracking**: Accurate billing for lab/radiology services

### Key Benefits

- **For Doctors**: Order tests from RME/CPPT, receive instant notifications when results ready
- **For Lab Technicians**: Digital worklist, structured result entry, quality control
- **For Patients**: Faster results, reduced waiting time
- **For Management**: Better inventory tracking, revenue analytics, quality metrics

---

## Module Overview

### Scope

This module covers:
- ✅ Laboratory services (blood tests, urine tests, etc.)
- ✅ Radiology/Imaging services (X-Ray, USG, CT Scan, etc.)
- ✅ Digital order management
- ✅ Result entry and validation
- ✅ Real-time notifications
- ✅ Result viewing in RME/CPPT
- ✅ Master data management (test catalog)
- ✅ Billing integration

### Out of Scope (Future Phases)

- ❌ Direct machine integration (DICOM, HL7 feeds)
- ❌ Advanced image processing/PACS
- ❌ External lab integration
- ❌ Quality control workflows (reagent tracking)
- ❌ Pathology/Histopathology workflows

### Service Types

1. **Laboratory (LAB)**
   - Clinical Chemistry (e.g., Blood Glucose, Cholesterol)
   - Hematology (e.g., Complete Blood Count)
   - Immunology/Serology (e.g., HIV, Hepatitis)
   - Microbiology (e.g., Culture, Gram Stain)
   - Urinalysis
   - Others

2. **Radiology/Imaging (RAD)**
   - X-Ray (various positions)
   - Ultrasound (USG)
   - CT Scan
   - MRI (if applicable)
   - Others

---

## User Stories

### Doctor (Role: doctor)

**US-D1**: As a doctor, I want to order lab tests directly from the patient's CPPT/RME, so I don't need to write paper requisitions.

**US-D2**: As a doctor, I want to order multiple tests at once (e.g., "complete blood panel"), so I can save time.

**US-D3**: As a doctor, I want to receive a notification when lab results are ready, so I can review them immediately and adjust treatment.

**US-D4**: As a doctor, I want to view lab results directly in the patient's medical record, so I have all clinical data in one place.

**US-D5**: As a doctor, I want to see the patient's lab history/trends (e.g., HbA1c over time), so I can monitor disease progression.

**US-D6**: As a doctor, I want to mark abnormal results with flags (high/low), so I can quickly identify critical values.

**US-D7**: As a doctor, I want to add clinical notes when ordering tests (e.g., "suspected dengue"), so the lab technician has context.

### Lab Technician (Role: lab_technician)

**US-LT1**: As a lab technician, I want to see a worklist of pending lab orders sorted by priority/urgency, so I can prioritize critical tests.

**US-LT2**: As a lab technician, I want to mark an order as "specimen collected" when I receive the sample, so doctors know the test is in progress.

**US-LT3**: As a lab technician, I want to enter numeric results with units (e.g., "120 mg/dL"), so the system can automatically flag abnormal values.

**US-LT4**: As a lab technician, I want to upload PDF/image files for complex reports (e.g., ECG strips, microscopy images), so doctors can view detailed results.

**US-LT5**: As a lab technician, I want to mark results as "verified" before they're sent to doctors, so we maintain quality control.

**US-LT6**: As a lab technician, I want to add technician notes/comments to results (e.g., "hemolyzed sample"), so doctors are aware of limitations.

**US-LT7**: As a lab technician, I want to see the patient's previous lab results when entering new ones, so I can ensure consistency.

### Radiologist/Radiology Technician (Role: radiologist, radiology_technician)

**US-RT1**: As a radiologist, I want to see imaging orders with clinical indications, so I can tailor my examination and interpretation.

**US-RT2**: As a radiologist, I want to upload imaging files (JPEG/DICOM) and enter findings/impressions, so doctors have both images and interpretations.

**US-RT3**: As a radiologist, I want to mark critical findings (e.g., "fracture detected"), so doctors are alerted immediately.

### Nurse (Role: nurse)

**US-N1**: As a nurse, I want to see which patients have pending lab orders, so I can prepare them for specimen collection.

**US-N2**: As a nurse, I want to print lab requisition slips with barcodes/QR codes, so the lab can track samples accurately.

**US-N3**: As a nurse, I want to see which patients are waiting for imaging, so I can escort them to the radiology room.

### Cashier (Role: cashier)

**US-C1**: As a cashier, I want lab/radiology charges to automatically appear in the patient's bill, so I don't need to manually enter each test.

**US-C2**: As a cashier, I want to see if lab tests have been completed before final billing, so we don't charge for canceled tests.

### Admin/Management (Role: admin, super_admin)

**US-A1**: As an admin, I want to manage the master list of lab tests with prices, so we can update the catalog when needed.

**US-A2**: As an admin, I want to see reports on most-ordered tests and revenue by test type, so we can optimize inventory and pricing.

**US-A3**: As an admin, I want to track lab turnaround times (order to result), so we can identify bottlenecks.

---

## Clinical Workflow

### Laboratory Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ORDER (Doctor)                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Doctor opens patient RME/CPPT                                   │
│  → Clicks "Order Lab Tests"                                      │
│  → Selects tests from catalog (can select multiple)             │
│  → Adds clinical indication/notes (optional)                     │
│  → Sets urgency (routine, urgent, stat)                          │
│  → Submits order                                                 │
│  → System creates lab_orders record(s)                           │
│  → Status: "ordered"                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: SPECIMEN COLLECTION (Nurse/Lab Tech)                   │
│  ─────────────────────────────────────────────────────────────  │
│  Nurse/Lab tech views pending orders                             │
│  → Prints requisition slip (with barcode)                        │
│  → Collects specimen from patient                                │
│  → Updates order status to "specimen_collected"                  │
│  → Adds specimen collection time                                 │
│  → Sample sent to lab                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: ANALYSIS (Lab Technician)                              │
│  ─────────────────────────────────────────────────────────────  │
│  Lab tech sees order in worklist                                 │
│  → Performs test/analysis                                        │
│  → Updates status to "in_progress"                               │
│  → Enters results:                                               │
│     • Numeric values (e.g., Glucose: 120 mg/dL)                  │
│     • Text/descriptive (e.g., "No bacteria seen")                │
│     • Uploads files (PDF/images) if applicable                   │
│  → System auto-flags abnormal values                             │
│  → Adds technician notes if needed                               │
│  → Saves as draft                                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: VERIFICATION (Senior Lab Tech/Pathologist)             │
│  ─────────────────────────────────────────────────────────────  │
│  Senior tech/Pathologist reviews results                         │
│  → Checks for accuracy                                           │
│  → Verifies against quality controls                             │
│  → Marks as "verified"                                           │
│  → Status changes to "completed"                                 │
│  → Notification sent to ordering doctor                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: REVIEW (Doctor)                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Doctor receives notification                                    │
│  → Opens patient RME/CPPT                                        │
│  → Views lab results in dedicated section                        │
│  → Reviews values, flags, trends                                 │
│  → Interprets results in clinical context                        │
│  → Updates diagnosis/treatment plan                              │
│  → Documents in CPPT                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: BILLING (Automatic)                                    │
│  ─────────────────────────────────────────────────────────────  │
│  System automatically adds lab charges to billing                │
│  → Each completed test becomes a billing_item                    │
│  → Price pulled from lab_tests master data                       │
│  → Cashier sees charges in patient bill                          │
└─────────────────────────────────────────────────────────────────┘
```

### Radiology Workflow

Similar to lab workflow, with these differences:
- **Phase 2**: Patient scheduled for imaging appointment
- **Phase 3**: Imaging performed by radiology technician → Images captured
- **Phase 4**: Radiologist interprets images → Enters findings/impressions
- **Phase 5**: Doctor reviews images + radiologist report

---

## Feature Requirements

### Functional Requirements

#### FR-1: Lab/Radiology Ordering

**Must Have:**
- Doctor can order multiple tests in one request
- Support for test panels/profiles (e.g., "Lipid Panel" includes multiple tests)
- Urgency levels: Routine, Urgent, STAT (immediate)
- Clinical indication/notes field
- Patient visit context (outpatient/inpatient)
- Auto-calculation of total cost

**Nice to Have:**
- Favorite test lists per doctor
- Order templates (e.g., "Diabetes Workup")
- Contraindication warnings (e.g., "Patient pregnant - avoid X-ray")

#### FR-2: Worklist Management

**Must Have:**
- List of pending orders sorted by urgency/date
- Filter by: test type, urgency, department, patient
- Quick search by patient name/MR number
- Status indicators (ordered, specimen collected, in progress, completed)
- Batch processing capabilities

**Nice to Have:**
- Estimated turnaround time display
- Overdue order alerts
- Workload distribution (assign to specific technician)

#### FR-3: Result Entry

**Must Have:**
- Structured result entry for common tests (numeric, text, select options)
- Unit management (mg/dL, mmol/L, etc.)
- Reference range display (normal values)
- Automatic flagging (High/Low/Critical)
- File upload (PDF, JPEG, PNG) for reports/images
- Draft save capability
- Verification workflow (tech → supervisor)

**Nice to Have:**
- Delta check (compare with previous results)
- Quality control integration
- Voice-to-text for result entry
- Batch result entry for multiple samples

#### FR-4: Result Viewing

**Must Have:**
- Integrated view in patient RME/CPPT
- Chronological display (latest first)
- Flag indicators for abnormal values
- Downloadable/printable reports
- Image viewer for radiology
- Result comparison (current vs previous)

**Nice to Have:**
- Trend graphs (e.g., HbA1c over 6 months)
- Critical value alerts
- Result sharing (send to patient email)

#### FR-5: Master Data Management

**Must Have:**
- Lab test catalog (CRUD operations)
- Test categories/groups
- Pricing management
- Reference ranges by age/gender
- Active/inactive status
- Unit of measurement

**Nice to Have:**
- Test synonyms/aliases
- CPT/LOINC code mapping (for integrations)
- Test combinations (panels)

#### FR-6: Notifications

**Must Have:**
- Email notification to doctor when result ready
- In-app notification (dashboard badge)
- Critical value immediate alerts

**Nice to Have:**
- SMS notifications
- WhatsApp Business API integration
- Patient notifications (result ready)

---

## Database Schema

### Core Tables

#### 1. `lab_tests` (Master Data)

```sql
CREATE TABLE lab_tests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,           -- Internal code (e.g., "CBC", "HBA1C")
  name VARCHAR(255) NOT NULL,                 -- Display name (e.g., "Complete Blood Count")
  category VARCHAR(100) NOT NULL,             -- "Hematology", "Chemistry", "Microbiology", etc.
  department VARCHAR(50) NOT NULL,            -- "LAB" or "RAD"

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,

  -- Clinical info
  specimen_type VARCHAR(100),                 -- "Blood", "Urine", "Sputum", etc.
  specimen_volume VARCHAR(50),                -- "5 mL", "10 mL", etc.
  specimen_container VARCHAR(100),            -- "EDTA tube", "Plain tube", etc.

  -- Turnaround time
  tat_hours INTEGER DEFAULT 24,               -- Standard turnaround time in hours

  -- Integration codes (for future use)
  loinc_code VARCHAR(20),                     -- LOINC code for interoperability
  cpt_code VARCHAR(20),                       -- CPT code for billing

  -- Result structure (JSON)
  result_template JSONB,                      -- Define expected result fields
  -- Example: {"type": "numeric", "unit": "mg/dL", "reference_range": {"min": 70, "max": 100}}

  -- Metadata
  description TEXT,
  instructions TEXT,                          -- Patient preparation instructions
  is_active BOOLEAN DEFAULT true,
  requires_fasting BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_tests_category ON lab_tests(category);
CREATE INDEX idx_lab_tests_department ON lab_tests(department);
CREATE INDEX idx_lab_tests_active ON lab_tests(is_active);
```

#### 2. `lab_test_panels` (Test Combinations)

```sql
CREATE TABLE lab_test_panels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,                 -- "Lipid Panel", "Diabetes Panel", etc.
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,              -- Discounted panel price
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lab_test_panel_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id TEXT NOT NULL REFERENCES lab_test_panels(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL REFERENCES lab_tests(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(panel_id, test_id)
);
```

#### 3. `lab_orders` (Main Orders Table)

```sql
CREATE TABLE lab_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Visit & Patient context
  visit_id TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id),

  -- Test reference
  test_id TEXT REFERENCES lab_tests(id),
  panel_id TEXT REFERENCES lab_test_panels(id),
  -- Note: Either test_id OR panel_id should be filled, not both

  -- Order details
  order_number VARCHAR(50) UNIQUE,            -- Auto-generated: LAB-2025-0001
  urgency VARCHAR(20) DEFAULT 'routine',      -- "routine", "urgent", "stat"
  clinical_indication TEXT,                   -- Why this test was ordered

  -- Ordering info
  ordered_by TEXT NOT NULL REFERENCES user(id),
  ordered_at TIMESTAMP DEFAULT NOW(),

  -- Specimen info
  specimen_collected_by TEXT REFERENCES user(id),
  specimen_collected_at TIMESTAMP,
  specimen_notes TEXT,

  -- Processing info
  processed_by TEXT REFERENCES user(id),      -- Lab technician
  started_at TIMESTAMP,                       -- When analysis started

  -- Verification info
  verified_by TEXT REFERENCES user(id),       -- Supervisor/Pathologist
  verified_at TIMESTAMP,

  -- Completion info
  completed_at TIMESTAMP,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'ordered',
  -- Possible values:
  -- "ordered" → "specimen_collected" → "in_progress" → "completed" → "verified"
  -- Can also be: "cancelled", "rejected" (bad specimen)

  -- Financial
  price DECIMAL(10, 2) NOT NULL,              -- Snapshot of price at order time
  is_billed BOOLEAN DEFAULT false,
  billing_item_id TEXT REFERENCES billing_items(id),

  -- Metadata
  notes TEXT,                                 -- General notes
  cancelled_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_orders_visit ON lab_orders(visit_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_orders_urgency ON lab_orders(urgency);
CREATE INDEX idx_lab_orders_ordered_by ON lab_orders(ordered_by);
CREATE INDEX idx_lab_orders_ordered_at ON lab_orders(ordered_at);
```

#### 4. `lab_results` (Results Storage)

```sql
CREATE TABLE lab_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

  -- Result data (flexible structure)
  result_data JSONB NOT NULL,
  -- Example for numeric test:
  -- {
  --   "value": 120,
  --   "unit": "mg/dL",
  --   "reference_range": {"min": 70, "max": 100},
  --   "flag": "high",
  --   "interpretation": "Above normal range"
  -- }
  --
  -- Example for text/descriptive:
  -- {
  --   "findings": "No bacteria seen",
  --   "interpretation": "Negative for infection"
  -- }

  -- Attached files (for complex reports/images)
  attachment_url TEXT,                        -- Path to Supabase Storage or S3
  attachment_type VARCHAR(50),                -- "PDF", "JPEG", "PNG", "DICOM"

  -- Result metadata
  result_notes TEXT,                          -- Technician comments
  critical_value BOOLEAN DEFAULT false,       -- Requires immediate attention

  -- Quality control
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT REFERENCES user(id),
  verified_at TIMESTAMP,

  -- Timestamps
  entered_by TEXT NOT NULL REFERENCES user(id),
  entered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_results_order ON lab_results(order_id);
CREATE INDEX idx_lab_results_critical ON lab_results(critical_value);
```

#### 5. `lab_result_parameters` (For Multi-Parameter Tests)

For tests like CBC (Complete Blood Count) with multiple parameters:

```sql
CREATE TABLE lab_result_parameters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id TEXT NOT NULL REFERENCES lab_results(id) ON DELETE CASCADE,

  parameter_name VARCHAR(100) NOT NULL,       -- "WBC", "RBC", "Hemoglobin", etc.
  parameter_value TEXT NOT NULL,              -- "8.5", "4.2M", etc.
  unit VARCHAR(50),                           -- "10^3/uL", "g/dL", etc.

  reference_min DECIMAL(10, 2),
  reference_max DECIMAL(10, 2),
  flag VARCHAR(20),                           -- "normal", "high", "low", "critical_high", "critical_low"

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_result_params_result ON lab_result_parameters(result_id);
```

#### 6. `lab_notifications` (Notification Log)

```sql
CREATE TABLE lab_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,

  recipient_id TEXT NOT NULL REFERENCES user(id),
  notification_type VARCHAR(50) NOT NULL,     -- "result_ready", "critical_value", "order_cancelled"

  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  -- Delivery channels
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_app BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lab_notifications_recipient ON lab_notifications(recipient_id, is_read);
CREATE INDEX idx_lab_notifications_order ON lab_notifications(order_id);
```

### Database Relations Summary

```
visits ──┬─→ lab_orders ──→ lab_results ──→ lab_result_parameters
         │                      │
patients─┘                      └─→ attachment files (Supabase Storage)
                                │
user ────────────────────────────┴─→ (ordered_by, processed_by, verified_by)

lab_tests ──→ lab_orders
             └─→ lab_test_panels ──→ lab_test_panel_items

lab_orders ──→ billing_items (auto-created on completion)
           └─→ lab_notifications
```

---

## API Endpoints

### Lab Tests Management (Master Data)

#### GET /api/lab/tests
**Purpose**: Get list of all lab tests (catalog)

**Query Parameters**:
```typescript
{
  category?: string          // Filter by category
  department?: "LAB" | "RAD" // Filter by department
  search?: string            // Search by name/code
  is_active?: boolean        // Show only active tests
}
```

**Response**:
```typescript
{
  status: 200,
  message: "Lab tests fetched successfully",
  data: [
    {
      id: "uuid",
      code: "CBC",
      name: "Complete Blood Count",
      category: "Hematology",
      department: "LAB",
      price: "150000",
      specimen_type: "Blood",
      tat_hours: 2,
      requires_fasting: false,
      is_active: true
    }
  ]
}
```

**Permissions**: `lab:read`, `radiology:read`

#### POST /api/lab/tests
**Purpose**: Create new lab test (admin only)

**Request Body**:
```typescript
{
  code: "HBA1C",
  name: "Hemoglobin A1c",
  category: "Chemistry",
  department: "LAB",
  price: 200000,
  specimen_type: "Blood",
  tat_hours: 24,
  requires_fasting: true,
  result_template: {
    type: "numeric",
    unit: "%",
    reference_range: { min: 4.0, max: 5.6 }
  }
}
```

**Permissions**: `lab:admin`

#### PUT /api/lab/tests/[id]
**Purpose**: Update lab test

**Permissions**: `lab:admin`

---

### Lab Order Management

#### GET /api/lab/orders
**Purpose**: Get list of lab orders

**Query Parameters**:
```typescript
{
  visit_id?: string          // Filter by visit
  patient_id?: string        // Filter by patient
  status?: string            // Filter by status
  urgency?: string           // Filter by urgency
  department?: "LAB" | "RAD"
  date_from?: string         // Filter by order date
  date_to?: string
  ordered_by?: string        // Filter by doctor
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
{
  status: 200,
  data: [
    {
      id: "uuid",
      order_number: "LAB-2025-0001",
      visit_id: "uuid",
      patient: {
        id: "uuid",
        name: "John Doe",
        mr_number: "MR-12345"
      },
      test: {
        id: "uuid",
        code: "CBC",
        name: "Complete Blood Count",
        category: "Hematology"
      },
      urgency: "routine",
      status: "ordered",
      ordered_by: {
        id: "uuid",
        name: "Dr. Smith"
      },
      ordered_at: "2025-01-07T10:00:00Z",
      price: "150000"
    }
  ],
  pagination: {
    total: 100,
    limit: 20,
    offset: 0
  }
}
```

**Permissions**: `lab:read`, `radiology:read`

#### POST /api/lab/orders
**Purpose**: Create new lab order(s)

**Request Body**:
```typescript
{
  visit_id: "uuid",
  orders: [
    {
      test_id: "uuid",        // OR panel_id
      urgency: "routine",
      clinical_indication: "Suspected diabetes"
    },
    {
      test_id: "uuid-2",
      urgency: "urgent",
      clinical_indication: "Monitor infection"
    }
  ]
}
```

**Response**:
```typescript
{
  status: 201,
  message: "Lab orders created successfully",
  data: {
    order_ids: ["uuid-1", "uuid-2"],
    total_price: "300000"
  }
}
```

**Permissions**: `lab:write`, `radiology:write`

#### PATCH /api/lab/orders/[id]/status
**Purpose**: Update order status (specimen collected, in progress, etc.)

**Request Body**:
```typescript
{
  status: "specimen_collected",
  specimen_notes?: "Sample collected at 10:30 AM"
}
```

**Permissions**: `lab:write`, `radiology:write`

#### DELETE /api/lab/orders/[id]
**Purpose**: Cancel lab order (only if not yet processed)

**Permissions**: `lab:write`, `radiology:write`

---

### Lab Results Management

#### POST /api/lab/orders/[orderId]/results
**Purpose**: Enter lab result

**Request Body**:
```typescript
{
  result_data: {
    // For numeric test:
    value: 120,
    unit: "mg/dL",
    reference_range: { min: 70, max: 100 },
    flag: "high"

    // OR for multi-parameter test:
    parameters: [
      {
        name: "WBC",
        value: "8.5",
        unit: "10^3/uL",
        reference_min: 4.0,
        reference_max: 10.0,
        flag: "normal"
      },
      {
        name: "Hemoglobin",
        value: "12.5",
        unit: "g/dL",
        reference_min: 12.0,
        reference_max: 16.0,
        flag: "normal"
      }
    ]

    // OR for descriptive result:
    findings: "No bacteria seen",
    interpretation: "Negative for infection"
  },
  result_notes: "Sample quality good",
  critical_value: false,
  attachment?: File  // Upload PDF/image
}
```

**Response**:
```typescript
{
  status: 201,
  message: "Result entered successfully",
  data: {
    result_id: "uuid",
    order_id: "uuid",
    status: "completed"  // Order status auto-updated
  }
}
```

**Permissions**: `lab:write`, `radiology:write`

#### PUT /api/lab/results/[id]/verify
**Purpose**: Verify result (supervisor/pathologist)

**Request Body**:
```typescript
{
  is_verified: true,
  verification_notes?: "Results verified, quality control passed"
}
```

**Permissions**: `lab:verify`, `radiology:verify`

#### GET /api/lab/orders/[orderId]/results
**Purpose**: Get result for specific order

**Response**:
```typescript
{
  status: 200,
  data: {
    id: "uuid",
    order_id: "uuid",
    result_data: { /* ... */ },
    attachment_url: "https://...",
    is_verified: true,
    verified_by: {
      id: "uuid",
      name: "Senior Tech Name"
    },
    verified_at: "2025-01-07T14:00:00Z",
    entered_at: "2025-01-07T13:00:00Z"
  }
}
```

**Permissions**: `lab:read`, `radiology:read`

---

### Patient Results View

#### GET /api/patients/[patientId]/lab-results
**Purpose**: Get all lab results for a patient

**Query Parameters**:
```typescript
{
  visit_id?: string          // Filter by specific visit
  category?: string          // Filter by test category
  date_from?: string
  date_to?: string
  limit?: number
}
```

**Response**: Returns all completed lab results with trend data

**Permissions**: `medical_records:read`

---

## UI/UX Design

### 1. Lab Order Dialog (Doctor's View)

```
┌────────────────────────────────────────────────────────────┐
│  🧪 Order Lab Tests - Tn. Ahmad (MR-12345)           [✕]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [🔍 Search tests...]                                       │
│                                                             │
│  📋 Quick Panels                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Diabetes │ │  Lipid   │ │  Renal   │ │ Complete │     │
│  │  Panel   │ │  Panel   │ │  Panel   │ │  Checkup │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  🔬 Hematology                                              │
│  ☐ Complete Blood Count (CBC)          Rp 150.000          │
│  ☐ Differential Count                  Rp 50.000           │
│  ☐ ESR (Erythrocyte Sedimentation)     Rp 30.000           │
│                                                             │
│  🧪 Clinical Chemistry                                      │
│  ☑ Blood Glucose (Fasting)             Rp 25.000 ✓         │
│  ☑ HbA1c (Hemoglobin A1c)              Rp 200.000 ✓        │
│  ☐ Cholesterol Total                   Rp 35.000           │
│  ☐ Triglycerides                       Rp 35.000           │
│                                                             │
│  📸 Radiology/Imaging                                       │
│  ☐ Chest X-Ray (PA)                    Rp 100.000          │
│  ☐ Abdomen USG                         Rp 250.000          │
│                                                             │
│  ⚙️ Selected Tests (2)                                      │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ✓ Blood Glucose (Fasting)                 Rp 25.000   ││
│  │   Urgency: [Routine ▼]                                ││
│  │   Indication: Suspected diabetes mellitus             ││
│  ├────────────────────────────────────────────────────────┤│
│  │ ✓ HbA1c (Hemoglobin A1c)                  Rp 200.000  ││
│  │   Urgency: [Routine ▼]                                ││
│  │   Indication: Diabetes monitoring                     ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  💵 Total: Rp 225.000                                       │
│                                                             │
│  [Cancel]                             [Submit Orders (2)] │
└────────────────────────────────────────────────────────────┘
```

### 2. Lab Worklist (Lab Technician's View)

```
┌────────────────────────────────────────────────────────────────┐
│  🧪 Lab Worklist                                      [🔄 Refresh]│
├────────────────────────────────────────────────────────────────┤
│  [🔍 Search patient...]  [Category ▼]  [Status ▼]  [Date ▼]   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚨 URGENT ORDERS (2)                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🔴 LAB-2025-0015                        10:30 AM         │ │
│  │ Tn. Ahmad Surya (MR-12345)                               │ │
│  │ Complete Blood Count (CBC)                               │ │
│  │ Status: Specimen Collected                               │ │
│  │ [▶ Start Analysis]  [📋 View Details]                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 🟠 LAB-2025-0018                        11:00 AM         │ │
│  │ Ny. Siti (MR-12348)                                      │ │
│  │ Blood Glucose (Fasting)                                  │ │
│  │ Status: Ordered - Specimen Not Collected                │ │
│  │ [🩸 Collect Specimen]  [📋 View Details]                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  📋 ROUTINE ORDERS (8)                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ LAB-2025-0012                           09:00 AM         │ │
│  │ Tn. Budi (MR-12346)                                      │ │
│  │ Urinalysis                                               │ │
│  │ Status: In Progress                                      │ │
│  │ [✏️ Enter Results]  [📋 View Details]                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│  [... 7 more orders ...]                                       │
│                                                                 │
│  ✅ COMPLETED TODAY (15)                    [View All →]       │
└────────────────────────────────────────────────────────────────┘
```

### 3. Result Entry Form (Lab Technician)

```
┌────────────────────────────────────────────────────────────┐
│  ✏️ Enter Results - LAB-2025-0015                    [✕]   │
│  Patient: Tn. Ahmad Surya (MR-12345)                       │
│  Test: Complete Blood Count (CBC)                          │
│  Ordered by: Dr. Budi                                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Result Parameters                                       │
│                                                             │
│  WBC (White Blood Cell)                                     │
│  [8.5___] 10^3/uL     Ref: 4.0 - 10.0     Status: ✅ Normal │
│                                                             │
│  RBC (Red Blood Cell)                                       │
│  [4.8___] 10^6/uL     Ref: 4.5 - 5.5      Status: ✅ Normal │
│                                                             │
│  Hemoglobin                                                 │
│  [13.2__] g/dL        Ref: 13.0 - 17.0    Status: ✅ Normal │
│                                                             │
│  Hematocrit                                                 │
│  [40____] %           Ref: 40 - 50        Status: ✅ Normal │
│                                                             │
│  Platelet Count                                             │
│  [180___] 10^3/uL     Ref: 150 - 400      Status: 🟡 Low   │
│                                                             │
│  💬 Technician Notes                                        │
│  [Sample quality: Good. No hemolysis detected.___________] │
│                                                             │
│  📎 Attach File (Optional)                                  │
│  [📁 Choose File...]  No file selected                      │
│                                                             │
│  ⚠️ Mark as Critical Value?                                 │
│  ☐ This result requires immediate physician notification   │
│                                                             │
│  [Save as Draft]  [Cancel]        [Submit for Verification]│
└────────────────────────────────────────────────────────────┘
```

### 4. Result View in Patient RME (Doctor's View)

```
┌────────────────────────────────────────────────────────────┐
│  Patient Detail - Tn. Ahmad Surya (MR-12345)               │
│  [Overview] [Vitals] [CPPT] [🧪 Lab Results] [Medications] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  🧪 Laboratory Results                                      │
│                                                             │
│  📅 Today (2025-01-07)                                      │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ✅ Complete Blood Count (CBC)      10:30 AM    Verified││
│  │ Ordered by: Dr. Budi                                   ││
│  │                                                         ││
│  │ WBC:        8.5 10^3/uL     ✅ Normal                   ││
│  │ RBC:        4.8 10^6/uL     ✅ Normal                   ││
│  │ Hemoglobin: 13.2 g/dL       ✅ Normal                   ││
│  │ Hematocrit: 40%             ✅ Normal                   ││
│  │ Platelet:   180 10^3/uL     🟡 Low (Ref: 150-400)      ││
│  │                                                         ││
│  │ Technician: Tech A          Verified by: Pathologist B ││
│  │ Notes: Sample quality good. No hemolysis detected.     ││
│  │                                                         ││
│  │ [📊 View Trends]  [📄 Print Report]                     ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  📅 Yesterday (2025-01-06)                                  │
│  ┌────────────────────────────────────────────────────────┐│
│  │ ✅ Blood Glucose (Fasting)     08:00 AM    Verified    ││
│  │ Result: 145 mg/dL       🔴 High (Ref: 70-100)          ││
│  │ [View Details →]                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  📊 Result Trends                                           │
│  [Show Graph →]                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### Frontend File Organization

```
app/
└── dashboard/
    └── lab/
        ├── page.tsx                    # Lab worklist (technician view)
        ├── orders/
        │   └── page.tsx                # All orders list
        └── master-data/
            ├── tests/
            │   └── page.tsx            # Lab tests catalog management
            └── panels/
                └── page.tsx            # Test panels management

components/
└── lab/
    ├── order-lab-dialog.tsx           # Dialog for ordering lab tests
    ├── order-lab-form.tsx             # Multi-test selection form
    ├── lab-worklist.tsx               # Lab technician worklist
    ├── lab-order-card.tsx             # Individual order card
    ├── result-entry-dialog.tsx        # Result entry form
    ├── result-entry-form.tsx          # Form for entering results
    ├── result-parameter-input.tsx     # Input for single parameter
    ├── result-view-card.tsx           # Display lab results
    ├── result-trend-chart.tsx         # Trend visualization
    ├── lab-test-catalog.tsx           # Test catalog component
    └── lab-notification-badge.tsx     # Notification indicator

hooks/
└── lab/
    ├── use-lab-tests.ts               # Fetch lab tests catalog
    ├── use-lab-orders.ts              # Fetch lab orders
    ├── use-create-lab-order.ts        # Create order mutation
    ├── use-lab-results.ts             # Fetch results
    └── use-submit-result.ts           # Submit result mutation

lib/
└── services/
    └── lab.service.ts                 # API calls for lab module

types/
└── lab.ts                             # Lab-related type definitions
```

### Key Components

#### 1. OrderLabDialog Component

```tsx
// components/lab/order-lab-dialog.tsx

interface OrderLabDialogProps {
  visitId: string
  patientName: string
  onSuccess: () => void
}

export function OrderLabDialog({ visitId, patientName, onSuccess }: OrderLabDialogProps) {
  // Features:
  // - Search tests
  // - Quick panels
  // - Category tabs (Hematology, Chemistry, Radiology, etc.)
  // - Multi-select with checkboxes
  // - Per-test urgency and indication
  // - Running total
  // - Bulk submit
}
```

#### 2. LabWorklistPage Component

```tsx
// app/dashboard/lab/page.tsx

export default function LabWorklistPage() {
  // Features:
  // - Filter by status, urgency, category
  // - Search patients
  // - Grouped by urgency (STAT, Urgent, Routine)
  // - Quick actions (collect specimen, enter results, verify)
  // - Real-time updates
}
```

#### 3. ResultEntryDialog Component

```tsx
// components/lab/result-entry-dialog.tsx

interface ResultEntryDialogProps {
  orderId: string
  testInfo: LabTest
  onSuccess: () => void
}

export function ResultEntryDialog({ orderId, testInfo, onSuccess }: ResultEntryDialogProps) {
  // Features:
  // - Dynamic form based on test template
  // - Numeric inputs with auto-flagging
  // - Multi-parameter support
  // - File upload
  // - Draft save
  // - Verification workflow
}
```

#### 4. ResultViewCard Component

```tsx
// components/lab/result-view-card.tsx

interface ResultViewCardProps {
  result: LabResult
  showTrends?: boolean
}

export function ResultViewCard({ result, showTrends }: ResultViewCardProps) {
  // Features:
  // - Display parameters with flags
  // - Show reference ranges
  // - Color-coded values (normal, high, low)
  // - Download/print report
  // - View attached files
  // - Trend comparison
}
```

---

## Integration Points

### 1. Integration with RME/CPPT

**Location**: Patient detail page, CPPT dialog

**Features**:
- **Order Button**: Add "Order Lab Tests" button in CPPT dialog
- **Results Display**: Show lab results in dedicated tab
- **Auto-link**: Lab orders automatically linked to CPPT entry
- **Clinical Context**: Lab results visible when writing SOAP notes

**Example Integration**:
```tsx
// In components/inpatient/cppt-dialog.tsx

<Dialog>
  <DialogContent>
    {/* Existing SOAP form */}
    <SOAPForm />

    {/* Add Lab Ordering */}
    <div className="border-t pt-4">
      <h3>Supporting Investigations</h3>
      <OrderLabDialog visitId={visitId} patientName={patientName} />
    </div>
  </DialogContent>
</Dialog>
```

### 2. Integration with Billing

**Auto-billing Flow**:
1. Lab order created → Status: "ordered"
2. Result submitted and verified → Status: "completed"
3. **Trigger**: On status change to "completed"
4. **Action**: Create `billing_item` automatically
5. **Data**: Pull price from `lab_orders.price` (snapshot at order time)

**Implementation**:
```typescript
// In API endpoint: POST /api/lab/results/[id]/verify

await db.transaction(async (tx) => {
  // 1. Mark result as verified
  await tx.update(labResults)
    .set({ is_verified: true, verified_by: userId, verified_at: new Date() })
    .where(eq(labResults.id, resultId))

  // 2. Update order status to completed
  await tx.update(labOrders)
    .set({ status: 'completed', completed_at: new Date() })
    .where(eq(labOrders.id, orderId))

  // 3. Create billing item (if not already billed)
  const [order] = await tx.select().from(labOrders).where(eq(labOrders.id, orderId))

  if (!order.is_billed) {
    const [billingItem] = await tx.insert(billingItems).values({
      visitId: order.visit_id,
      itemType: 'lab_test',
      itemId: order.test_id,
      itemName: testName,
      quantity: 1,
      unitPrice: order.price,
      totalPrice: order.price
    }).returning()

    // Link billing item to lab order
    await tx.update(labOrders)
      .set({ is_billed: true, billing_item_id: billingItem.id })
      .where(eq(labOrders.id, orderId))
  }

  // 4. Send notification to doctor
  await sendLabResultNotification(order.ordered_by, orderId)
})
```

### 3. Integration with Inpatient Flow

**Inpatient-specific Features**:
- Lab orders visible in patient detail page
- Results shown in timeline alongside vitals and CPPT
- Urgent/STAT orders for critical patients
- Lab results influence discharge decisions

**UI Integration**:
```tsx
// In app/dashboard/inpatient/patients/[visitId]/page.tsx

<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="vitals">Vitals</TabsTrigger>
    <TabsTrigger value="cppt">CPPT</TabsTrigger>
    <TabsTrigger value="lab">Lab Results</TabsTrigger> {/* NEW */}
    <TabsTrigger value="medications">Medications</TabsTrigger>
  </TabsList>

  <TabsContent value="lab">
    <LabResultsSection visitId={visitId} />
  </TabsContent>
</Tabs>
```

### 4. Integration with Pharmacy

**Cross-reference**:
- Some tests require fasting → Pharmacy can see if patient needs to skip breakfast meds
- Drug monitoring (e.g., Digoxin levels) → Pharmacy can track therapeutic levels

---

## Technical Implementation

### Auto-generation of Order Numbers

```typescript
// lib/utils/lab.ts

export async function generateLabOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `LAB-${year}-`

  // Get the latest order number for this year
  const [lastOrder] = await db
    .select({ order_number: labOrders.orderNumber })
    .from(labOrders)
    .where(like(labOrders.orderNumber, `${prefix}%`))
    .orderBy(desc(labOrders.orderNumber))
    .limit(1)

  let nextNumber = 1

  if (lastOrder) {
    // Extract number from LAB-2025-0001 → 0001
    const lastNumber = parseInt(lastOrder.order_number.split('-')[2])
    nextNumber = lastNumber + 1
  }

  // Pad with zeros: 1 → "0001"
  const paddedNumber = nextNumber.toString().padStart(4, '0')

  return `${prefix}${paddedNumber}`
}
```

### Reference Range Flagging Logic

```typescript
// lib/utils/lab.ts

export function calculateFlag(
  value: number,
  referenceMin: number,
  referenceMax: number,
  criticalLowThreshold?: number,
  criticalHighThreshold?: number
): "normal" | "low" | "high" | "critical_low" | "critical_high" {
  if (criticalLowThreshold && value < criticalLowThreshold) {
    return "critical_low"
  }

  if (criticalHighThreshold && value > criticalHighThreshold) {
    return "critical_high"
  }

  if (value < referenceMin) {
    return "low"
  }

  if (value > referenceMax) {
    return "high"
  }

  return "normal"
}
```

### File Upload Handling

```typescript
// lib/services/lab.service.ts

export async function uploadLabResultFile(
  file: File,
  orderId: string
): Promise<string> {
  // Upload to Supabase Storage or local storage
  const fileName = `lab-results/${orderId}/${Date.now()}-${file.name}`

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('lab-attachments')
    .upload(fileName, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('lab-attachments')
    .getPublicUrl(fileName)

  return publicUrl
}
```

---

## Master Data

### Initial Lab Tests Catalog

```typescript
// scripts/seed-lab-tests.ts

const initialLabTests = [
  // Hematology
  {
    code: "CBC",
    name: "Complete Blood Count",
    category: "Hematology",
    department: "LAB",
    price: 150000,
    specimen_type: "Blood",
    specimen_volume: "3 mL",
    specimen_container: "EDTA tube (purple cap)",
    tat_hours: 2,
    requires_fasting: false,
    result_template: {
      type: "multi_parameter",
      parameters: [
        { name: "WBC", unit: "10^3/uL", reference_min: 4.0, reference_max: 10.0 },
        { name: "RBC", unit: "10^6/uL", reference_min: 4.5, reference_max: 5.5 },
        { name: "Hemoglobin", unit: "g/dL", reference_min: 13.0, reference_max: 17.0 },
        { name: "Hematocrit", unit: "%", reference_min: 40, reference_max: 50 },
        { name: "Platelet", unit: "10^3/uL", reference_min: 150, reference_max: 400 }
      ]
    }
  },

  // Clinical Chemistry
  {
    code: "FBS",
    name: "Blood Glucose (Fasting)",
    category: "Clinical Chemistry",
    department: "LAB",
    price: 25000,
    specimen_type: "Blood",
    specimen_volume: "2 mL",
    specimen_container: "Gray top tube (fluoride)",
    tat_hours: 1,
    requires_fasting: true,
    result_template: {
      type: "numeric",
      unit: "mg/dL",
      reference_min: 70,
      reference_max: 100,
      critical_low: 50,
      critical_high: 200
    }
  },

  {
    code: "HBA1C",
    name: "Hemoglobin A1c",
    category: "Clinical Chemistry",
    department: "LAB",
    price: 200000,
    specimen_type: "Blood",
    specimen_volume: "3 mL",
    specimen_container: "EDTA tube",
    tat_hours: 24,
    requires_fasting: false,
    result_template: {
      type: "numeric",
      unit: "%",
      reference_min: 4.0,
      reference_max: 5.6
    }
  },

  // Radiology
  {
    code: "XRAY-CHEST-PA",
    name: "Chest X-Ray (PA View)",
    category: "Radiology",
    department: "RAD",
    price: 100000,
    specimen_type: null,
    tat_hours: 4,
    requires_fasting: false,
    result_template: {
      type: "descriptive",
      fields: ["findings", "impression"]
    }
  },

  // Add more tests...
]
```

### Test Panels

```typescript
// Common test combinations with discounted pricing

const labPanels = [
  {
    code: "DIABETES-PANEL",
    name: "Diabetes Panel",
    description: "Comprehensive diabetes screening and monitoring",
    tests: ["FBS", "HBA1C", "CHOLESTEROL", "TRIGLYCERIDES"],
    regular_price: 320000,
    panel_price: 280000  // 12.5% discount
  },

  {
    code: "LIPID-PANEL",
    name: "Lipid Panel",
    description: "Cardiovascular risk assessment",
    tests: ["CHOLESTEROL", "HDL", "LDL", "TRIGLYCERIDES"],
    regular_price: 150000,
    panel_price: 120000
  },

  {
    code: "BASIC-CHECKUP",
    name: "Basic Health Checkup",
    description: "Routine health screening",
    tests: ["CBC", "FBS", "URINALYSIS", "XRAY-CHEST-PA"],
    regular_price: 305000,
    panel_price: 250000
  }
]
```

---

## Notifications System

### Notification Triggers

1. **Result Ready**: When lab result is verified
2. **Critical Value**: When result is marked as critical
3. **Order Cancelled**: When order is cancelled
4. **Specimen Rejected**: When specimen quality is poor

### Implementation

```typescript
// lib/services/notifications.service.ts

export async function sendLabResultNotification(
  doctorId: string,
  orderId: string,
  isCritical: boolean = false
) {
  const [order] = await db
    .select()
    .from(labOrders)
    .where(eq(labOrders.id, orderId))

  const notificationMessage = isCritical
    ? `🚨 CRITICAL lab result ready for ${order.patientName}`
    : `✅ Lab result ready for ${order.patientName}`

  // Create in-app notification
  await db.insert(labNotifications).values({
    order_id: orderId,
    recipient_id: doctorId,
    notification_type: isCritical ? 'critical_value' : 'result_ready',
    message: notificationMessage,
    sent_via_app: true
  })

  // Send email (optional)
  if (isCritical) {
    await sendEmail({
      to: doctorEmail,
      subject: "URGENT: Critical Lab Result",
      body: notificationMessage
    })
  }
}
```

---

## Reports & Analytics

### Dashboard Metrics

**For Management/Admin:**

1. **Daily Lab Statistics**
   - Total orders today
   - Completed vs pending
   - Average turnaround time
   - Revenue from lab services

2. **Most Ordered Tests** (Top 10)
   - Test name
   - Order count
   - Total revenue

3. **Performance Metrics**
   - Average TAT by test category
   - On-time completion rate
   - Critical value response time

4. **Workload Distribution**
   - Orders by technician
   - Peak hours analysis

### Sample Query

```typescript
// Get lab statistics for dashboard

export async function getLabStatistics(dateFrom: Date, dateTo: Date) {
  const stats = await db
    .select({
      total_orders: sql<number>`count(*)`,
      completed_orders: sql<number>`count(*) filter (where status = 'completed')`,
      pending_orders: sql<number>`count(*) filter (where status != 'completed' and status != 'cancelled')`,
      total_revenue: sql<number>`sum(price) filter (where status = 'completed')`,
      avg_tat_hours: sql<number>`avg(extract(epoch from (completed_at - ordered_at)) / 3600) filter (where completed_at is not null)`
    })
    .from(labOrders)
    .where(
      and(
        gte(labOrders.ordered_at, dateFrom),
        lte(labOrders.ordered_at, dateTo)
      )
    )

  return stats[0]
}
```

---

## Security & Permissions

### Role-Based Permissions

```typescript
// lib/rbac/permissions.ts

export const LAB_PERMISSIONS = {
  // Lab tests catalog management
  'lab:admin': ['super_admin', 'admin'],

  // Ordering lab tests
  'lab:write': ['doctor', 'nurse'],
  'radiology:write': ['doctor'],

  // Viewing orders/results
  'lab:read': ['doctor', 'nurse', 'lab_technician', 'admin'],
  'radiology:read': ['doctor', 'radiologist', 'radiology_technician', 'admin'],

  // Entering results
  'lab:enter_results': ['lab_technician'],
  'radiology:enter_results': ['radiologist', 'radiology_technician'],

  // Verifying results
  'lab:verify': ['lab_supervisor', 'pathologist'],
  'radiology:verify': ['radiologist'],

  // Billing
  'lab:billing': ['cashier', 'admin']
}
```

### Data Privacy

1. **Patient Consent**: Results only viewable by treating doctors and authorized personnel
2. **Audit Logging**: Track who viewed/modified results
3. **Secure Storage**: Encrypted file storage for attachments
4. **Access Control**: Role-based restrictions on sensitive results (HIV, etc.)

---

## Implementation Roadmap

### Week 1: Foundation & Database

**Tasks:**
- [ ] Create database schema (all tables)
- [ ] Write database migrations
- [ ] Create seed data for initial lab tests
- [ ] Set up file storage for attachments
- [ ] Create API endpoint structure

**Deliverables:**
- ✅ Database tables created
- ✅ Seed script with 20+ common lab tests
- ✅ File upload infrastructure ready

### Week 2: Order Management

**Tasks:**
- [ ] Build lab test catalog API
- [ ] Create order lab dialog component
- [ ] Implement multi-test selection UI
- [ ] Build order creation API
- [ ] Integrate with RME/CPPT
- [ ] Add to inpatient patient detail page

**Deliverables:**
- ✅ Doctors can order lab tests from CPPT
- ✅ Orders saved to database
- ✅ Auto-billing integration working

### Week 3: Lab Worklist & Result Entry

**Tasks:**
- [ ] Build lab worklist page
- [ ] Create result entry dialog
- [ ] Implement dynamic form based on test template
- [ ] Add file upload for attachments
- [ ] Build verification workflow
- [ ] Implement notification system

**Deliverables:**
- ✅ Lab technicians can view worklist
- ✅ Technicians can enter results
- ✅ Supervisors can verify results
- ✅ Doctors receive notifications

### Week 4: Result Viewing & Polish

**Tasks:**
- [ ] Build result view component
- [ ] Add result history/trends
- [ ] Create result comparison view
- [ ] Implement print/download functionality
- [ ] Add critical value alerts
- [ ] Build lab statistics dashboard
- [ ] Testing and bug fixes

**Deliverables:**
- ✅ Doctors can view results in RME
- ✅ Trend visualization working
- ✅ Critical value alerts functional
- ✅ Complete end-to-end workflow tested

---

## Testing Scenarios

### Test Case 1: Complete Lab Order Flow (Happy Path)

**Given**: Doctor viewing inpatient patient
**When**: Doctor orders CBC test
**Then**:
1. Order dialog opens with test catalog
2. Doctor selects CBC, adds indication
3. Order submitted successfully
4. Order appears in lab worklist
5. Lab tech collects specimen
6. Lab tech enters results
7. Supervisor verifies results
8. Doctor receives notification
9. Results visible in patient RME
10. Billing item auto-created

### Test Case 2: Critical Value Alert

**Given**: Lab tech entering glucose result
**When**: Value entered is 250 mg/dL (critical high)
**Then**:
1. System automatically flags as critical
2. Immediate notification sent to doctor
3. Alert badge appears in doctor's dashboard
4. Result highlighted in red when viewed

### Test Case 3: Multi-Panel Order

**Given**: Doctor wants comprehensive diabetes workup
**When**: Doctor selects "Diabetes Panel"
**Then**:
1. Panel expands to show included tests (FBS, HbA1c, Lipids)
2. Discounted price displayed
3. One order created per test
4. All orders linked to same CPPT entry

### Test Case 4: Specimen Rejection

**Given**: Lab tech receives hemolyzed blood sample
**When**: Lab tech marks specimen as rejected
**Then**:
1. Order status changes to "rejected"
2. Notification sent to ordering doctor
3. Doctor can re-order or cancel
4. No billing item created

### Test Case 5: Result Comparison

**Given**: Patient has previous HbA1c result (7.5%)
**When**: New HbA1c result entered (6.2%)
**Then**:
1. System shows both values side-by-side
2. Trend arrow indicates improvement
3. Percentage change calculated
4. Timeline graph updated

---

## Future Enhancements

### Phase 3 (Advanced Features)

1. **Machine Integration**
   - Direct interface with lab analyzers (HL7 feeds)
   - Automatic result import (no manual entry)
   - DICOM integration for radiology

2. **External Lab Integration**
   - Send complex tests to reference labs
   - Track external orders
   - Import results from partner labs

3. **Quality Control Module**
   - Daily QC tracking
   - Reagent inventory management
   - Calibration schedules
   - Equipment maintenance logs

4. **Advanced Analytics**
   - Predictive modeling (test utilization)
   - Anomaly detection (unusual results)
   - Cost optimization recommendations

5. **Patient Portal Integration**
   - Patients can view their own lab results
   - Download reports as PDF
   - Receive results via email/SMS

6. **Mobile App**
   - Lab technician mobile app
   - Barcode scanning for specimen tracking
   - Offline result entry with sync

---

## Appendix

### Common Lab Test Reference

| Test Name | Code | Category | TAT | Fasting Required |
|-----------|------|----------|-----|------------------|
| Complete Blood Count | CBC | Hematology | 2h | No |
| Blood Glucose (Fasting) | FBS | Chemistry | 1h | Yes |
| HbA1c | HBA1C | Chemistry | 24h | No |
| Cholesterol Total | CHOL | Chemistry | 2h | Yes |
| HDL Cholesterol | HDL | Chemistry | 2h | Yes |
| LDL Cholesterol | LDL | Chemistry | 2h | Yes |
| Triglycerides | TRIG | Chemistry | 2h | Yes |
| Uric Acid | URIC | Chemistry | 2h | No |
| Creatinine | CREAT | Chemistry | 2h | No |
| SGOT/AST | SGOT | Chemistry | 2h | No |
| SGPT/ALT | SGPT | Chemistry | 2h | No |
| Urinalysis | URIN | Urinalysis | 1h | No |
| HIV Screening | HIV | Immunology | 24h | No |
| Hepatitis B Surface Antigen | HBSAG | Immunology | 24h | No |
| Chest X-Ray (PA) | XRAY-CHEST | Radiology | 4h | No |
| Abdomen USG | USG-ABD | Radiology | 4h | No |

### Abbreviations

- **CBC**: Complete Blood Count
- **FBS**: Fasting Blood Sugar
- **HbA1c**: Hemoglobin A1c
- **TAT**: Turnaround Time
- **STAT**: Immediate/Urgent
- **QC**: Quality Control
- **LIS**: Laboratory Information System
- **RIS**: Radiology Information System
- **HL7**: Health Level 7 (data exchange standard)
- **LOINC**: Logical Observation Identifiers Names and Codes
- **CPT**: Current Procedural Terminology
- **DICOM**: Digital Imaging and Communications in Medicine

---

**End of Document**

---

**Document Approval:**
- [ ] Technical Lead Review
- [ ] Product Owner Approval
- [ ] Development Team Acknowledgment

**Next Steps:**
1. Review and approve this implementation plan
2. Set up project board/tickets based on roadmap
3. Begin Week 1 implementation (Database & Foundation)
