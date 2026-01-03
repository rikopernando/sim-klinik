# Sprint 3: RBAC Implementation Progress

## ✅ Completed Tasks

### 1. Created Inpatient Permissions Mapping
**File:** `/lib/rbac/inpatient-permissions.ts`

Documented all permission requirements for 19 inpatient routes with role access summary.

### 2. Applied `withRBAC` to All Inpatient API Routes (19 files)

#### Bed Management (4 routes)
- ✅ `POST /api/inpatient/assign-bed` - `inpatient:manage_beds`
- ✅ `GET /api/inpatient/available-rooms` - `inpatient:read`
- ✅ `GET /api/inpatient/search-unassigned-patients` - `inpatient:read`
- ✅ `GET /api/rooms` - `inpatient:read`
- ✅ `POST /api/rooms` - `inpatient:manage_beds`
- ✅ `PATCH /api/rooms` - `inpatient:manage_beds`

#### Vitals Management (3 routes)
- ✅ `GET /api/inpatient/vitals` - `inpatient:read`
- ✅ `POST /api/inpatient/vitals` - `inpatient:write`
- ✅ `DELETE /api/inpatient/vitals/[id]` - `inpatient:write`

#### CPPT (4 routes)
- ✅ `GET /api/inpatient/cppt` - `inpatient:read`
- ✅ `POST /api/inpatient/cppt` - `inpatient:write`
- ✅ `PUT /api/inpatient/cppt/[id]` - `inpatient:write`
- ✅ `DELETE /api/inpatient/cppt/[id]` - `inpatient:write`

#### Patient Management (2 routes)
- ✅ `GET /api/inpatient/patients` - `inpatient:read`
- ✅ `GET /api/inpatient/patients/[visitId]` - `inpatient:read`

#### Prescriptions (3 routes)
- ✅ `POST /api/inpatient/prescriptions` - `prescriptions:write`
- ✅ `DELETE /api/inpatient/prescriptions/[id]` - `prescriptions:write`
- ✅ `POST /api/inpatient/prescriptions/administer` - `inpatient:write`

#### Procedures (3 routes)
- ✅ `GET /api/inpatient/procedures` - `inpatient:read`
- ✅ `POST /api/inpatient/procedures` - `inpatient:write`
- ✅ `DELETE /api/inpatient/procedures/[id]` - `inpatient:write`
- ✅ `PATCH /api/inpatient/procedures/status` - `inpatient:write`

#### Materials (2 routes)
- ✅ `GET /api/materials` - `inpatient:read`
- ✅ `POST /api/materials` - `inpatient:write`
- ✅ `DELETE /api/materials/[id]` - `inpatient:write`

#### Discharge (1 route)
- ✅ `POST /api/inpatient/complete-discharge` - `discharge:write`

## Changes Made to Routes

### Pattern Applied
All routes were updated from:
```typescript
export async function METHOD(request: NextRequest) {
  // Manual auth check (if present)
  const session = await getSession()
  if (!session?.user) { ... }

  // Handler logic
}
```

To:
```typescript
export const METHOD = withRBAC(async (request: NextRequest, { user, role }) => {
  // Handler logic - no manual auth checks needed
  // user.id, user.email, user.name available from context
}, { permissions: ["appropriate:permission"] })
```

### Key Improvements
1. **Removed manual authentication checks** - `withRBAC` handles this automatically
2. **Removed `getSession()` imports** - No longer needed
3. **User context from middleware** - Access to `user.id`, `user.email`, `user.name`, `role`
4. **Consistent permission enforcement** - All routes follow the same pattern
5. **Type-safe** - Full TypeScript support maintained

## Permission Summary by Role

### Nurse
- ✅ Can read all inpatient data
- ✅ Can write vitals, CPPT, materials, procedures
- ✅ Can manage beds (assign, transfer)
- ✅ Can administer medications
- ❌ Cannot create/delete prescriptions (doctor only)
- ❌ Cannot complete discharge (doctor only)

### Doctor
- ✅ Can read all inpatient data
- ✅ Can write vitals, CPPT, materials, procedures
- ✅ Can create/delete prescriptions
- ✅ Can complete discharge
- ❌ Cannot manage beds directly (nurse responsibility)

### Admin
- ✅ Can read all inpatient data (read-only for reporting)
- ❌ Cannot write/modify clinical data

### Super Admin
- ✅ Full access to all inpatient operations

### 3. Created `usePermission` Hook
**File:** `/hooks/use-permission.ts`

A client-side React hook for permission checking with the following capabilities:
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission(permissions[])` - Check if user has any of the permissions
- `hasAllPermissions(permissions[])` - Check if user has all permissions
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles[])` - Check if user has any of the roles
- Exposes `userRole`, `userPermissions`, `isLoading` state

### 4. Updated UI Components for Permission-Based Hiding

#### Patient Detail Page
**File:** `/app/dashboard/inpatient/patients/[visitId]/page.tsx`

Updated to conditionally render action dialogs based on permissions:
- ✅ `RecordVitalsDialog` - requires `inpatient:write`
- ✅ `CPPTDialog` - requires `inpatient:write`
- ✅ `RecordMaterialDialog` - requires `inpatient:write`
- ✅ `CreatePrescriptionDialog` - requires `prescriptions:write`
- ✅ `CreateProcedureDialog` - requires `inpatient:write`
- ✅ `CompleteDischargeDialog` - requires `discharge:write`

#### Room Card Component
**File:** `/components/inpatient/room-card.tsx`

Updated to conditionally render bed assignment button:
- ✅ "Alokasi Bed" button - requires `inpatient:manage_beds`

**Pattern Applied:**
```typescript
const { hasPermission } = usePermission()

// In JSX
{hasPermission("inpatient:write") && (
  <RecordVitalsDialog ... />
)}
```

## 📋 Remaining Tasks (Priority 1: RBAC)

- [x] Create inpatient permissions file
- [x] Apply `withRBAC` to all inpatient routes
- [x] Create `usePermission` hook for client-side permission checking
- [x] Hide UI elements based on permissions
- [ ] Test RBAC with different user roles

## Next Steps

1. **Test RBAC with different user roles** (Final task for Priority 1)
   - Create test users with different roles (nurse, doctor, admin)
   - Verify API route access control
   - Verify UI button visibility based on permissions

2. After completing Priority 1, proceed with:
   - **Priority 2:** Bed Transfer feature
   - **Priority 3:** Data Validation improvements
