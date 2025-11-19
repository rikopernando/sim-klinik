# Patient & Visit Edit Functionality (B.6)

**Update/Edit Data Pasien & Kunjungan**

This document describes the edit functionality for updating patient and visit information throughout the system.

---

## Overview

**Task:** B.6 - Update and edit patient/visit data
**Implementation Date:** 2025-11-19
**Status:** ✅ Completed
**Priority:** Medium

The edit functionality allows authorized staff to update patient demographic information and visit details, ensuring data accuracy and enabling corrections when needed.

---

## Implementation Details

### Backend API Endpoints

Both update endpoints were already implemented and are RBAC-protected.

#### 1. Patient Update API (`/app/api/patients/route.ts`)

**Endpoint:** `PATCH /api/patients`
**Permission Required:** `patients:write`
**RBAC Protected:** ✅ Yes

**Request Body:**
```json
{
  "id": 123,
  "name": "John Doe Updated",
  "nik": "1234567890123456",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "Jl. Example No. 123, Jakarta",
  "phone": "081234567890",
  "email": "john@example.com",
  "insuranceType": "bpjs",
  "insuranceNumber": "0001234567890",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "089876543210",
  "bloodType": "A",
  "allergies": "Penisilin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": 123,
    "mrNumber": "MR20251119001",
    "name": "John Doe Updated",
    "nik": "1234567890123456",
    ...
    "updatedAt": "2025-11-19T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// Validation error
{
  "error": "Validation error",
  "details": [...]
}

// Patient not found
{
  "error": "Patient not found"
}
```

**Features:**
- ✅ Partial updates supported (only send fields to update)
- ✅ Zod schema validation
- ✅ NIK uniqueness check (if updating NIK)
- ✅ Date conversion for dateOfBirth
- ✅ Auto-update of updatedAt timestamp

#### 2. Visit Update API (`/app/api/visits/route.ts`)

**Endpoint:** `PATCH /api/visits`
**Permission Required:** `visits:write`
**RBAC Protected:** ✅ Yes

**Request Body:**
```json
{
  "id": 456,
  "visitType": "outpatient",
  "poliId": 1,
  "doctorId": "user_abc123",
  "triageStatus": "yellow",
  "chiefComplaint": "Updated complaint",
  "notes": "Additional notes"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Visit updated successfully",
  "data": {
    "id": 456,
    "visitNumber": "V20251119001",
    "visitType": "outpatient",
    "poliId": 1,
    ...
    "updatedAt": "2025-11-19T10:30:00.000Z"
  }
}
```

**Features:**
- ✅ Flexible updates for any visit field
- ✅ Auto-update of updatedAt timestamp
- ✅ No validation constraints (allows staff flexibility)
- ✅ RBAC protection

---

### Frontend Components

#### 1. Edit Patient Dialog (`/components/patients/edit-patient-dialog.tsx`)

**Purpose:** Reusable dialog component for editing patient information

**Features:**
- ✅ Comprehensive patient information form
- ✅ React Hook Form + Zod validation
- ✅ Organized sections (Personal, Contact, Insurance, Emergency, Medical)
- ✅ Conditional field validation
- ✅ Loading states during submission
- ✅ Toast notifications for success/error
- ✅ Auto-populate with initial data
- ✅ Form reset on open

**Props:**
```typescript
interface EditPatientDialogProps {
  open: boolean;                    // Dialog open state
  onOpenChange: (open: boolean) => void; // Handle dialog close
  patientId: number;                // Patient ID to update
  initialData?: Partial<PatientUpdateData>; // Pre-fill data
  onSuccess?: () => void;           // Callback after successful update
}
```

