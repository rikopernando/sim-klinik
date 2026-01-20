# /add-permission - Add RBAC Permission

Add a new permission to the RBAC system and assign it to appropriate roles.

## Arguments

$ARGUMENTS - Permission specification in format: `resource:action --roles role1,role2`

Examples:
- `reports:export --roles admin,doctor`
- `appointments:write --roles receptionist,nurse,doctor`
- `audit_logs:read --roles super_admin,admin`

## Instructions

1. **Parse the arguments** to extract:
   - Permission name (format: `resource:action`)
   - Target roles (optional, will suggest if not provided)

2. **Validate the permission format**:
   - Must follow pattern: `lowercase_resource:action`
   - Action should be one of: `read`, `write`, `delete`, `manage`, or domain-specific like `verify`, `fulfill`, `process`, `lock`, `unlock`

3. **Update `types/rbac.ts`** in THREE places:

### Step 1: Add to Permission type

Find the `Permission` type and add the new permission in the appropriate section:

```typescript
export type Permission =
  // Patient Management
  | "patients:read"
  | "patients:write"
  | "patients:delete"

  // ... existing permissions ...

  // [NEW SECTION or existing section]
  | "new_resource:action"  // <-- Add here
```

### Step 2: Add to ROLE_PERMISSIONS

Add the permission to each role that should have it:

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // ... existing permissions ...
    "new_resource:action",  // <-- Super admin usually gets all permissions
  ],

  admin: [
    // ... existing permissions ...
    // Add if admin should have it
  ],

  doctor: [
    // ... existing permissions ...
    // Add if doctors should have it
  ],

  // ... other roles ...
}
```

### Step 3: Update super_admin (always)

Super admin should ALWAYS have all permissions:

```typescript
super_admin: [
  // ... all other permissions ...
  "new_resource:action",  // <-- Always add to super_admin
],
```

4. **Role assignment guidelines**:

| Permission Pattern | Typical Roles |
|-------------------|---------------|
| `*:read` | Most roles that interact with the resource |
| `*:write` | Roles that create/update the resource |
| `*:delete` | Admin roles, sometimes the owner role |
| `*:manage_*` | Admin roles, specialized managers |
| `*:verify` | Supervisors (lab_supervisor, etc.) |
| `*:fulfill` | Operational roles (pharmacist, etc.) |
| `*:process_*` | Transaction handlers (cashier, etc.) |

5. **Suggest role assignments** based on the resource:

| Resource | Suggested Roles |
|----------|-----------------|
| `patients:*` | receptionist, nurse, doctor, admin |
| `visits:*` | receptionist, doctor, admin |
| `medical_records:*` | doctor, nurse (read only) |
| `prescriptions:*` | doctor (write), pharmacist (fulfill) |
| `pharmacy:*` | pharmacist |
| `billing:*` | cashier, admin |
| `inpatient:*` | nurse, doctor |
| `lab:*` | lab_technician, lab_supervisor |
| `system:*` | super_admin, admin |
| `reports:*` | admin, relevant department heads |

6. **After updating**, remind to:
   - Run `npm run lint` to check for TypeScript errors
   - Update any API routes that should use the new permission
   - Consider if navigation routes in `ROLE_ROUTES` need updating

## Example Execution

Input: `/add-permission reports:export --roles admin,doctor,lab_supervisor`

Output:
```
## Adding Permission: reports:export

### Files to modify:

**types/rbac.ts**

1. Add to Permission type:

   // System / Reports
   | "system:admin"
   | "system:reports"
   | "reports:export"  // <-- NEW


2. Add to ROLE_PERMISSIONS:

   super_admin: [
     // ... existing ...
     "reports:export",  // NEW
   ],

   admin: [
     // ... existing ...
     "reports:export",  // NEW
   ],

   doctor: [
     // ... existing ...
     "reports:export",  // NEW
   ],

   lab_supervisor: [
     // ... existing ...
     "reports:export",  // NEW
   ],

### Usage in API routes:

After adding, you can protect routes with:

export const GET = withRBAC(
  handler,
  { permissions: ["reports:export"] }
)

### Verification:

Run: npm run lint
Expected: No TypeScript errors
```

## Interactive Mode

If roles are not specified, ask:

```
Which roles should have the "reports:export" permission?

Suggested based on resource type:
- [x] super_admin (always included)
- [ ] admin
- [ ] doctor
- [ ] nurse
- [ ] pharmacist
- [ ] cashier
- [ ] receptionist
- [ ] lab_technician
- [ ] lab_supervisor
- [ ] radiologist
```

## Permission Naming Conventions

Follow existing patterns:
- Use lowercase with underscores: `medical_records`, not `medicalRecords`
- Use colons to separate resource and action: `resource:action`
- Common actions: `read`, `write`, `delete`, `manage`, `verify`, `fulfill`, `lock`, `unlock`, `process`
- Be specific: `billing:process_payment` not just `billing:process`
