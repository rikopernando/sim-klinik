/**
 * Room Statistics Cards Component
 * Displays 4 statistic cards for room occupancy
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RoomStatistics } from "@/hooks/use-room-statistics"

interface RoomStatisticsCardsProps {
  statistics: RoomStatistics
}

export function RoomStatisticsCards({ statistics }: RoomStatisticsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Rooms */}
      <Card className="gap-4">
        <CardHeader className="gap-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total}</div>
          <p className="text-muted-foreground text-xs">{statistics.totalBeds} bed total</p>
        </CardContent>
      </Card>

      {/* Available Rooms */}
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="gap-0 pb-0">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
            Kamar Kosong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {statistics.available}
          </div>
          <p className="text-xs text-green-600 dark:text-green-500">Siap ditempati</p>
        </CardContent>
      </Card>

      {/* Partially Occupied */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
        <CardHeader className="gap-0 pb-0">
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
            Terisi Sebagian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {statistics.partial}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-500">Masih ada bed tersedia</p>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="gap-0 pb-0">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Tingkat Hunian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {statistics.occupancyRate}%
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-500">
            {statistics.occupiedBeds} dari {statistics.totalBeds} bed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