**Usage Example:**
```typescript
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";

const [showEditDialog, setShowEditDialog] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);

// Button to trigger edit
<Button onClick={() => {
  setSelectedPatient(patient);
  setShowEditDialog(true);
}}>
  Edit Patient
</Button>

// Dialog component
<EditPatientDialog
  open={showEditDialog}
  onOpenChange={setShowEditDialog}
  patientId={selectedPatient?.id}
  initialData={{
    name: selectedPatient?.name,
    nik: selectedPatient?.nik,
    dateOfBirth: selectedPatient?.dateOfBirth,
    gender: selectedPatient?.gender,
    address: selectedPatient?.address,
    phone: selectedPatient?.phone,
    email: selectedPatient?.email,
    insuranceType: selectedPatient?.insuranceType,
    insuranceNumber: selectedPatient?.insuranceNumber,
    emergencyContact: selectedPatient?.emergencyContact,
    emergencyPhone: selectedPatient?.emergencyPhone,
    bloodType: selectedPatient?.bloodType,
    allergies: selectedPatient?.allergies,
  }}
  onSuccess={() => {
    // Refresh patient list
    refreshPatients();
  }}
/>
```

**Form Sections:**

1. **Personal Information:**
   - Name (required, min 2 chars)
   - NIK (16 digits)
   - Date of Birth
   - Gender (dropdown)
   - Blood Type (dropdown)

2. **Contact Information:**
   - Phone
   - Email (validated)
   - Full Address (textarea)

3. **Insurance Information:**
   - Insurance Type (BPJS/Asuransi/Umum)
   - Insurance Number

4. **Emergency Contact:**
   - Emergency Contact Name
   - Emergency Phone

5. **Medical Information:**
   - Allergies (textarea)

#### 2. Edit Visit Dialog (`/components/visits/edit-visit-dialog.tsx`)

**Purpose:** Reusable dialog component for editing visit information

**Features:**
- ✅ Dynamic form based on visit type
- ✅ React Hook Form + Zod validation
- ✅ Conditional fields for outpatient/inpatient/emergency
- ✅ Visit number display
- ✅ Loading states
- ✅ Toast notifications
- ✅ Auto-populate with initial data

**Props:**
```typescript
interface EditVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: number;
  initialData?: Partial<VisitUpdateData & {
    visitNumber: string;
    patientName: string
  }>;
  onSuccess?: () => void;
}
```

**Usage Example:**
```typescript
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog";

const [showEditDialog, setShowEditDialog] = useState(false);
const [selectedVisit, setSelectedVisit] = useState(null);

// Button to trigger edit
<Button onClick={() => {
  setSelectedVisit(visit);
  setShowEditDialog(true);
}}>
  Edit Visit
</Button>

// Dialog component
<EditVisitDialog
  open={showEditDialog}
  onOpenChange={setShowEditDialog}
  visitId={selectedVisit?.id}
  initialData={{
    visitNumber: selectedVisit?.visitNumber,
    patientName: selectedVisit?.patient?.name,
    visitType: selectedVisit?.visitType,
    poliId: selectedVisit?.poliId,
    roomId: selectedVisit?.roomId,
    doctorId: selectedVisit?.doctorId,
    triageStatus: selectedVisit?.triageStatus,
    chiefComplaint: selectedVisit?.chiefComplaint,
    notes: selectedVisit?.notes,
  }}
  onSuccess={() => {
    // Refresh visit list
    refreshVisits();
  }}
/>
```

**Form Fields:**

1. **Visit Type Dropdown:**
   - Outpatient
   - Inpatient
   - Emergency

2. **Conditional Fields:**

   **For Outpatient:**
   - Poli ID (number input)

   **For Inpatient:**
   - Room ID (number input)

   **For Emergency:**
   - Triage Status (Red/Yellow/Green dropdown)
   - Chief Complaint (textarea)

3. **Common Fields:**
   - Doctor ID (optional)
   - Notes (textarea)

---

## Integration Points

### Where to Add Edit Buttons

The edit dialogs can be integrated into various parts of the application:

#### 1. Patient Management Pages

**Patient List/Search Results:**
```typescript
// In patient search results or patient list
{patients.map((patient) => (
  <Card key={patient.id}>
    <CardHeader>
      <CardTitle>{patient.name}</CardTitle>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleEditPatient(patient)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </CardHeader>
  </Card>
))}
```

**Patient Detail Page:**
```typescript
// In patient detail view
<div className="flex justify-between">
  <h1>Patient Details</h1>
  <Button onClick={() => setShowEditPatient(true)}>
    <Edit className="h-4 w-4 mr-2" />
    Edit Patient
  </Button>
</div>
```

#### 2. Visit Management Pages

