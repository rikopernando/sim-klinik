/**
 * Room Dashboard Header Component
 * Title, description, and refresh button
 */

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface RoomDashboardHeaderProps {
  lastRefresh: Date | null
  onRefresh: () => void
  isLoading: boolean
}

export function RoomDashboardHeader({
  lastRefresh,
  onRefresh,
  isLoading,
}: RoomDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Kamar Rawat Inap</h1>
        <p className="text-muted-foreground">Manajemen dan visualisasi status hunian kamar</p>
      </div>
      <div className="flex items-center gap-4">
        {lastRefresh && (
          <div className="text-muted-foreground text-sm">
            Update: {lastRefresh.toLocaleTimeString("id-ID")}
          </div>
        )}
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  )
}
