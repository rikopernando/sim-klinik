import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ShieldAlert } from "lucide-react"
import { getCurrentUserWithRole } from "@/lib/rbac/session"
import { ROLE_INFO } from "@/types/rbac"
import { WelcomeBanner } from "./_components/welcome-banner"
import { DashboardStatCards } from "./_components/stat-cards"
import { QuickActions } from "./_components/quick-actions"
import { RecentVisits, RecentVisitsSkeleton } from "./_components/recent-visits"

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

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      <WelcomeBanner
        greeting={getGreeting()}
        today={getTodayLabel()}
        name={user.name}
        roleInfo={roleInfo}
      />
      <DashboardStatCards role={user.role} doctorId={user.id} />
      <QuickActions role={user.role} />
      <Suspense fallback={<RecentVisitsSkeleton />}>
        <RecentVisits />
      </Suspense>
    </div>
  )
}
