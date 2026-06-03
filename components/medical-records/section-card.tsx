import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border shadow-sm", className)}>
      <div className="border-b px-5 py-3">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
