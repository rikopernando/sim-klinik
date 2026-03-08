/**
 * Lab Order Queue Table Component
 * Displays lab orders queue for technicians to process
 */

"use client"

import { useMemo, useState } from "react"
import { IconFlask } from "@tabler/icons-react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useLabOrders } from "@/hooks/use-lab-orders"
import type { LAB_DEPARTMENTS, OrderStatus } from "@/types/lab"

import { LabOrderRow } from "./lab-order-row"
import { LabPagination } from "./lab-pagination"

interface LabOrderQueueTableProps {
  defaultStatus?: OrderStatus | OrderStatus[]
  showFilters?: boolean
  dateFrom?: Date
  dateTo?: Date
}

type UrgencyFilter = "all" | "urgent" | "stat"
type DepartmentFilter = "all" | keyof typeof LAB_DEPARTMENTS | undefined

export function LabOrderQueueTable({
  defaultStatus,
  showFilters = true,
  dateFrom,
  dateTo,
}: LabOrderQueueTableProps) {
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all")

  const { orders, loading, pagination, refetch, setDepartment, handlePageChange } = useLabOrders({
    initialFilters: {
      ...(defaultStatus ? { status: defaultStatus } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    },
    autoFetch: true,
    defaultToToday: !dateFrom && !dateTo, // Only default to today if no dates provided
  })

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value as DepartmentFilter)
    setDepartment(value === "all" ? undefined : (value as keyof typeof LAB_DEPARTMENTS | undefined))
  }

  // Filter by urgency (client-side for now)
  const filteredOrders = useMemo(() => {
    if (urgencyFilter === "all") return orders
    return orders.filter((order) => order.urgency === urgencyFilter)
  }, [orders, urgencyFilter])

  // Sort orders: urgent/stat first, then by order date
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      // Urgent orders first
      const urgencyOrder = { stat: 0, urgent: 1, routine: 2 }
      const aUrgency = urgencyOrder[a.urgency || "routine"] ?? 2
      const bUrgency = urgencyOrder[b.urgency || "routine"] ?? 2

      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency
      }

      // Then by order date (oldest first)
      return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime()
    })
  }, [filteredOrders])

  const tableRows = useMemo(
    () =>
      sortedOrders.map((order, index) => (
        <LabOrderRow key={order.id} order={order} index={index} onSuccess={refetch} />
      )),
    [sortedOrders, refetch]
  )

  return (
    <Card>
      {showFilters && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground text-sm font-medium">Filter</div>
            <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                <SelectItem value="LAB">Laboratorium</SelectItem>
                <SelectItem value="RAD">Radiologi</SelectItem>
                <SelectItem value="EKG">EKG</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={urgencyFilter}
              onValueChange={(value) => setUrgencyFilter(value as UrgencyFilter)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Urgensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Urgensi</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="py-12 text-center">
            <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground text-sm">Tidak ada order dalam antrian</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[200px]">Tes / Pasien</TableHead>
                  <TableHead className="min-w-[150px]">Detail Order</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[180px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{tableRows}</TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="border-t pt-4">
                <LabPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  itemLabel="order"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
