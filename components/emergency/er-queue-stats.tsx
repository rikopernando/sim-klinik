/**
 * ER Queue Statistics Component
 * Displays triage statistics in card format
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TriageStatistics } from "@/types/emergency"

interface ERQueueStatsProps {
  statistics: TriageStatistics
}

export function ERQueueStats({ statistics }: ERQueueStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Queue */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Antrian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total}</div>
          <p className="text-muted-foreground text-xs">Pasien menunggu</p>
        </CardContent>
      </Card>

      {/* Red - Critical */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700">
            🔴 Merah (Gawat Darurat)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{statistics.red}</div>
          <p className="text-xs text-red-600">Prioritas tertinggi</p>
        </CardContent>
      </Card>

      {/* Yellow - Urgent */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">🟡 Kuning (Urgent)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{statistics.yellow}</div>
          <p className="text-xs text-yellow-600">Prioritas sedang</p>
        </CardContent>
      </Card>

      {/* Green - Non-Urgent */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">
            🟢 Hijau (Non-Urgent)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{statistics.green}</div>
          <p className="text-xs text-green-600">Prioritas rendah</p>
        </CardContent>
      </Card>
    </div>
  )
}
