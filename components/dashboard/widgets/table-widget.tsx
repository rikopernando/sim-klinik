/**
 * Table Widget Component (H.3.1)
 * Display tabular data with sorting and actions
 */

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { DashboardWidget } from "../dashboard-widget"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface TableColumn<T> {
  header: string
  accessorKey: keyof T | string
  cell?: (row: T) => ReactNode
  className?: string
}

export interface TableWidgetProps<T> {
  title: string
  description?: string
  icon?: LucideIcon
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  maxHeight?: string
  headerAction?: ReactNode
  className?: string
  onRowClick?: (row: T) => void
}

export function TableWidget<T extends Record<string, any>>({
  title,
  description,
  icon,
  columns,
  data,
  emptyMessage = "Tidak ada data",
  maxHeight = "400px",
  headerAction,
  className,
  onRowClick,
}: TableWidgetProps<T>) {
  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (column.cell) {
      return column.cell(row)
    }
    return row[column.accessorKey as keyof T]
  }

  return (
    <DashboardWidget
      title={title}
      description={description}
      icon={icon}
      headerAction={headerAction}
      className={className}
    >
      {data.length === 0 ? (
        <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </DashboardWidget>
  )
}
