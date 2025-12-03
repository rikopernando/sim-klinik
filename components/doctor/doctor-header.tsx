/**
 * Doctor Dashboard Header
 */

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface DoctorHeaderProps {
  lastRefresh?: Date | null
  onRefresh: () => void
}

export function DoctorHeader({ lastRefresh, onRefresh }: DoctorHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Dokter</h1>
        <p className="text-muted-foreground">Kelola antrian pasien dan rekam medis</p>
      </div>
      <div className="flex items-center gap-4">
        {lastRefresh && (
          <p className="text-muted-foreground text-sm">
            Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
          </p>
        )}
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
