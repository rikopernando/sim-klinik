import { type ElementType } from "react"
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
  Stethoscope,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react"
import { formatCurrency } from "@/lib/billing/billing-utils"
import { cn } from "@/lib/utils"
import {
  getAdminStats,
  getCashierStats,
  getDoctorStats,
  getNurseStats,
  getPharmacistStats,
  getReceptionistStats,
} from "@/lib/dashboard/stats"
import type { UserRole } from "@/types/rbac"

// ── Config ────────────────────────────────────────────────────────────────────

type StatAccent = "success" | "warning" | "danger" | "neutral"

const STAT_ACCENTS: Record<
  StatAccent,
  { border: string; iconBg: string; iconText: string; valueText: string }
> = {
  success: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    border: "border-l-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    border: "border-l-red-500",
    iconBg: "bg-red-50 dark:bg-red-950/50",
    iconText: "text-red-600 dark:text-red-400",
    valueText: "text-red-700 dark:text-red-300",
  },
  neutral: {
    border: "border-l-[#74c69d]",
    iconBg: "bg-[#52b788]/10",
    iconText: "text-[#2d6a4f]",
    valueText: "text-foreground",
  },
}

// ── StatCard ──────────────────────────────────────────────────────────────────

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
  accent?: StatAccent
}) {
  const s = STAT_ACCENTS[accent]
  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-4 rounded-xl border border-l-4 p-5 shadow-sm",
        "transition-shadow duration-200 hover:shadow-md",
        s.border
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", s.iconBg)}
        >
          <Icon className={cn("h-4 w-4", s.iconText)} />
        </div>
        <p
          className={cn(
            "text-right font-mono text-3xl font-bold tracking-tight tabular-nums",
            s.valueText
          )}
        >
          {value}
        </p>
      </div>
      <div>
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
      </div>
    </div>
  )
}

// ── Role stat groups ──────────────────────────────────────────────────────────

async function AdminStatsCards() {
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

// ── Public dispatcher ─────────────────────────────────────────────────────────

export function DashboardStatCards({ role, doctorId }: { role: UserRole; doctorId: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {(role === "super_admin" || role === "admin") && <AdminStatsCards />}
      {role === "doctor" && <DoctorStatsCards doctorId={doctorId} />}
      {role === "nurse" && <NurseStatsCards />}
      {role === "pharmacist" && <PharmacistStatsCards />}
      {role === "cashier" && <CashierStatsCards />}
      {role === "receptionist" && <ReceptionistStatsCards />}
    </div>
  )
}
