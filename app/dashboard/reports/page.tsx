"use client"

import { useCallback, useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { ReportHeader } from "@/components/reports/report-header"
import { ReportKpiCards } from "@/components/reports/report-kpi-cards"
import { RevenueTrendChart } from "@/components/reports/revenue-trend-chart"
import { ServiceTypeChart } from "@/components/reports/service-type-chart"
import { PaymentMethodChart } from "@/components/reports/payment-method-chart"
import { VisitTypeChart } from "@/components/reports/visit-type-chart"
import { KpiDetailSheet } from "@/components/reports/kpi-detail-sheet"
import { useReportFilters } from "@/hooks/use-report-filters"
import { useFinancialReport } from "@/hooks/use-financial-report"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import type { FinancialReportData, KpiKey } from "@/types/reports"

export default function ReportsPage() {
  return (
    <PageGuard permissions={["system:reports"]}>
      <ReportsContent />
    </PageGuard>
  )
}

function ReportsContent() {
  const filterHook = useReportFilters()
  const { data, isLoading, refresh } = useFinancialReport(filterHook.filters)
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null)

  const handleExport = useCallback(() => {
    if (!data) return
    const csv = buildCsv(data, filterHook.filters.dateFrom, filterHook.filters.dateTo)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan-keuangan-${filterHook.filters.dateFrom}-${filterHook.filters.dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data, filterHook.filters])

  return (
    <div className="container mx-auto space-y-6 p-6">
      <ReportHeader
        preset={filterHook.preset}
        dateFrom={filterHook.dateFrom}
        dateTo={filterHook.dateTo}
        isLoading={isLoading}
        onPresetChange={filterHook.setPreset}
        onDateFromChange={filterHook.setDateFrom}
        onDateToChange={filterHook.setDateTo}
        onRefresh={refresh}
        onExport={handleExport}
      />

      {isLoading || !data ? (
        <ReportsSkeleton />
      ) : (
        <>
          <ReportKpiCards
            summary={data.summary}
            previousSummary={data.previousSummary}
            onCardClick={setActiveKpi}
          />
          <RevenueTrendChart data={data.dailyTrend} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ServiceTypeChart data={data.byServiceType} />
            <PaymentMethodChart data={data.byPaymentMethod} />
          </div>
          <VisitTypeChart data={data.byVisitType} />
          <KpiDetailSheet
            kpi={activeKpi}
            open={activeKpi !== null}
            onOpenChange={(o) => !o && setActiveKpi(null)}
            filters={filterHook.filters}
            summary={data.summary}
          />
        </>
      )}
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function buildCsv(data: FinancialReportData, dateFrom: string, dateTo: string): string {
  const lines: string[] = []

  lines.push(`Laporan Keuangan,${dateFrom} - ${dateTo}`)
  lines.push("")

  lines.push("RINGKASAN")
  lines.push(`Total Tagihan,${data.summary.totalBilled}`)
  lines.push(`Total Terkumpul,${data.summary.totalCollected}`)
  lines.push(`Belum Lunas,${data.summary.outstanding}`)
  lines.push(`Collection Rate (%),${data.summary.collectionRate}`)
  lines.push(`Total Kunjungan,${data.summary.visitCount}`)
  lines.push(`Total Pasien,${data.summary.patientCount}`)
  lines.push(`Total Diskon,${data.summary.totalDiscount}`)
  lines.push("")

  lines.push("TREN HARIAN")
  lines.push("Tanggal,Pendapatan,Transaksi")
  data.dailyTrend.forEach((r) => lines.push(`${r.date},${r.revenue},${r.transactions}`))
  lines.push("")

  lines.push("PER JENIS LAYANAN")
  lines.push("Jenis,Pendapatan,Jumlah Item")
  data.byServiceType.forEach((r) => lines.push(`${r.serviceType},${r.revenue},${r.count}`))
  lines.push("")

  lines.push("PER METODE PEMBAYARAN")
  lines.push("Metode,Jumlah,Transaksi")
  data.byPaymentMethod.forEach((r) => lines.push(`${r.paymentMethod},${r.amount},${r.count}`))
  lines.push("")

  lines.push("PER JENIS KUNJUNGAN")
  lines.push("Jenis Kunjungan,Pendapatan,Kunjungan")
  data.byVisitType.forEach((r) => lines.push(`${r.visitType},${r.revenue},${r.count}`))

  return lines.join("\n")
}
