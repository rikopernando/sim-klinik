"use client"

/**
 * Laboratory & Radiology Dashboard
 * Central hub for lab orders, results, and workflow management
 */

import { useState, useMemo } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import {
  IconFlask,
  IconRefresh,
  IconFilter,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconDroplet,
} from "@tabler/icons-react"
import { formatDistanceToNow, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLabOrders } from "@/hooks/use-lab-orders"
import { LabPagination } from "@/components/laboratory/lab-pagination"
import { LabDateFilter } from "@/components/laboratory/lab-date-filter"
import type { OrderStatus } from "@/types/lab"
import { formatCurrency } from "@/lib/utils/billing"

export default function LaboratoryDashboard() {
  return (
    <PageGuard permissions={["lab:read"]}>
      <LaboratoryDashboardContent />
    </PageGuard>
  )
}

function LaboratoryDashboardContent() {
  const [departmentFilter, setDepartmentFilter] = useState<"all" | "LAB" | "RAD">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all")

  const {
    orders,
    loading,
    filters,
    pagination,
    setDepartment,
    setStatus,
    setDateRange,
    handlePageChange,
    refetch,
  } = useLabOrders({
    initialFilters: {},
    autoFetch: true,
    defaultToToday: true,
  })

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value as "all" | "LAB" | "RAD")
    setDepartment(value === "all" ? undefined : (value as "LAB" | "RAD"))
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as "all" | OrderStatus)
    setStatus(value === "all" ? undefined : (value as OrderStatus))
  }

  const handleDateChange = (dateFrom: Date | undefined, dateTo: Date | undefined) => {
    setDateRange(dateFrom, dateTo)
  }

  // Calculate statistics from current page orders
  // Note: These stats are for the current filtered view only
  const stats = useMemo(
    () => ({
      total: pagination?.total ?? orders.length,
      pending: orders.filter((o) => o.status === "ordered").length,
      inProgress: orders.filter((o) =>
        ["specimen_collected", "in_progress"].includes(o.status || "")
      ).length,
      completed: orders.filter((o) => ["completed", "verified"].includes(o.status || "")).length,
      urgent: orders.filter((o) => o.urgency === "urgent" || o.urgency === "stat").length,
    }),
    [orders, pagination]
  )

  // Get current date for display
  const currentDateDisplay = filters.dateFrom
    ? format(filters.dateFrom, "d MMMM yyyy", { locale: idLocale })
    : "Hari Ini"

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default">
            <IconCheck className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary">
            <IconCheck className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600">
            <IconClock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "specimen_collected":
        return (
          <Badge variant="outline" className="border-blue-600 text-blue-600">
            <IconDroplet className="mr-1 h-3 w-3" />
            Specimen Collected
          </Badge>
        )
      case "ordered":
        return (
          <Badge variant="outline" className="border-yellow-600 text-yellow-600">
            <IconClock className="mr-1 h-3 w-3" />
            Ordered
          </Badge>
        )
      case "cancelled":
      case "rejected":
        return (
          <Badge variant="destructive">
            <IconAlertCircle className="mr-1 h-3 w-3" />
            {status === "cancelled" ? "Cancelled" : "Rejected"}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <IconFlask className="h-8 w-8" />
            Daftar Pemeriksaan Laboratorium
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola pemeriksaan penunjang diagnostik - {currentDateDisplay}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <LabDateFilter onDateChange={handleDateChange} initialDate={filters.dateFrom} />
          <Button onClick={refetch} variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Total Order</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Semua order {currentDateDisplay}</p>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Menunggu</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Belum diproses</p>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Dalam Proses</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Sedang dikerjakan</p>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Selesai</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Hasil tersedia</p>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardDescription>Urgent</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.urgent}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Prioritas tinggi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Order</CardTitle>
              <CardDescription>Kelola dan pantau order laboratorium & radiologi</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <IconFilter className="text-muted-foreground h-4 w-4" />
              <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  <SelectItem value="LAB">Laboratorium</SelectItem>
                  <SelectItem value="RAD">Radiologi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="specimen_collected">Spesimen Collected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <IconFlask className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Tidak ada order ditemukan untuk {currentDateDisplay}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="hover:bg-accent/50 py-0 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{order.test?.name || "Test Unknown"}</h4>
                          <Badge
                            variant={order.test?.department === "LAB" ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {order.test?.department}
                          </Badge>
                          {order.urgency && order.urgency !== "routine" && (
                            <Badge
                              variant={order.urgency === "stat" ? "destructive" : "default"}
                              className={order.urgency === "urgent" ? "bg-orange-500" : ""}
                            >
                              {order.urgency.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <span className="font-mono">{order.orderNumber}</span>
                          <span>•</span>
                          <span>{order.patient.name}</span>
                          <span>•</span>
                          <span>{order.patient.mrNumber}</span>
                        </div>
                        {order.clinicalIndication && (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            <span className="font-medium">Indikasi:</span>{" "}
                            {order.clinicalIndication}
                          </p>
                        )}
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>
                            Ordered{" "}
                            {formatDistanceToNow(new Date(order.orderedAt), {
                              addSuffix: true,
                              locale: idLocale,
                            })}
                          </span>
                          <span>•</span>
                          <span>oleh {order.orderedByUser.name}</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-primary text-sm font-semibold">
                          {formatCurrency(parseFloat(order.price))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination && (
                <div className="mt-4 border-t pt-4">
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
    </div>
  )
}
