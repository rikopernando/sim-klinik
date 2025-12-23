/**
 * Role-Based Navigation Configuration
 * Defines navigation items for each role
 */

import type { UserRole } from "@/types/rbac"
import type { Icon } from "@tabler/icons-react"
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
  IconUser,
  IconDatabase,
} from "@tabler/icons-react"

export interface NavItem {
  title: string
  url: string
  icon?: Icon
  items?: {
    title: string
    url: string
  }[]
  isActive?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/**
 * Grouped navigation items per role
 */
export const ROLE_NAVIGATION_GROUPS: Record<UserRole, NavGroup[]> = {
  super_admin: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Pendaftaran & Antrian",
      items: [
        {
          title: "Pendaftaran Pasien",
          url: "/dashboard/registration",
          icon: IconUserPlus,
        },
        {
          title: "Antrian",
          url: "/dashboard/queue",
          icon: IconClipboardList,
        },
        {
          title: "Data Pasien",
          url: "/dashboard/patients",
          icon: IconUser,
        },
        {
          title: "Kunjungan",
          url: "/dashboard/visits",
          icon: IconClipboardList,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
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
          items: [
            {
              title: "Daftar Pasien",
              url: "/dashboard/inpatient/patients",
            },
            {
              title: "Manajemen Kamar",
              url: "/dashboard/inpatient/rooms",
            },
          ],
        },
      ],
    },
    {
      label: "Penunjang Medis",
      items: [
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
      ],
    },
    {
      label: "Master Data",
      items: [
        {
          title: "Data Kamar",
          url: "/dashboard/master-data/rooms",
          icon: IconDatabase,
        },
      ],
    },
    {
      label: "Administrasi",
      items: [
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
          title: "Manajemen User",
          url: "/dashboard/users",
          icon: IconUsers,
        },
        {
          title: "Pengaturan",
          url: "/dashboard/settings",
          icon: IconSettings,
        },
      ],
    },
  ],

  admin: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Pendaftaran & Antrian",
      items: [
        {
          title: "Pendaftaran Pasien",
          url: "/dashboard/patients",
          icon: IconUserPlus,
        },
        {
          title: "Antrian",
          url: "/dashboard/queue",
          icon: IconClipboardList,
        },
        {
          title: "Kunjungan",
          url: "/dashboard/visits",
          icon: IconClipboardList,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "UGD",
          url: "/dashboard/emergency",
          icon: IconEmergencyBed,
        },
        {
          title: "Rawat Inap",
          url: "/dashboard/inpatient",
          icon: IconBed,
          items: [
            {
              title: "Daftar Pasien",
              url: "/dashboard/inpatient/patients",
            },
            {
              title: "Manajemen Kamar",
              url: "/dashboard/inpatient/rooms",
            },
          ],
        },
      ],
    },
    {
      label: "Penunjang Medis",
      items: [
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
      ],
    },
    {
      label: "Master Data",
      items: [
        {
          title: "Data Kamar",
          url: "/dashboard/master-data/rooms",
          icon: IconDatabase,
        },
      ],
    },
    {
      label: "Administrasi",
      items: [
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
    },
  ],

  doctor: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
        {
          title: "Antrian Pasien",
          url: "/dashboard/doctor",
          icon: IconStethoscope,
        },
      ],
    },
    {
      label: "Data Pasien",
      items: [
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
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rekam Medis",
          url: "/dashboard/medical-records",
          icon: IconReportMedical,
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
    },
  ],

  nurse: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Data Pasien",
      items: [
        {
          title: "Antrian",
          url: "/dashboard/queue",
          icon: IconClipboardList,
        },
        {
          title: "Data Pasien",
          url: "/dashboard/patients",
          icon: IconUserPlus,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rawat Inap",
          url: "/dashboard/inpatient",
          icon: IconBed,
          items: [
            {
              title: "Daftar Pasien",
              url: "/dashboard/inpatient/patients",
            },
            {
              title: "Manajemen Kamar",
              url: "/dashboard/inpatient/rooms",
            },
          ],
        },
        {
          title: "UGD",
          url: "/dashboard/emergency",
          icon: IconEmergencyBed,
        },
      ],
    },
  ],

  pharmacist: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Farmasi",
      items: [
        {
          title: "Farmasi",
          url: "/dashboard/pharmacy",
          icon: IconPill,
        },
      ],
    },
  ],

  cashier: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Kasir & Pembayaran",
      items: [
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
    },
  ],

  receptionist: [
    {
      label: "Beranda",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Pendaftaran & Antrian",
      items: [
        {
          title: "Antrian",
          url: "/dashboard/queue",
          icon: IconClipboardList,
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
      ],
    },
  ],
}

/**
 * Get grouped navigation items for a specific role
 */
export function getNavigationGroupsForRole(role: UserRole | null): NavGroup[] {
  if (!role) {
    // Default navigation for users without role
    return [
      {
        label: "Beranda",
        items: [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
          },
        ],
      },
    ]
  }

  return ROLE_NAVIGATION_GROUPS[role] || []
}

/**
 * Get flat navigation items for a specific role (for backwards compatibility)
 */
export function getNavigationForRole(role: UserRole | null): NavItem[] {
  const groups = getNavigationGroupsForRole(role)
  return groups.flatMap((group) => group.items)
}

/**
 * Check if user can access a specific route based on role
 */
export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
  if (!role) {
    // Users without role can only access dashboard home
    return pathname === "/dashboard"
  }

  const navGroups = ROLE_NAVIGATION_GROUPS[role]

  // Check if pathname matches any navigation item in any group
  return navGroups.some((group) =>
    group.items.some((item: NavItem) => {
      // Direct match
      if (pathname === item.url || pathname.startsWith(item.url + "/")) {
        return true
      }

      // Check sub-items
      if (item.items) {
        return item.items.some(
          (subItem: { title: string; url: string }) =>
            pathname === subItem.url || pathname.startsWith(subItem.url + "/")
        )
      }

      return false
    })
  )
}
