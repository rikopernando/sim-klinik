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
  IconFlask,
  IconCirclePlus2,
  IconHistory,
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
          items: [
            {
              title: "Riwayat Kunjungan",
              url: "/dashboard/visits/history",
            },
          ],
        },
      ],
    },
    {
      label: "Rekam Medis",
      items: [
        {
          title: "Riwayat Rekam Medis",
          url: "/dashboard/medical-records/history",
          icon: IconReportMedical,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rawat Jalan",
          url: "/dashboard/inpatient",
          icon: IconStethoscope,
          items: [
            {
              title: "Antrian Poli",
              url: "/dashboard/doctor",
            },
          ],
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
        {
          title: "UGD",
          url: "/dashboard/emergency",
          icon: IconEmergencyBed,
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
          items: [
            {
              title: "Antrian Pembayaran",
              url: "/dashboard/cashier",
            },
            {
              title: "Riwayat Transaksi",
              url: "/dashboard/cashier/transactions",
            },
          ],
        },
        {
          title: "Pemeriksaan Penunjang",
          url: "/dashboard/laboratory",
          icon: IconFlask,
          items: [
            {
              title: "Daftar Pemeriksaan",
              url: "/dashboard/laboratory/list",
            },
            {
              title: "Antrian Pemeriksaan",
              url: "/dashboard/laboratory/queue",
            },
            {
              title: "Riwayat Pemeriksaan",
              url: "/dashboard/laboratory/history",
            },
          ],
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
        {
          title: "Poli",
          url: "/dashboard/master-data/polis",
          icon: IconCirclePlus2,
        },
      ],
    },
    {
      label: "Administrasi",
      items: [
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
          title: "Pasien Pulang",
          url: "/dashboard/discharge",
          icon: IconUserCheck,
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
          items: [
            {
              title: "Riwayat Kunjungan",
              url: "/dashboard/visits/history",
            },
          ],
        },
      ],
    },
    {
      label: "Rekam Medis",
      items: [
        {
          title: "Riwayat Rekam Medis",
          url: "/dashboard/medical-records/history",
          icon: IconReportMedical,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rawat Jalan",
          url: "/dashboard/inpatient",
          icon: IconStethoscope,
          items: [
            {
              title: "Antrian Poli",
              url: "/dashboard/doctor",
            },
            {
              title: "Rekam Medis",
              url: "/dashboard/medical-records",
            },
          ],
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
        {
          title: "UGD",
          url: "/dashboard/emergency",
          icon: IconEmergencyBed,
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
          items: [
            {
              title: "Antrian Pembayaran",
              url: "/dashboard/cashier",
            },
            {
              title: "Riwayat Transaksi",
              url: "/dashboard/cashier/transactions",
            },
          ],
        },
        {
          title: "Pemeriksaan Penunjang",
          url: "/dashboard/laboratory",
          icon: IconFlask,
          items: [
            {
              title: "Daftar Pemeriksaan",
              url: "/dashboard/laboratory/list",
            },
            {
              title: "Antrian Pemeriksaan",
              url: "/dashboard/laboratory/queue",
            },
            {
              title: "Riwayat Pemeriksaan",
              url: "/dashboard/laboratory/history",
            },
          ],
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
          items: [
            {
              title: "Riwayat Kunjungan",
              url: "/dashboard/visits/history",
            },
          ],
        },
      ],
    },
    {
      label: "Rekam Medis",
      items: [
        {
          title: "Riwayat Rekam Medis",
          url: "/dashboard/medical-records/history",
          icon: IconReportMedical,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rawat Jalan",
          url: "/dashboard/inpatient",
          icon: IconStethoscope,
          items: [
            {
              title: "Antrian Poli",
              url: "/dashboard/doctor",
            },
            {
              title: "Rekam Medis",
              url: "/dashboard/medical-records",
            },
          ],
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
          ],
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
        {
          title: "Kunjungan",
          url: "/dashboard/visits",
          icon: IconHistory,
          items: [
            {
              title: "Riwayat Kunjungan",
              url: "/dashboard/visits/history",
            },
          ],
        },
      ],
    },
    {
      label: "Rekam Medis",
      items: [
        {
          title: "Riwayat Rekam Medis",
          url: "/dashboard/medical-records/history",
          icon: IconReportMedical,
        },
      ],
    },
    {
      label: "Pelayanan Medis",
      items: [
        {
          title: "Rawat Jalan",
          url: "/dashboard/inpatient",
          icon: IconStethoscope,
          items: [
            {
              title: "Rekam Medis",
              url: "/dashboard/medical-records",
            },
          ],
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
          title: "Riwayat Transaksi",
          url: "/dashboard/cashier/transactions",
          icon: IconHistory,
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
          items: [
            {
              title: "Riwayat Kunjungan",
              url: "/dashboard/visits/history",
            },
          ],
        },
      ],
    },
  ],

  lab_technician: [
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
      label: "Laboratorium",
      items: [
        {
          title: "Antrian Laboratorium",
          url: "/dashboard/laboratory/queue",
          icon: IconFlask,
        },
        {
          title: "Laboratorium & Radiologi",
          url: "/dashboard/laboratory",
          icon: IconStethoscope,
        },
      ],
    },
  ],

  lab_supervisor: [
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
      label: "Laboratorium",
      items: [
        {
          title: "Antrian Laboratorium",
          url: "/dashboard/laboratory/queue",
          icon: IconFlask,
        },
        {
          title: "Laboratorium & Radiologi",
          url: "/dashboard/laboratory",
          icon: IconStethoscope,
        },
        {
          title: "Laporan",
          url: "/dashboard/reports",
          icon: IconReportMedical,
        },
      ],
    },
  ],

  radiologist: [
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
      label: "Radiologi",
      items: [
        {
          title: "Laboratorium & Radiologi",
          url: "/dashboard/laboratory",
          icon: IconStethoscope,
        },
        {
          title: "Laporan",
          url: "/dashboard/reports",
          icon: IconReportMedical,
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
