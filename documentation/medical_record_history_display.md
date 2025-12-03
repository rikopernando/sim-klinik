# Medical Record History Display (D.6)

**Tampilan Riwayat RME Pasien dalam Pop-up**

This document describes the medical record history feature that allows doctors to view a patient's complete medical history in a popup dialog while creating new medical records.

---

## Overview

**Task:** D.6 - Display patient's previous medical record history in popup
**Implementation Date:** 2025-11-19
**Status:** ✅ Completed
**Priority:** Medium

The medical record history feature provides doctors with quick access to a patient's complete medical history, including previous SOAP notes, diagnoses, procedures, and prescriptions, helping them make informed clinical decisions.

---

## Implementation Details

### Backend API

#### Medical Record History Endpoint (`/app/api/medical-records/history/route.ts`)

**Route:** `/api/medical-records/history?patientId=X`
**Method:** `GET`
**Permission Required:** `medical_records:read`
**RBAC Protected:** ✅ Yes

**Query Parameters:**

```
patientId: number (required) - The patient ID to fetch history for
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "patient": {
      "id": 123,
      "mrNumber": "MR20251119001",
      "name": "John Doe",
      "nik": "1234567890123456",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "allergies": "Penisilin, Aspirin"
    },
    "history": [
      {
        "medicalRecord": {
          "id": 456,
          "visitId": 789,
          "doctorId": "user_abc123",
          "soapSubjective": "Patient complains of headache",
          "soapObjective": "BP: 120/80, Temp: 36.5C",
          "soapAssessment": "Tension headache",
          "soapPlan": "Rest, hydration, paracetamol",
          "isLocked": true,
          "createdAt": "2025-11-10T10:30:00.000Z"
        },
        "visit": {
          "id": 789,
          "visitNumber": "V20251110001",
          "visitType": "outpatient",
          "status": "completed"
        },
        "diagnoses": [
          {
            "id": 1,
            "icd10Code": "R51",
            "description": "Headache",
            "isPrimary": true
          }
        ],
        "procedures": [
          {
            "id": 1,
            "icd9Code": "89.03",
            "description": "Physical examination"
          }
        ],
        "prescriptions": [
          {
            "prescription": {
              "id": 1,
              "dosage": "500mg",
              "frequency": "3x daily",
              "duration": "5 days",
              "quantity": 15,
              "isFulfilled": true
            },
            "drug": {
              "id": 1,
              "name": "Paracetamol",
              "unit": "tablet"
            }
          }
        ]
      }
    ],
    "totalRecords": 5
  }
}
```

**Error Responses:**

```json
// Missing patientId
{
  "error": "patientId parameter is required"
}

// Patient not found
{
  "error": "Patient not found"
}

// Server error
{
  "error": "Failed to fetch medical record history"
}
```

**Key Features:**

- ✅ Fetches all medical records for a patient
- ✅ Includes complete visit information
- ✅ Loads all related diagnoses
- ✅ Loads all related procedures
- ✅ Loads all related prescriptions with drug information
- ✅ Orders records by creation date (newest first)
- ✅ Returns patient allergies for safety alerts
- ✅ RBAC-protected endpoint

---

### Frontend Component

#### Medical Record History Dialog (`/components/medical-records/medical-record-history-dialog.tsx`)

**Purpose:** Popup dialog to display patient's complete medical history

**Features:**

- ✅ Auto-fetch history when dialog opens
- ✅ Loading state with spinner
- ✅ Error handling with clear messages
- ✅ Allergy alert banner (highlighted in yellow)
- ✅ Chronological list of visits (newest first)
- ✅ Tabbed interface for each record (SOAP, Diagnosis, Procedures, Prescriptions)
- ✅ Visit counter and metadata display
- ✅ Locked status indicator
- ✅ Responsive design with scroll area
- ✅ Empty state handling
- ✅ Date formatting in Indonesian locale

**Props:**

```typescript
interface MedicalRecordHistoryDialogProps {
  open: boolean // Dialog open state
  onOpenChange: (open: boolean) => void // Handle dialog close
  patientId: number // Patient ID to fetch history
  patientName?: string // Optional patient name for display
}
```

**Usage Example:**

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { MedicalRecordHistoryDialog } from "@/components/medical-records/medical-record-history-dialog";

