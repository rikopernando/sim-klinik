/**
 * RBAC (Role-Based Access Control) Type Definitions
 * Centralized types for roles and permissions
 */

/**
 * User Roles
 */
export type UserRole =
    | "super_admin"
    | "admin"
    | "doctor"
    | "nurse"
    | "pharmacist"
    | "cashier"
    | "receptionist";

export const USER_ROLES = {
    SUPER_ADMIN: "super_admin" as UserRole,
    ADMIN: "admin" as UserRole,
    DOCTOR: "doctor" as UserRole,
    NURSE: "nurse" as UserRole,
    PHARMACIST: "pharmacist" as UserRole,
    CASHIER: "cashier" as UserRole,
    RECEPTIONIST: "receptionist" as UserRole,
} as const;

/**
 * Permissions
 */
export type Permission =
    // Patient Management
    | "patients:read"
    | "patients:write"
    | "patients:delete"

    // Visit Management
    | "visits:read"
    | "visits:write"
    | "visits:delete"

    // Medical Records
    | "medical_records:read"
    | "medical_records:write"
    | "medical_records:lock"
    | "medical_records:unlock"

    // Prescriptions
    | "prescriptions:read"
    | "prescriptions:write"
    | "prescriptions:fulfill"

    // Pharmacy
    | "pharmacy:read"
    | "pharmacy:write"
    | "pharmacy:manage_inventory"

    // Billing
    | "billing:read"
    | "billing:write"
    | "billing:process_payment"

    // Inpatient
    | "inpatient:read"
    | "inpatient:write"
    | "inpatient:manage_beds"

    // Discharge
    | "discharge:read"
    | "discharge:write"

    // System
    | "system:admin"
    | "system:reports";

/**
 * Role Permissions Mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    super_admin: [
        // Super admin has ALL permissions
        "patients:read",
        "patients:write",
        "patients:delete",
        "visits:read",
        "visits:write",
        "visits:delete",
        "medical_records:read",
        "medical_records:write",
        "medical_records:lock",
        "medical_records:unlock",
        "prescriptions:read",
        "prescriptions:write",
        "prescriptions:fulfill",
        "pharmacy:read",
        "pharmacy:write",
        "pharmacy:manage_inventory",
        "billing:read",
        "billing:write",
        "billing:process_payment",
        "inpatient:read",
        "inpatient:write",
        "inpatient:manage_beds",
        "discharge:read",
        "discharge:write",
        "system:admin",
        "system:reports",
    ],

    admin: [
        "patients:read",
        "patients:write",
        "patients:delete",
        "visits:read",
        "visits:write",
        "visits:delete",
        "medical_records:read",
        "prescriptions:read",
        "pharmacy:read",
        "billing:read",
        "inpatient:read",
        "discharge:read",
        "system:admin",
        "system:reports",
    ],

    doctor: [
        "patients:read",
        "visits:read",
        "visits:write",
        "medical_records:read",
        "medical_records:write",
        "medical_records:lock",
        "prescriptions:read",
        "prescriptions:write",
        "inpatient:read",
        "inpatient:write",
        "discharge:read",
        "discharge:write",
    ],

    nurse: [
        "patients:read",
        "visits:read",
        "medical_records:read",
        "prescriptions:read",
        "inpatient:read",
        "inpatient:write",
        "inpatient:manage_beds",
    ],

    pharmacist: [
        "patients:read",
        "prescriptions:read",
        "prescriptions:fulfill",
        "pharmacy:read",
        "pharmacy:write",
        "pharmacy:manage_inventory",
    ],

    cashier: [
        "patients:read",
        "visits:read",
        "billing:read",
        "billing:write",
        "billing:process_payment",
    ],

    receptionist: [
        "patients:read",
        "patients:write",
        "visits:read",
        "visits:write",
    ],
};

/**
 * Role Display Information
 */
export const ROLE_INFO: Record<UserRole, {
    label: string;
    labelId: string;
    description: string;
    color: string;
}> = {
    super_admin: {
        label: "Super Admin",
        labelId: "Super Administrator",
        description: "Full system access with all permissions",
        color: "bg-red-600",
    },
    admin: {
        label: "Administrator",
        labelId: "Administrator",
        description: "Full system access",
        color: "bg-purple-600",
    },
    doctor: {
        label: "Dokter",
        labelId: "Doctor",
        description: "Medical records and patient care",
        color: "bg-blue-600",
    },
    nurse: {
        label: "Perawat",
        labelId: "Nurse",
        description: "Patient care and monitoring",
        color: "bg-green-600",
    },
    pharmacist: {
        label: "Apoteker",
        labelId: "Pharmacist",
        description: "Pharmacy and medication management",
        color: "bg-teal-600",
    },
    cashier: {
        label: "Kasir",
        labelId: "Cashier",
        description: "Billing and payments",
        color: "bg-orange-600",
    },
    receptionist: {
        label: "Resepsionis",
        labelId: "Receptionist",
        description: "Patient registration and visits",
        color: "bg-pink-600",
    },
};

/**
 * Navigation Routes per Role
 */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
    super_admin: [
        "/dashboard",
        "/dashboard/patients",
        "/dashboard/visits",
        "/dashboard/medical-records",
        "/dashboard/emergency",
        "/dashboard/inpatient",
        "/dashboard/pharmacy",
        "/dashboard/cashier",
        "/dashboard/discharge",
        "/dashboard/reports",
        "/dashboard/users", // User management - super admin only
        "/dashboard/settings", // System settings
    ],

    admin: [
        "/dashboard",
        "/dashboard/patients",
        "/dashboard/visits",
        "/dashboard/emergency",
        "/dashboard/inpatient",
        "/dashboard/pharmacy",
        "/dashboard/cashier",
        "/dashboard/discharge",
        "/dashboard/reports",
    ],

    doctor: [
        "/dashboard",
        "/dashboard/patients",
        "/dashboard/visits",
        "/dashboard/medical-records",
        "/dashboard/emergency",
        "/dashboard/discharge",
    ],

    nurse: [
        "/dashboard",
        "/dashboard/patients",
        "/dashboard/inpatient",
        "/dashboard/emergency",
    ],

    pharmacist: [
        "/dashboard",
        "/dashboard/pharmacy",
    ],

    cashier: [
        "/dashboard",
        "/dashboard/cashier",
        "/dashboard/discharge",
    ],

    receptionist: [
        "/dashboard",
        "/dashboard/patients",
        "/dashboard/visits",
    ],
};

/**
 * Role Entity
 */
export interface Role {
    id: number;
    name: UserRole;
    description: string | null;
    permissions: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * User Role Entity
 */
export interface UserRoleAssignment {
    id: number;
    userId: string;
    roleId: number;
    assignedAt: string;
    assignedBy: string | null;
}

/**
 * User with Role
 */
export interface UserWithRole {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
}
