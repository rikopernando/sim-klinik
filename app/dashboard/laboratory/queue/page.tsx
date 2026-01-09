/**
 * Lab Technician Queue Page
 * Dedicated worklist for lab technicians to process orders
 */

"use client"

import { useState, useEffect } from "react"
import { IconFlask, IconRefresh, IconAlertCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LabOrderQueueTable } from "@/components/laboratory"

export default function LabTechnicianQueuePage() {
  const [myOrdersOnly, setMyOrdersOnly] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleManualRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <IconFlask className="h-8 w-8" />
            Antrian Laboratorium
          </h1>
          <p className="text-muted-foreground mt-1">
            Worklist untuk teknisi laboratorium - Proses order sesuai prioritas
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh" className="cursor-pointer">
              Auto-refresh (30s)
            </Label>
          </div>

          {/* Manual refresh button */}
          <Button onClick={handleManualRefresh} variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* My Orders Filter */}
      <Card className="border-blue-200 bg-blue-50 py-0 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Filter Antrian</p>
              <p className="text-muted-foreground text-sm">
                Tampilkan hanya order yang sedang Anda kerjakan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="my-orders" checked={myOrdersOnly} onCheckedChange={setMyOrdersOnly} />
            <Label htmlFor="my-orders" className="cursor-pointer font-medium">
              Order Saya Saja
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different status groups */}
      <Tabs defaultValue="actionable" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actionable" className="gap-2">
            🎯 Perlu Diproses
          </TabsTrigger>
          <TabsTrigger value="urgent" className="gap-2">
            🚨 Urgent/STAT
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2">
            ⏳ Sedang Dikerjakan
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            ✅ Selesai Hari Ini
          </TabsTrigger>
        </TabsList>

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
                key={`actionable-${refreshKey}`}
                defaultStatus={["ordered", "specimen_collected"]}
                showFilters
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
                  key={`stat-${refreshKey}`}
                  defaultStatus={["ordered", "specimen_collected", "in_progress"]}
                  showFilters={false}
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
                  key={`urgent-${refreshKey}`}
                  defaultStatus={["ordered", "specimen_collected", "in_progress"]}
                  showFilters={false}
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
                key={`in-progress-${refreshKey}`}
                defaultStatus="in_progress"
                showFilters
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Orders */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Selesai Hari Ini</CardTitle>
              <CardDescription>
                Order yang sudah selesai diproses dan menunggu verifikasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LabOrderQueueTable
                key={`completed-${refreshKey}`}
                defaultStatus={["completed", "verified"]}
                showFilters
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
