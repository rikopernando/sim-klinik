/**
 * Pharmacy Dashboard Header Component
 */

import { Button } from "@/components/ui/button"
import { RefreshCw, Package } from "lucide-react"
import { useRouter } from "next/navigation"

interface PharmacyHeaderProps {
  lastRefresh?: Date | null
  onRefresh: () => void
}

export function PharmacyHeader({ lastRefresh, onRefresh }: PharmacyHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Farmasi</h1>
        <p className="text-muted-foreground">Kelola resep dan stok obat</p>
      </div>
      <div className="flex items-center gap-4">
        {lastRefresh && (
          <p className="text-muted-foreground text-sm">
            Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")}
          </p>
        )}
        <Button onClick={() => router.push("/dashboard/pharmacy/inventory")} variant="default">
          <Package className="mr-2 h-4 w-4" />
          Kelola Stok
        </Button>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