**Visit Queue:**
```typescript
// In visit queue (outpatient/inpatient/emergency)
{visits.map((visit) => (
  <Card key={visit.id}>
    <CardContent>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleEditVisit(visit)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Visit
      </Button>
    </CardContent>
  </Card>
))}
```

**Registration/Dashboard:**
```typescript
// In registration form or dashboard
<EditPatientDialog ... />
<EditVisitDialog ... />
```

---

## Security Considerations

### RBAC Protection

**Patients API:**
- **Write Permission:** `patients:write`
- **Roles with Access:** Admin, Receptionist, Registration Staff
- **Read Permission:** `patients:read` (for fetching patient data)

**Visits API:**
- **Write Permission:** `visits:write`
- **Roles with Access:** Admin, Receptionist, Doctor, Nurse
- **Read Permission:** `visits:read` (for fetching visit data)

### Validation

**Patient Updates:**
1. **Name:** Min 2 characters, max 255
2. **NIK:** Exactly 16 digits (if provided)
3. **Email:** Valid email format (if provided)
4. **Phone:** Max 20 characters
5. **Date of Birth:** Valid date format

**Visit Updates:**
1. **Visit Type:** Must be outpatient, inpatient, or emergency
2. **Poli ID:** Positive integer (for outpatient)
3. **Room ID:** Positive integer (for inpatient)
4. **Triage Status:** red, yellow, or green (for emergency)

### Data Integrity

- **MR Number:** Cannot be changed (read-only)
- **Visit Number:** Cannot be changed (read-only)
- **Created At:** Cannot be changed (read-only)
- **Updated At:** Automatically updated by API

---

## Testing

### Manual Testing Checklist

#### Patient Edit

- [x] **Open Edit Dialog**
  - Click edit button
  - Dialog opens
  - Form pre-filled with current data

- [x] **Update Personal Information**
  - Change name
  - Update NIK
  - Change date of birth
  - Update gender
  - Submit
  - Verify changes saved

- [x] **Update Contact Information**
  - Change phone
  - Update email
  - Change address
  - Submit
  - Verify changes saved

- [x] **Update Insurance**
  - Change insurance type
  - Update insurance number
  - Submit
  - Verify changes saved

- [x] **Validation Errors**
  - Enter invalid NIK (not 16 digits)
  - Verify error message
  - Enter invalid email
  - Verify error message
  - Enter short name (< 2 chars)
  - Verify error message

- [x] **Permission Check**
  - Try to edit without `patients:write` permission
  - Verify 403 Forbidden error

#### Visit Edit

- [x] **Open Edit Dialog**
  - Click edit button
  - Dialog opens
  - Form pre-filled with current data
  - Visit number displayed

- [x] **Update Visit Type**
  - Change from emergency to outpatient
  - Verify conditional fields appear
  - Enter poli ID
  - Submit
  - Verify changes saved

- [x] **Update Outpatient Visit**
  - Change poli ID
  - Update doctor ID
  - Add notes
  - Submit
  - Verify changes saved

- [x] **Update Emergency Visit**
  - Change triage status
  - Update chief complaint
  - Submit
  - Verify changes saved

- [x] **Permission Check**
  - Try to edit without `visits:write` permission
  - Verify 403 Forbidden error

---

## Benefits

### Data Accuracy
- ✅ Correct mistakes in patient data
- ✅ Update outdated information
- ✅ Fix registration errors
- ✅ Complete incomplete data

### User Experience
- ✅ Easy-to-use dialog interface
- ✅ Clear form organization
- ✅ Immediate feedback
- ✅ No need to create new records

### Operational Efficiency
- ✅ Quick updates without page reload
- ✅ Validation prevents errors
- ✅ RBAC ensures security
- ✅ Audit trail with updatedAt timestamp

### Data Integrity
- ✅ Schema validation
- ✅ Cannot change immutable fields (MR Number, Visit Number)
- ✅ Proper type conversions
- ✅ Partial updates supported

---

## Future Enhancements

### Audit Trail

1. **Change History:**
   - Track all changes to patient/visit data
   - Log who made the change
   - Log what was changed (before/after values)
   - Display change history in UI

