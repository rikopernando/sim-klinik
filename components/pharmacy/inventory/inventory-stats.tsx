import { Package, AlertTriangle, Clock, TrendingDown } from "lucide-react"
import { StatCard } from "@/components/pharmacy/stats/stat-card"

interface InventoryStatsProps {
  totalBatches: number
  expiredCount: number
  expiringSoonCount: number
  lowStockCount: number
}

export function InventoryStats({
  totalBatches,
  expiredCount,
  expiringSoonCount,
  lowStockCount,
}: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        title="Total Batch"
        value={totalBatches}
        description="Batch terdaftar"
        variant="default"
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Kadaluarsa"
        value={expiredCount}
        description="Halaman ini"
        variant="danger"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <StatCard
        title="Segera Kadaluarsa"
        value={expiringSoonCount}
        description="Dalam 30 hari"
        variant="warning"
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="Stok Rendah"
        value={lowStockCount}
        description="Di bawah 10 unit"
        variant="caution"
        icon={<TrendingDown className="h-4 w-4" />}
      />
    </div>
  )
}
