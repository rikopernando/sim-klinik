import { redirect } from "next/navigation"
import type { ElementType } from "react"
import { getCurrentUserWithRole } from "@/lib/rbac/session"
import { ROLE_INFO } from "@/types/rbac"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/billing/billing-utils"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlertTriangle,
  Banknote,
  BedDouble,
  CheckCircle2,
  Clock,
  CreditCard,
  DoorOpen,
  FileX2,
  PackageX,
  Pill,
  ShieldAlert,
  Stethoscope,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"
import {
  getAdminStats,
  getCashierStats,
  getDoctorStats,
  getNurseStats,
  getPharmacistStats,
  getReceptionistStats,
} from "@/lib/dashboard/stats"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Selamat pagi"
  if (h < 15) return "Selamat siang"
  if (h < 18) return "Selamat sore"
  return "Selamat malam"
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUserWithRole()

  if (!user) redirect("/sign-in")

  if (!user.role) {
    return (
      <div className="container mx-auto max-w-lg p-6 pt-16">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-950/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50">
              <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-orange-900 dark:text-orange-100">
                Akun belum memiliki role
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Hubungi administrator untuk menetapkan role sebelum mengakses sistem.
              </p>
              <div className="mt-4 space-y-0.5 font-mono text-xs text-orange-600/70 dark:text-orange-400/70">
                <p>{user.name}</p>
                <p>{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const roleInfo = ROLE_INFO[user.role]
  const greeting = getGreeting()
  const today = getTodayLabel()

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-4 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-widest uppercase">
            {today}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, <span className="text-foreground font-bold">{user.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{roleInfo.description}</p>
        </div>
        <Badge className={cn(roleInfo.color, "self-start text-white sm:self-auto")}>
          {roleInfo.label}
        </Badge>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(user.role === "super_admin" || user.role === "admin") && (
          <AdminStatsCards userId={user.id} />
        )}
        {user.role === "doctor" && <DoctorStatsCards doctorId={user.id} />}
        {user.role === "nurse" && <NurseStatsCards />}
        {user.role === "pharmacist" && <PharmacistStatsCards />}
        {user.role === "cashier" && <CashierStatsCards />}
        {user.role === "receptionist" && <ReceptionistStatsCards />}
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

type Accent = "success" | "warning" | "danger" | "neutral"

const accentConfig: Record<
  Accent,
  { topBorder: string; iconRing: string; iconText: string; valueText: string }
> = {
  success: {
    topBorder: "border-t-emerald-500",
    iconRing: "bg-emerald-50 dark:bg-emerald-950/50",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    topBorder: "border-t-amber-500",
    iconRing: "bg-amber-50 dark:bg-amber-950/50",
    iconText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    topBorder: "border-t-red-500",
    iconRing: "bg-red-50 dark:bg-red-950/50",
    iconText: "text-red-600 dark:text-red-400",
    valueText: "text-red-700 dark:text-red-300",
  },
  neutral: {
    topBorder: "border-t-border",
    iconRing: "bg-muted/60",
    iconText: "text-muted-foreground",
    valueText: "text-foreground",
  },
}

function StatCard({
  title,
  value,
  sub,
  Icon,
  accent = "neutral",
}: {
  title: string
  value: string | number
  sub: string
  Icon: ElementType
  accent?: Accent
}) {
  const s = accentConfig[accent]
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-3 rounded-xl border border-t-[3px] p-5 shadow-sm",
        s.topBorder
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-sm leading-snug font-medium">{title}</p>
        <div
          className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.iconRing)}
        >
          <Icon className={cn("h-4 w-4", s.iconText)} />
        </div>
      </div>
      <div>
        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", s.valueText)}>{value}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
      </div>
    </div>
  )
}

// ── Role stat groups ───────────────────────────────────────────────────────────

async function AdminStatsCards(_: { userId: string }) {
  const stats = await getAdminStats()
  return (
    <>
      <StatCard
        title="Kunjungan Hari Ini"
        value={stats.todayVisits}
        sub="total kunjungan"
        Icon={Users}
      />
      <StatCard
        title="Pendapatan Hari Ini"
        value={formatCurrency(stats.todayRevenue)}
        sub="dari pembayaran masuk"
        Icon={TrendingUp}
        accent={stats.todayRevenue > 0 ? "success" : "neutral"}
      />
      <StatCard
        title="Tagihan Belum Lunas"
        value={stats.pendingBillings}
        sub="menunggu pembayaran"
        Icon={AlertTriangle}
        accent={stats.pendingBillings > 0 ? "warning" : "neutral"}
      />
    </>
  )
}

