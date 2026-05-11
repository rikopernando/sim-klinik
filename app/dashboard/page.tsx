import { redirect } from "next/navigation"
import { getCurrentUserWithRole } from "@/lib/rbac/session"
import { ROLE_INFO } from "@/types/rbac"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/billing/billing-utils"
import {
  getAdminStats,
  getDoctorStats,
  getNurseStats,
  getPharmacistStats,
  getCashierStats,
  getReceptionistStats,
} from "@/lib/dashboard/stats"

export default async function DashboardPage() {
  const user = await getCurrentUserWithRole()

  if (!user) redirect("/sign-in")

  if (!user.role) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle>No Role Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Please contact your administrator to assign you a role before you can access the
              system.
            </p>
            <div className="text-muted-foreground mt-4 text-xs">
              <p>Email: {user.email}</p>
              <p>Name: {user.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const roleInfo = ROLE_INFO[user.role]

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user.name} ·{" "}
          <Badge className={`${roleInfo.color} text-white`}>{roleInfo.label}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

// ── Stat card primitive ───────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string
  value: string | number
  sub: string
  accent?: "warning" | "danger" | "success"
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={
            accent === "danger"
              ? "text-3xl font-bold text-red-600"
              : accent === "warning"
                ? "text-3xl font-bold text-amber-600"
                : accent === "success"
                  ? "text-3xl font-bold text-emerald-600"
                  : "text-3xl font-bold"
          }
        >
          {value}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
      </CardContent>
    </Card>
  )
}

// ── Role stat sections (each is async) ────────────────────────────────────────

async function AdminStatsCards(_: { userId: string }) {
  const stats = await getAdminStats()
  return (
    <>
      <StatCard title="Kunjungan Hari Ini" value={stats.todayVisits} sub="total kunjungan" />
      <StatCard
        title="Pendapatan Hari Ini"
        value={formatCurrency(stats.todayRevenue)}
        sub="dari pembayaran masuk"
        accent={stats.todayRevenue > 0 ? "success" : undefined}
      />
      <StatCard
        title="Tagihan Belum Lunas"
        value={stats.pendingBillings}
        sub="menunggu pembayaran"
        accent={stats.pendingBillings > 0 ? "warning" : undefined}
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
        accent={stats.todayWaiting > 0 ? "warning" : undefined}
      />
      <StatCard
        title="Pasien Selesai"
        value={stats.todayCompleted}
        sub="diperiksa hari ini"
        accent={stats.todayCompleted > 0 ? "success" : undefined}
      />
      <StatCard
        title="RME Belum Dikunci"
        value={stats.unlockedRecords}
        sub="rekam medis perlu dikunci"
        accent={stats.unlockedRecords > 0 ? "danger" : undefined}
      />
    </>
  )
}

async function NurseStatsCards() {
  const stats = await getNurseStats()
  return (
    <>
      <StatCard title="Pasien Rawat Inap" value={stats.activeInpatients} sub="pasien aktif" />
      <StatCard
        title="Kamar Tersedia"
        value={stats.availableRooms}
        sub="siap digunakan"
        accent={stats.availableRooms === 0 ? "danger" : "success"}
      />
      <StatCard title="Masuk Hari Ini" value={stats.todayVitals} sub="pasien rawat inap baru" />
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
        accent={stats.pendingPrescriptions > 0 ? "warning" : undefined}
      />
      <StatCard
        title="Stok Hampir Habis"
        value={stats.lowStockItems}
        sub="< 10 unit tersisa"
        accent={stats.lowStockItems > 0 ? "danger" : undefined}
      />
      <StatCard
        title="Hampir Kadaluarsa"
        value={stats.expiringItems}
        sub="dalam 30 hari ke depan"
        accent={stats.expiringItems > 0 ? "warning" : undefined}
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
        accent={stats.pendingBillings > 0 ? "warning" : undefined}
      />
      <StatCard
        title="Pendapatan Hari Ini"
        value={formatCurrency(stats.todayRevenue)}
        sub="total pembayaran masuk"
        accent={stats.todayRevenue > 0 ? "success" : undefined}
      />
      <StatCard
        title="Tunai Hari Ini"
        value={formatCurrency(stats.todayCash)}
        sub="dari pembayaran cash"
      />
    </>
  )
}

async function ReceptionistStatsCards() {
  const stats = await getReceptionistStats()
  return (
    <>
      <StatCard title="Kunjungan Hari Ini" value={stats.todayVisits} sub="total kunjungan" />
      <StatCard
        title="Pasien Baru"
        value={stats.newPatients}
        sub="registrasi baru hari ini"
        accent={stats.newPatients > 0 ? "success" : undefined}
      />
      <StatCard
        title="Antrian Aktif"
        value={stats.activeQueue}
        sub="sedang menunggu / diperiksa"
        accent={stats.activeQueue > 0 ? "warning" : undefined}
      />
    </>
  )
}
