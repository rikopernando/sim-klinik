import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b", className)}>
      <div className="container mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 pt-6 pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary mt-1 h-6 w-1 shrink-0 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
          </div>
        </div>
        {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
      </div>
    </div>
  )
}
