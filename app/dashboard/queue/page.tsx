"use client"

import { PageGuard } from "@/components/auth/page-guard"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

import { QueueDisplay } from "@/components/visits/queue-display"
import { QueueDateFilter } from "@/components/visits/queue-date-filter"
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Poli } from "@/types/poli"
import { getPolisRequest } from "@/lib/services/poli.service"

export default function QueuePage() {
  return (
    <PageGuard permissions={["visits:read"]}>
      <QueuePageContent />
    </PageGuard>
  )
}

function QueuePageContent() {
  const [selectedPoli, setSelectedPoli] = useState<number | undefined>(undefined)
  const [polis, setPolis] = useState<Poli[]>([])
  const [isLoadingPolis, setIsLoadingPolis] = useState(true)
  const [counts, setCounts] = useState({ outpatient: 0, emergency: 0, inpatient: 0 })

  const [dateFilter, setDateFilter] = useState<{
    date: string | undefined
    dateFrom: string | undefined
    dateTo: string | undefined
  }>({
    date: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  })

  const handleDateChange = (
    date: string | undefined,
    dateFrom: string | undefined,
    dateTo: string | undefined
  ) => {
    setDateFilter({ date, dateFrom, dateTo })
  }

  useEffect(() => {
    const fetchPolis = async () => {
      try {
        const response = await getPolisRequest()
        setPolis(response?.data || [])
      } catch (error) {
        console.error("Error fetching polis:", error)
      } finally {
        setIsLoadingPolis(false)
      }
    }

    fetchPolis()
  }, [])

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const params = new URLSearchParams()
        if (dateFilter.date) params.set("date", dateFilter.date)
        const response = await fetch(`/api/visits/counts?${params.toString()}`)
        if (!response.ok) return
        const data = await response.json()
        if (data.success) setCounts(data.data)
      } catch {
        // silently ignore count fetch errors
      }
    }

    fetchCounts()
  }, [dateFilter.date])

  return (
    <div>
      <PageHeader title="Antrian Pasien" description="Pantau antrian pasien per layanan" />

      <div className="container mx-auto max-w-5xl space-y-6 px-6 py-6">
        <Tabs defaultValue="outpatient" className="space-y-4">
          <TabsList className="inline-flex">
            <TabsTrigger value="outpatient" className="gap-1.5">
              Rawat Jalan
              {counts.outpatient > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {counts.outpatient}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-1.5">
              UGD
              {counts.emergency > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {counts.emergency}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="inpatient" className="gap-1.5">
              Rawat Inap
              {counts.inpatient > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums">
                  {counts.inpatient}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Outpatient Queue */}
          <TabsContent value="outpatient" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Poli:</span>
                <Select
                  value={selectedPoli?.toString()}
                  onValueChange={(value) =>
                    setSelectedPoli(value === "all" ? undefined : parseInt(value))
                  }
                  disabled={isLoadingPolis}
                >
                  <SelectTrigger className="w-[180px]">
                    {isLoadingPolis ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memuat...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Semua Poli" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Poli</SelectItem>
                    {polis.map((poli) => (
                      <SelectItem key={poli.id} value={poli.id.toString()}>
                        {poli.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="bg-border h-5 w-px" />
              <QueueDateFilter onDateChange={handleDateChange} />
            </div>

            <QueueDisplay
              visitType="outpatient"
              poliId={selectedPoli}
              autoRefresh={true}
              refreshInterval={30000}
              date={dateFilter.date}
              dateFrom={dateFilter.dateFrom}
              dateTo={dateFilter.dateTo}
            />
          </TabsContent>

          {/* Emergency Queue */}
          <TabsContent value="emergency" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <QueueDateFilter onDateChange={handleDateChange} />
            </div>
            <p className="text-muted-foreground text-sm">
              Diurutkan berdasarkan tingkat kegawatan (triage)
            </p>

            <QueueDisplay
              visitType="emergency"
              autoRefresh={true}
              refreshInterval={15000}
              date={dateFilter.date}
              dateFrom={dateFilter.dateFrom}
              dateTo={dateFilter.dateTo}
            />
          </TabsContent>

          {/* Inpatient Queue */}
          <TabsContent value="inpatient" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <QueueDateFilter onDateChange={handleDateChange} />
            </div>

            <QueueDisplay
              visitType="inpatient"
              autoRefresh={true}
              refreshInterval={60000}
              date={dateFilter.date}
              dateFrom={dateFilter.dateFrom}
              dateTo={dateFilter.dateTo}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
