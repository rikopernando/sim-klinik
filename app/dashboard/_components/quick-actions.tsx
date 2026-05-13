import { type ElementType } from "react"
import Link from "next/link"
import {
  Activity,
  BedDouble,
  ClipboardList,
  CreditCard,
  DoorOpen,
  FlaskConical,
  Microscope,
  PackageX,
  Pill,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types/rbac"

// ── Types ─────────────────────────────────────────────────────────────────────

type QuickAction = {
  title: string
  description: string
  href: string
  icon: ElementType
  accent: string
}

type AccentStyle = {
  bg: string
  text: string
  border: string
  iconBg: string
}

// ── Accent styles ─────────────────────────────────────────────────────────────

const ACCENTS: Record<string, AccentStyle> = {
  emerald: {
    bg: "bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200/80 dark:border-emerald-800/50",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-50 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200/80 dark:border-blue-800/50",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200/80 dark:border-amber-800/50",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  red: {
    bg: "bg-red-50 hover:bg-red-100/70 dark:bg-red-950/20 dark:hover:bg-red-950/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200/80 dark:border-red-800/50",
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  },
  teal: {
    bg: "bg-teal-50 hover:bg-teal-100/70 dark:bg-teal-950/20 dark:hover:bg-teal-950/30",
    text: "text-teal-800 dark:text-teal-300",
    border: "border-teal-200/80 dark:border-teal-800/50",
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
  },
  slate: {
    bg: "bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/20 dark:hover:bg-slate-900/30",
    text: "text-slate-800 dark:text-slate-300",
    border: "border-slate-200/80 dark:border-slate-700/50",
    iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  orange: {
    bg: "bg-orange-50 hover:bg-orange-100/70 dark:bg-orange-950/20 dark:hover:bg-orange-950/30",
    text: "text-orange-800 dark:text-orange-300",
    border: "border-orange-200/80 dark:border-orange-800/50",
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
  },
  cyan: {
    bg: "bg-cyan-50 hover:bg-cyan-100/70 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/30",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200/80 dark:border-cyan-800/50",
    iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",
  },
  violet: {
    bg: "bg-violet-50 hover:bg-violet-100/70 dark:bg-violet-950/20 dark:hover:bg-violet-950/30",
    text: "text-violet-800 dark:text-violet-300",
    border: "border-violet-200/80 dark:border-violet-800/50",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
}

// ── Actions data ──────────────────────────────────────────────────────────────

const ROLE_ACTIONS: Partial<Record<UserRole, QuickAction[]>> = {
  receptionist: [
    {
      title: "Daftar Pasien Baru",
      description: "Registrasi kunjungan baru",
      href: "/dashboard/registration",
      icon: UserPlus,
      accent: "emerald",
    },
    {
      title: "Kelola Antrian",
      description: "Pantau antrian poli",
      href: "/dashboard/queue",
      icon: ClipboardList,
      accent: "blue",
    },
    {
      title: "Data Pasien",
      description: "Cari & kelola pasien",
      href: "/dashboard/patients",
      icon: Users,
      accent: "slate",
    },
  ],
  doctor: [
    {
      title: "Antrian Pasien",
      description: "Pasien yang menunggu",
      href: "/dashboard/doctor",
      icon: Stethoscope,
      accent: "blue",
    },
    {
      title: "UGD",
      description: "Pasien gawat darurat",
      href: "/dashboard/emergency",
      icon: Activity,
      accent: "red",
    },
    {
      title: "Rawat Inap",
      description: "Pasien rawat inap",
      href: "/dashboard/inpatient/patients",
      icon: BedDouble,
      accent: "teal",
    },
  ],
  nurse: [
    {
      title: "Rawat Inap",
      description: "Daftar pasien rawat inap",
      href: "/dashboard/inpatient/patients",
      icon: BedDouble,
      accent: "teal",
    },
    {
      title: "Kelola Kamar",
      description: "Status kamar & tempat tidur",
      href: "/dashboard/inpatient/rooms",
      icon: DoorOpen,
      accent: "emerald",
    },
    {
      title: "Data Pasien",
      description: "Cari data pasien",
      href: "/dashboard/patients",
      icon: Users,
      accent: "slate",
    },
  ],
  pharmacist: [
    {
      title: "Farmasi",
      description: "Resep menunggu disiapkan",
      href: "/dashboard/pharmacy",
      icon: Pill,
      accent: "teal",
    },
    {
      title: "Inventaris",
      description: "Stok obat & bahan",
      href: "/dashboard/pharmacy/inventory",
      icon: PackageX,
      accent: "amber",
    },
  ],
  cashier: [
    {
      title: "Kasir",
      description: "Proses pembayaran tagihan",
      href: "/dashboard/cashier",
      icon: CreditCard,
      accent: "orange",
    },
    {
      title: "Laporan Keuangan",
      description: "Ringkasan keuangan",
      href: "/dashboard/reports",
      icon: TrendingUp,
      accent: "blue",
    },
  ],
  lab_technician: [
    {
      title: "Antrian Lab",
      description: "Order lab yang masuk",
      href: "/dashboard/laboratory/queue",
      icon: Microscope,
      accent: "cyan",
    },
    {
      title: "Hasil Lab",
      description: "Entri & cek hasil",
      href: "/dashboard/laboratory/list",
      icon: FlaskConical,
      accent: "blue",
    },
  ],
  lab_supervisor: [
    {
      title: "Antrian Lab",
      description: "Order lab yang masuk",
      href: "/dashboard/laboratory/queue",
      icon: Microscope,
      accent: "cyan",
    },
    {
      title: "Hasil Lab",
      description: "Verifikasi hasil lab",
      href: "/dashboard/laboratory/list",
      icon: FlaskConical,
      accent: "blue",
    },
  ],
  radiologist: [
    {
      title: "Antrian Radiologi",
      description: "Order radiologi masuk",
      href: "/dashboard/laboratory/queue",
      icon: Microscope,
      accent: "violet",
    },
    {
      title: "Hasil Radiologi",
      description: "Entri hasil radiologi",
      href: "/dashboard/laboratory/list",
      icon: ClipboardList,
      accent: "blue",
    },
  ],
}

const ADMIN_ACTIONS: QuickAction[] = [
  {
    title: "Pendaftaran",
    description: "Registrasi kunjungan baru",
    href: "/dashboard/registration",
    icon: UserPlus,
    accent: "emerald",
  },
  {
    title: "Kasir",
    description: "Proses pembayaran",
    href: "/dashboard/cashier",
    icon: CreditCard,
    accent: "orange",
  },
  {
    title: "Farmasi",
    description: "Kelola resep & stok",
    href: "/dashboard/pharmacy",
    icon: Pill,
    accent: "teal",
  },
  {
    title: "Laporan",
    description: "Laporan keuangan",
    href: "/dashboard/reports",
    icon: TrendingUp,
    accent: "blue",
  },
  {
    title: "Data Pasien",
    description: "Kelola data pasien",
    href: "/dashboard/patients",
    icon: Users,
    accent: "slate",
  },
  {
    title: "Pengguna",
    description: "Manajemen akun",
    href: "/dashboard/users",
    icon: ShieldAlert,
    accent: "red",
  },
]

function getActions(role: UserRole): QuickAction[] {
  if (role === "super_admin" || role === "admin") return ADMIN_ACTIONS
  return ROLE_ACTIONS[role] ?? []
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QuickActions({ role }: { role: UserRole }) {
  const actions = getActions(role)
  if (actions.length === 0) return null

  return (
    <div>
      <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-widest uppercase">
        Akses Cepat
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {actions.map((action) => {
          const accent = ACCENTS[action.accent] ?? ACCENTS.slate
          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border p-4",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                accent.bg,
                accent.border
              )}
            >
              <div
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accent.iconBg)}
              >
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <p className={cn("text-sm leading-tight font-semibold", accent.text)}>
                  {action.title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