export function MedicalRecordPage({ visit, patient }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div>
      {/* History Button */}
      <Button
        variant="outline"
        onClick={() => setShowHistory(true)}
      >
        <History className="h-4 w-4 mr-2" />
        Lihat Riwayat RME
      </Button>

      {/* History Dialog */}
      <MedicalRecordHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        patientId={patient.id}
        patientName={patient.name}
      />
    </div>
  );
}
```

**Component Structure:**

1. **Header Section:**
   - Title with history icon
   - Patient name and MR number

2. **Allergy Alert (if present):**
   - Yellow banner with warning icon
   - Displays patient allergies

3. **Medical Records List:**
   - Each record in a separate card
   - Visit counter (e.g., "Kunjungan #3")
   - Date and time of visit
   - Visit number badge
   - Locked status badge

4. **Tabbed Data Display (per record):**
   - **SOAP Tab:** S, O, A, P notes
   - **Diagnosis Tab:** List of diagnoses with ICD-10 codes
   - **Procedures Tab:** List of procedures with ICD-9 codes
   - **Prescriptions Tab:** Medications with dosage, frequency, fulfillment status

5. **Footer:**
   - Close button

---

## Integration Guide

### Where to Add the History Button

The history dialog can be integrated into medical record pages:

#### 1. Medical Record Form Header

```typescript
// In medical record creation/edit page
<div className="flex justify-between items-center mb-6">
  <h1>Rekam Medis Elektronik</h1>
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => setShowHistory(true)}
    >
      <History className="h-4 w-4 mr-2" />
      Riwayat Pasien
    </Button>
    <Button onClick={handleSave}>
      Simpan
    </Button>
  </div>
</div>

<MedicalRecordHistoryDialog
  open={showHistory}
  onOpenChange={setShowHistory}
  patientId={visit.patientId}
  patientName={patient.name}
/>
```

#### 2. SOAP Notes Tab

```typescript
// In the SOAP tab of medical record form
<Tabs defaultValue="soap">
  <TabsList>
    <TabsTrigger value="soap">SOAP</TabsTrigger>
    <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
    <TabsTrigger value="prescription">Resep</TabsTrigger>
    <TabsTrigger value="procedures">Tindakan</TabsTrigger>
  </TabsList>

  <div className="flex justify-end mb-4">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowHistory(true)}
    >
      <History className="h-4 w-4 mr-2" />
      Lihat Riwayat
    </Button>
  </div>

  <TabsContent value="soap">
    {/* SOAP form fields */}
  </TabsContent>
</Tabs>
```

#### 3. Patient Info Panel

```typescript
// In patient information panel
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <CardTitle>Informasi Pasien</CardTitle>
      <Button
        variant="link"
        size="sm"
        onClick={() => setShowHistory(true)}
      >
        <History className="h-3 w-3 mr-1" />
        Riwayat
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    {/* Patient details */}
  </CardContent>