async function DoctorStatsCards({ doctorId }: { doctorId: string }) {
  const stats = await getDoctorStats(doctorId)
  return (
    <>
      <StatCard
        title="Antrian Pasien"
        value={stats.todayWaiting}
        sub="menunggu / dalam pemeriksaan"
        Icon={Clock}
        accent={stats.todayWaiting > 0 ? "warning" : "neutral"}
      />
      <StatCard
        title="Pasien Selesai"
        value={stats.todayCompleted}
        sub="diperiksa hari ini"
        Icon={CheckCircle2}
        accent={stats.todayCompleted > 0 ? "success" : "neutral"}
      />
      <StatCard
        title="RME Belum Dikunci"
        value={stats.unlockedRecords}
        sub="rekam medis perlu dikunci"
        Icon={FileX2}
        accent={stats.unlockedRecords > 0 ? "danger" : "neutral"}
      />
    </>
  )
}

async function NurseStatsCards() {
  const stats = await getNurseStats()
  return (
    <>
      <StatCard
        title="Pasien Rawat Inap"
        value={stats.activeInpatients}
        sub="pasien aktif"
        Icon={BedDouble}
      />
      <StatCard
        title="Kamar Tersedia"
        value={stats.availableRooms}
        sub="siap digunakan"
        Icon={DoorOpen}
        accent={stats.availableRooms === 0 ? "danger" : "success"}
      />
      <StatCard
        title="Masuk Hari Ini"
        value={stats.todayVitals}
        sub="pasien rawat inap baru"
        Icon={Activity}
      />
    </>
  )
}

async function PharmacistStatsCards() {
  const stats = await getPharmacistStats()
  return (
    <>
      <StatCard
        title="Resep Pending"
        value={stats.pendingPrescriptions}
        sub="belum disiapkan"
        Icon={Pill}
        accent={stats.pendingPrescriptions > 0 ? "warning" : "neutral"}
      />
      <StatCard
        title="Stok Hampir Habis"
        value={stats.lowStockItems}
        sub="< 10 unit tersisa"
        Icon={PackageX}
        accent={stats.lowStockItems > 0 ? "danger" : "neutral"}
      />
      <StatCard
        title="Hampir Kadaluarsa"
        value={stats.expiringItems}
        sub="dalam 30 hari ke depan"
        Icon={Timer}
        accent={stats.expiringItems > 0 ? "warning" : "neutral"}
      />
    </>
  )
}

async function CashierStatsCards() {
  const stats = await getCashierStats()
  return (
    <>
      <StatCard
        title="Tagihan Belum Lunas"
        value={stats.pendingBillings}
        sub="menunggu pembayaran"
        Icon={CreditCard}
        accent={stats.pendingBillings > 0 ? "warning" : "neutral"}
      />
      <StatCard
        title="Pendapatan Hari Ini"
        value={formatCurrency(stats.todayRevenue)}
        sub="total pembayaran masuk"
        Icon={TrendingUp}
        accent={stats.todayRevenue > 0 ? "success" : "neutral"}
      />
      <StatCard
        title="Tunai Hari Ini"
        value={formatCurrency(stats.todayCash)}
        sub="dari pembayaran cash"
        Icon={Banknote}
      />
    </>
  )
}

async function ReceptionistStatsCards() {
  const stats = await getReceptionistStats()
  return (
    <>
      <StatCard
        title="Kunjungan Hari Ini"
        value={stats.todayVisits}
        sub="total kunjungan"
        Icon={Stethoscope}
      />
      <StatCard
        title="Pasien Baru"
        value={stats.newPatients}
        sub="registrasi baru hari ini"
        Icon={UserPlus}
        accent={stats.newPatients > 0 ? "success" : "neutral"}
      />
      <StatCard
        title="Antrian Aktif"
        value={stats.activeQueue}
        sub="sedang menunggu / diperiksa"
        Icon={Wallet}
        accent={stats.activeQueue > 0 ? "warning" : "neutral"}
      />
    </>
  )
}
