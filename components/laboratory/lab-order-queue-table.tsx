/**
 * Lab Order Queue Table Component
 * Displays lab orders queue for technicians to process
 */

"use client"

import { useMemo, useState } from "react"
import { IconFlask, IconFilter, IconRefresh } from "@tabler/icons-react"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useLabOrders } from "@/hooks/use-lab-orders"
import type { OrderStatus } from "@/types/lab"

import { LabOrderRow } from "./lab-order-row"

interface LabOrderQueueTableProps {
  defaultStatus?: OrderStatus | OrderStatus[]
  showFilters?: boolean
  title?: string
  description?: string
}

type UrgencyFilter = "all" | "urgent" | "stat"
type DepartmentFilter = "all" | "LAB" | "RAD"

export function LabOrderQueueTable({
  defaultStatus,
  showFilters = true,
  title = "Antrian Order Laboratorium",
  description = "Proses dan kelola order pemeriksaan laboratorium",
}: LabOrderQueueTableProps) {
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all")

  const { orders, loading, refetch, setDepartment } = useLabOrders({
    initialFilters: defaultStatus ? { status: defaultStatus } : {},
    autoFetch: true,
  })

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value as DepartmentFilter)
    setDepartment(value === "all" ? undefined : (value as "LAB" | "RAD"))
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

  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      urgent: filteredOrders.filter((o) => o.urgency === "urgent" || o.urgency === "stat").length,
      stat: filteredOrders.filter((o) => o.urgency === "stat").length,
    }
  }, [filteredOrders])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconFlask className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description} • {stats.total} order
              {stats.urgent > 0 && (
                <>
                  {" "}
                  • <span className="font-medium text-orange-600">{stats.urgent} urgent</span>
                </>
              )}
              {stats.stat > 0 && (
                <>
                  {" "}
                  • <span className="font-medium text-red-600">{stats.stat} STAT</span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 pt-4">
            <IconFilter className="text-muted-foreground h-4 w-4" />
            <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                <SelectItem value="LAB">Laboratorium</SelectItem>
                <SelectItem value="RAD">Radiologi</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={urgencyFilter}
              onValueChange={(value) => setUrgencyFilter(value as UrgencyFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Urgensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Urgensi</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>

            {stats.total > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline">{stats.total} total</Badge>
              </div>
            )}
          </div>
        )}
      </CardHeader>
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
          <div className="rounded-md border">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
