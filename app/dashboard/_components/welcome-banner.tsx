import { cn } from "@/lib/utils"

interface WelcomeBannerProps {
  greeting: string
  today: string
  name: string
  roleInfo: { label: string; description: string; color: string }
}

export function WelcomeBanner({ greeting, today, name, roleInfo }: WelcomeBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(26,61,46,0.06) 0%, rgba(82,183,136,0.04) 50%, transparent 100%)",
      }}
    >
      {/* Decorative circles */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(82,183,136,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-12 right-16 h-28 w-28 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(116,198,157,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p
            className="mb-2 text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: "#52b788" }}
          >
            {today}
          </p>
          <h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-parkinsans), sans-serif" }}
          >
            {greeting},{" "}
            <span style={{ color: "#1a3d2e" }} className="dark:text-[#74c69d]">
              {name}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{roleInfo.description}</p>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold text-white",
            roleInfo.color
          )}
        >
          {roleInfo.label}
        </span>
      </div>
    </div>
  )
}