</Card>
```

---

## User Experience

### Doctor's Workflow

1. **Open Medical Record Form**
   - Doctor starts creating new medical record
   - Sees patient information

2. **Review History**
   - Clicks "Lihat Riwayat RME" button
   - Dialog opens showing complete history

3. **Browse Previous Records**
   - Sees chronological list of visits
   - Views allergy alerts (if any)
   - Clicks through SOAP/Diagnosis/Procedures/Prescriptions tabs

4. **Make Informed Decisions**
   - Reviews previous diagnoses
   - Checks medication history
   - Notes recurring issues
   - Identifies contraindications

5. **Continue with Current Record**
   - Closes history dialog
   - Creates new medical record with context

---

## Benefits

### Clinical Decision Support

- ✅ Quick access to patient's medical history
- ✅ Review previous diagnoses and treatments
- ✅ Identify patterns and trends
- ✅ Avoid medication conflicts
- ✅ Ensure continuity of care

### Safety

- ✅ Prominent allergy alerts
- ✅ Complete medication history
- ✅ Previous adverse reactions visible
- ✅ Contraindication checking

### User Experience

- ✅ No need to navigate away from current page
- ✅ Popup interface keeps context
- ✅ Organized tabbed display
- ✅ Fast loading with optimized queries
- ✅ Clear empty states

### Data Organization

- ✅ Chronological order (newest first)
- ✅ Grouped by visit
- ✅ Categorized data (SOAP, Dx, Proc, Rx)
- ✅ Visit metadata (date, number, status)

---

## Security & Privacy

### RBAC Protection

**Permission Required:** `medical_records:read`

**Roles with Access:**

- Doctor
- Nurse
- Admin
- Medical staff with appropriate permissions

### Data Access

- Only shows medical records for the specified patient
- RBAC middleware validates permissions
- Authenticated session required
- No unauthorized access to sensitive data

### Audit Trail

- API calls logged server-side
- Patient data access traceable
- Complies with medical record regulations

---

## Technical Details

### Performance Optimizations

1. **Lazy Loading:**
   - History only fetched when dialog opens
   - Not loaded on page load

2. **Efficient Queries:**
   - Single query for patient data
   - Single query for medical records list
   - Parallel queries for related data (diagnoses, procedures, prescriptions)

3. **Data Caching:**
   - History cached during dialog session
   - Re-fetched on dialog re-open

### Error Handling

- Network errors caught and displayed
- Missing data handled gracefully
- Empty states for no history
- Loading states for async operations

### UI Components Used

- `Dialog` - Modal container
- `ScrollArea` - Scrollable content
- `Tabs` - Organized data display
- `Card` - Record containers
- `Badge` - Status indicators
- `Button` - Actions
- Lucide icons - Visual elements

---

## Testing

### Manual Testing Checklist

- [x] **Open History Dialog**
  - Click history button
  - Dialog opens
  - Loading spinner appears

- [x] **Patient with History**
  - Dialog loads records
  - Records displayed chronologically
  - All tabs accessible
  - Data displays correctly

- [x] **Patient with Allergies**
  - Yellow alert banner shows
  - Allergies text displayed
  - Banner prominent at top

- [x] **Patient without History**
  - Empty state shows
  - Message: "Belum ada riwayat"
  - Icon displayed

- [x] **SOAP Tab**
  - S, O, A, P sections visible
  - Text formatted correctly
  - Empty SOAP handled

- [x] **Diagnosis Tab**
  - Diagnoses listed
  - ICD-10 codes shown
  - Primary diagnosis marked

- [x] **Procedures Tab**
  - Procedures listed
  - ICD-9 codes shown

- [x] **Prescriptions Tab**
  - Medications listed
  - Dosage, frequency shown
  - Fulfillment status badge
  - Drug names displayed

- [x] **Multiple Records**
  - All records load
  - Scrollable if many records
  - Visit counter accurate

- [x] **Permission Check**
  - Without `medical_records:read` permission
  - Verify 403 error

- [x] **Error Handling**
  - Invalid patient ID
  - Network error
  - Error message displayed

---

## Future Enhancements

### Advanced Features

1. **Search and Filter:**
   - Search within history
   - Filter by date range
   - Filter by diagnosis type
   - Filter by medication

2. **Timeline View:**
   - Visual timeline of events
   - Key milestones highlighted
   - Graphical representation

3. **Summary Statistics:**
   - Total visits count
   - Most common diagnoses
   - Medication adherence
   - Visit frequency

4. **Print/Export:**
   - Print medical history
   - Export to PDF
   - Share with patient
   - Transfer to other facilities

5. **Comparison View:**
   - Compare two visits
   - Highlight changes
   - Track progression

6. **Quick Reference:**
   - Sticky note for key info
   - Favorite/pin important records
   - Quick access shortcuts

### Data Enrichment

1. **Lab Results:**
   - Integrate laboratory data
   - Show trends over time
   - Reference ranges

2. **Vital Signs:**
   - Historical vital signs
   - Graphical charts
   - Trend analysis

3. **Images:**
   - Radiology images
   - Clinical photos
   - Scan results

---

## Troubleshooting

### Common Issues

**Problem:** History not loading
**Solutions:**

- Check patient ID is valid
- Verify network connection
- Check browser console for errors
- Ensure user has `medical_records:read` permission

**Problem:** Empty history for existing patient
**Solutions:**

- Verify patient has previous visits
- Check if medical records were created for those visits
- Confirm database queries are correct

**Problem:** Allergies not showing
**Solutions:**

- Check if allergies are set in patient profile
- Verify allergies field is not null
- Update patient data if needed

**Problem:** Dialog too small on mobile
**Solutions:**

- Use responsive design adjustments
- Enable full-screen mode on small devices
- Consider dedicated mobile view

---

## Related Documentation

- `/documentation/rbac_implementation_guide.md` - RBAC permissions
- `/app/api/medical-records/route.ts` - Medical records API
- `/db/schema/medical-records.ts` - Database schema
- `/components/medical-records/` - Other medical record components

---

## Summary

✅ **Task D.6 Complete**

**What was implemented:**

- ✅ Medical record history API endpoint
- ✅ Comprehensive history dialog component
- ✅ RBAC-protected data access
- ✅ Organized tabbed interface (SOAP, Dx, Proc, Rx)
- ✅ Allergy alert system
- ✅ Chronological record display
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Complete documentation with examples

**Impact:**

- Doctors can quickly review patient history
- Better clinical decision-making
- Improved patient safety with allergy alerts
- Continuity of care maintained
- No need to navigate away from current page

**Integration Ready:**

- Component can be used in any medical record page
- Just import and provide patient ID
- Auto-fetches and displays complete history
- Consistent with existing design system

**Next Steps:**

- Integrate button into existing medical record pages
- Add search and filter capabilities
- Implement timeline view
- Add print/export functionality

---

**Last Updated:** 2025-11-19
**Implemented By:** Claude Code
**Task:** D.6
**Technology:** Next.js 15, React, Drizzle ORM, shadcn/ui