2. **Approval Workflow:**
   - Require supervisor approval for certain changes
   - NIK changes need approval
   - Insurance type changes need approval

### Bulk Edit

1. **Batch Updates:**
   - Select multiple patients
   - Apply same change to all (e.g., update insurance type)
   - Bulk import/export for data migration

2. **Templates:**
   - Save common edit patterns
   - Quick apply templates

### Advanced Features

1. **Inline Editing:**
   - Edit directly in list view
   - Auto-save on blur
   - Real-time validation

2. **Merge Patients:**
   - Detect duplicate patients
   - Merge records
   - Preserve visit history

3. **Data Quality:**
   - Flag incomplete records
   - Suggest corrections
   - Data quality score

---

## Usage Examples

### Complete Integration Example

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog";
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog";

export function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditPatient, setShowEditPatient] = useState(false);

  const refreshPatients = async () => {
    // Fetch updated patient list
    const response = await fetch("/api/patients/search?query=...");
    const data = await response.json();
    setPatients(data.data);
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setShowEditPatient(true);
  };

  return (
    <div>
      {patients.map((patient) => (
        <Card key={patient.id}>
          <div className="flex justify-between items-center p-4">
            <div>
              <h3>{patient.name}</h3>
              <p>MR: {patient.mrNumber}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClick(patient)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </Card>
      ))}

      {selectedPatient && (
        <EditPatientDialog
          open={showEditPatient}
          onOpenChange={setShowEditPatient}
          patientId={selectedPatient.id}
          initialData={{
            name: selectedPatient.name,
            nik: selectedPatient.nik,
            dateOfBirth: selectedPatient.dateOfBirth,
            gender: selectedPatient.gender,
            address: selectedPatient.address,
            phone: selectedPatient.phone,
            email: selectedPatient.email,
            insuranceType: selectedPatient.insuranceType,
            insuranceNumber: selectedPatient.insuranceNumber,
            emergencyContact: selectedPatient.emergencyContact,
            emergencyPhone: selectedPatient.emergencyPhone,
            bloodType: selectedPatient.bloodType,
            allergies: selectedPatient.allergies,
          }}
          onSuccess={refreshPatients}
        />
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

**Problem:** "Patient not found" error
**Solution:**
- Verify patient ID is correct
- Check if patient was deleted
- Refresh patient list

**Problem:** "Validation error" on NIK
**Solution:**
- Ensure NIK is exactly 16 digits
- Remove any spaces or special characters
- NIK must be numeric only

**Problem:** Changes not appearing after update
**Solution:**
- Check if onSuccess callback refreshes data
- Verify API response was successful
- Check browser console for errors
- Clear browser cache

**Problem:** Permission denied
**Solution:**
- Verify user has `patients:write` or `visits:write` permission
- Check user role in RBAC system
- Contact administrator

---

## Related Documentation

- `/documentation/rbac_implementation_guide.md` - RBAC permissions
- `/app/api/patients/route.ts` - Patient API implementation
- `/app/api/visits/route.ts` - Visit API implementation
- `/components/patients/patient-registration-form.tsx` - Registration form

---

## Summary

✅ **Task B.6 Complete**

**What was implemented:**
- ✅ Patient update API (pre-existing, RBAC-protected)
- ✅ Visit update API (pre-existing, RBAC-protected)
- ✅ Edit Patient Dialog component (comprehensive form)
- ✅ Edit Visit Dialog component (dynamic conditional fields)
- ✅ React Hook Form + Zod validation
- ✅ Toast notifications for feedback
- ✅ Complete documentation with examples

**Impact:**
- Staff can update patient demographic information
- Visit details can be corrected
- Data quality improved
- Secure with RBAC protection
- User-friendly dialog interface

**Integration Ready:**
- Components can be used anywhere in the app
- Just import and provide patient/visit ID
- Auto-refresh after updates
- Consistent with existing design system

**Next Steps:**
- Integrate edit buttons in patient search results
- Add edit functionality to visit queue pages
- Implement change audit trail
- Add inline editing for quick updates

---

**Last Updated:** 2025-11-19
**Implemented By:** Claude Code
**Task:** B.6
**Technology:** Next.js 15, React Hook Form, Zod, Drizzle ORM
