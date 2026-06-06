/**
 * Reusable List Item Component for RME lists
 */

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ListItemProps {
  children: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  showEdit?: boolean
  showDelete?: boolean
  className?: string
}

export function ListItem({
  children,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  className,
}: ListItemProps) {
  const hasActions = (showEdit && onEdit) || (showDelete && onDelete)

  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30 ${className || ""}`}>
      <div className="flex-1 min-w-0">{children}</div>
      {hasActions && (
        <div className="flex shrink-0 gap-1">
          {showEdit && onEdit && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          )}
          {showDelete && onDelete && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="text-destructive h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
