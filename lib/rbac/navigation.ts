/**
 * Role-Based Navigation Configuration
 * Defines navigation items for each role
 */

import type { UserRole } from "@/types/rbac";
import type { Icon } from "@tabler/icons-react";
import {
    IconDashboard,
    IconUserPlus,
    IconClipboardList,
    IconStethoscope,
    IconPill,
    IconCash,
    IconBed,
    IconEmergencyBed,
    IconUserCheck,
    IconReportMedical,
    IconUsers,
    IconSettings,
} from "@tabler/icons-react";

export interface NavItem {
    title: string;
    url: string;
    icon?: Icon;
    items?: {
        title: string;
        url: string;
    }[];
}

/**
 * Navigation items per role
 */
export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
    super_admin: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Manajemen User",
            url: "/dashboard/users",
            icon: IconUsers,
        },
        {
            title: "Pendaftaran Pasien",
            url: "/dashboard/patients",
            icon: IconUserPlus,
        },
        {
            title: "Kunjungan",
            url: "/dashboard/visits",
            icon: IconClipboardList,
        },
        {
            title: "Rekam Medis",
            url: "/dashboard/medical-records",
            icon: IconStethoscope,
        },
        {
            title: "UGD",
            url: "/dashboard/emergency",
            icon: IconEmergencyBed,
        },
        {
            title: "Rawat Inap",
            url: "/dashboard/inpatient",
            icon: IconBed,
        },
        {
            title: "Farmasi",
            url: "/dashboard/pharmacy",
            icon: IconPill,
        },
        {
            title: "Kasir",
            url: "/dashboard/cashier",
            icon: IconCash,
        },
        {
            title: "Pasien Pulang",
            url: "/dashboard/discharge",
            icon: IconUserCheck,
        },
        {
            title: "Laporan",
            url: "/dashboard/reports",
            icon: IconReportMedical,
        },
        {
            title: "Pengaturan",
            url: "/dashboard/settings",
            icon: IconSettings,
        },
    ],

    admin: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Pendaftaran Pasien",
            url: "/dashboard/patients",
            icon: IconUserPlus,
        },
        {
            title: "Kunjungan",
            url: "/dashboard/visits",
            icon: IconClipboardList,
        },
        {
            title: "UGD",
            url: "/dashboard/emergency",
            icon: IconEmergencyBed,
        },
        {
            title: "Rawat Inap",
            url: "/dashboard/inpatient",
            icon: IconBed,
        },
        {
            title: "Farmasi",
            url: "/dashboard/pharmacy",
            icon: IconPill,
        },
        {
            title: "Kasir",
            url: "/dashboard/cashier",
            icon: IconCash,
        },
        {
            title: "Pasien Pulang",
            url: "/dashboard/discharge",
            icon: IconUserCheck,
        },
        {
            title: "Laporan",
            url: "/dashboard/reports",
            icon: IconReportMedical,
        },
    ],

    doctor: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Data Pasien",
            url: "/dashboard/patients",
            icon: IconUserPlus,
        },
        {
            title: "Kunjungan",
            url: "/dashboard/visits",
            icon: IconClipboardList,
        },
        {
            title: "Rekam Medis",
            url: "/dashboard/medical-records",
            icon: IconStethoscope,
        },
        {
            title: "UGD",
            url: "/dashboard/emergency",
            icon: IconEmergencyBed,
        },
        {
            title: "Pasien Pulang",
            url: "/dashboard/discharge",
            icon: IconUserCheck,
        },
    ],

    nurse: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Data Pasien",
            url: "/dashboard/patients",
            icon: IconUserPlus,
        },
        {
            title: "Rawat Inap",
            url: "/dashboard/inpatient",
            icon: IconBed,
        },
        {
            title: "UGD",
            url: "/dashboard/emergency",
            icon: IconEmergencyBed,
        },
    ],

    pharmacist: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Farmasi",
            url: "/dashboard/pharmacy",
            icon: IconPill,
        },
    ],

    cashier: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Kasir",
            url: "/dashboard/cashier",
            icon: IconCash,
        },
        {
            title: "Pasien Pulang",
            url: "/dashboard/discharge",
            icon: IconUserCheck,
        },
    ],

    receptionist: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Pendaftaran Pasien",
            url: "/dashboard/patients",
            icon: IconUserPlus,
        },
        {
            title: "Kunjungan",
            url: "/dashboard/visits",
            icon: IconClipboardList,
        },
    ],
};

/**
 * Get navigation items for a specific role
 */
export function getNavigationForRole(role: UserRole | null): NavItem[] {
    if (!role) {
        // Default navigation for users without role
        return [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: IconDashboard,
            },
        ];
    }

    return ROLE_NAVIGATION[role] || [];
}

/**
 * Check if user can access a specific route based on role
 */
export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
    if (!role) {
        // Users without role can only access dashboard home
        return pathname === "/dashboard";
    }

    const navItems = ROLE_NAVIGATION[role];

    // Check if pathname matches any navigation item
    return navItems.some((item) => {
        // Direct match
        if (pathname === item.url || pathname.startsWith(item.url + "/")) {
            return true;
        }

        // Check sub-items
        if (item.items) {
            return item.items.some((subItem) =>
                pathname === subItem.url || pathname.startsWith(subItem.url + "/")
            );
        }

        return false;
    });
}
