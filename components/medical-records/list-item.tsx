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
    <div className={`flex items-center justify-between rounded-lg border p-4 ${className || ""}`}>
      <div className="flex-1">{children}</div>
      {hasActions && (
        <div className="flex gap-1">
          {showEdit && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="text-muted-foreground h-4 w-4" />
            </Button>
          )}
          {showDelete && onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
