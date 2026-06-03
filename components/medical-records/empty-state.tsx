import { FileText } from "lucide-react"

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
      <FileText className="text-muted-foreground/40 h-8 w-8" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
