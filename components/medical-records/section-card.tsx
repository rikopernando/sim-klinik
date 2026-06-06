import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerAction,
}: SectionCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border shadow-sm", className)}>
      <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <div>
          <p className="font-semibold">{title}</p>
          {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
