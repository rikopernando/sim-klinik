/**
 * Lab Technician Queue Page
 * Dedicated worklist for lab technicians to process orders
 */

"use client"

import { useState } from "react"
import { startOfDay, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { IconFlask, IconRefresh } from "@tabler/icons-react"
import { PageGuard } from "@/components/auth/page-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LabOrderQueueTable } from "@/components/laboratory"
import { LabDateFilter } from "@/components/laboratory/lab-date-filter"

export default function LabTechnicianQueuePage() {
  return (
    <PageGuard permissions={["lab:read"]}>
      <LabTechnicianQueuePageContent />
    </PageGuard>
  )
}

function LabTechnicianQueuePageContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))

  const handleManualRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleDateChange = (dateFrom: Date | undefined) => {
    if (dateFrom) {
      setSelectedDate(dateFrom)
      // Force refresh when date changes
      setRefreshKey((prev) => prev + 1)
    }
  }

  const currentDateDisplay = format(selectedDate, "d MMMM yyyy", { locale: idLocale })

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="bg-primary mt-1.5 h-5 w-1 shrink-0 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Antrian Pemeriksaan Penunjang</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Worklist teknisi laboratorium — {currentDateDisplay}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LabDateFilter onDateChange={handleDateChange} initialDate={selectedDate} />
          <Button onClick={handleManualRefresh} variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for different status groups */}
      <Tabs defaultValue="actionable" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex">
            <TabsTrigger value="actionable">Perlu Diproses</TabsTrigger>
            <TabsTrigger value="urgent">Urgent/STAT</TabsTrigger>
            <TabsTrigger value="in-progress">Sedang Dikerjakan</TabsTrigger>
            <TabsTrigger value="completed">Selesai Hari Ini</TabsTrigger>
          </TabsList>
        </div>

        {/* Actionable Orders (Ordered + Specimen Collected) */}
        <TabsContent value="actionable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order yang Perlu Diproses</CardTitle>
              <CardDescription>
                Order yang menunggu pengambilan spesimen atau sudah siap untuk dianalisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LabOrderQueueTable
                key={`actionable-${refreshKey}-${selectedDate.getTime()}`}
                defaultStatus={["ordered", "specimen_collected"]}
                showFilters
                dateFrom={selectedDate}
                dateTo={selectedDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Urgent/STAT Orders */}
        <TabsContent value="urgent" className="space-y-4">
          <div className="space-y-4">
            {/* STAT Orders */}
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">🔴 STAT (Segera)</CardTitle>
                <CardDescription>Prioritas tertinggi - Harus selesai dalam 1 jam</CardDescription>
              </CardHeader>
              <CardContent>
                <LabOrderQueueTable
                  key={`stat-${refreshKey}-${selectedDate.getTime()}`}
                  defaultStatus={["ordered", "specimen_collected", "in_progress"]}
                  showFilters={false}
                  dateFrom={selectedDate}
                  dateTo={selectedDate}
                />
              </CardContent>
            </Card>

            {/* Urgent Orders */}
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <CardHeader>
                <CardTitle className="text-orange-700 dark:text-orange-400">🟠 URGENT</CardTitle>
                <CardDescription>Prioritas tinggi - Target selesai dalam 4 jam</CardDescription>
              </CardHeader>
              <CardContent>
                <LabOrderQueueTable
                  key={`urgent-${refreshKey}-${selectedDate.getTime()}`}
                  defaultStatus={["ordered", "specimen_collected", "in_progress"]}
                  showFilters={false}
                  dateFrom={selectedDate}
                  dateTo={selectedDate}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* In Progress Orders */}
        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Sedang Dikerjakan</CardTitle>
              <CardDescription>
                Order yang sudah dimulai analisisnya dan perlu input hasil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LabOrderQueueTable
                key={`in-progress-${refreshKey}-${selectedDate.getTime()}`}
                defaultStatus="in_progress"
                showFilters
                dateFrom={selectedDate}
                dateTo={selectedDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Orders */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Selesai {currentDateDisplay}</CardTitle>
              <CardDescription>
                Order yang sudah selesai diproses dan menunggu verifikasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LabOrderQueueTable
                key={`completed-${refreshKey}-${selectedDate.getTime()}`}
                defaultStatus={["completed", "verified"]}
                showFilters
                dateFrom={selectedDate}
                dateTo={selectedDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card className="bg-muted/50 py-0">
        <CardContent className="py-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              💡 <span className="font-medium">Tips:</span> Proses order STAT dan Urgent terlebih
              dahulu. Gunakan filter untuk mempersempit pencarian. Refresh otomatis membantu Anda
              selalu mendapat update terbaru.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
