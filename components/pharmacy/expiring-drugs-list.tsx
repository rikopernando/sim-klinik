import { PackageX } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpiringDrugCard } from "./expiring/expiring-drug-card"
import { ExpiringDrugsData } from "@/types/pharmacy"

interface ExpiringDrugsListProps {
  data: ExpiringDrugsData
  isLoading: boolean
  error: string | null
}

const LoadingState = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
)

const ErrorState = ({ error }: { error: string }) => (
  <div className="p-8 text-center text-sm text-red-600">{error}</div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center gap-2 py-12 text-center">
    <PackageX className="text-muted-foreground h-8 w-8" />
    <p className="text-muted-foreground text-sm font-medium">Tidak ada obat mendekati kadaluarsa</p>
    <p className="text-muted-foreground text-xs">Semua stok dalam kondisi baik</p>
  </div>
)

interface SeverityGroupProps {
  title: string
  dotColor: string
  items: ExpiringDrugsData["expired"]
}

function SeverityGroup({ title, dotColor, items }: SeverityGroupProps) {
  if (items.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-muted-foreground text-xs">({items.length})</span>
      </div>
      <div className="space-y-1.5">
        {items.map((inventory) => (
          <ExpiringDrugCard key={inventory.id} inventory={inventory} />
        ))}
      </div>
    </div>
  )
}

export function ExpiringDrugsList({ data, isLoading, error }: ExpiringDrugsListProps) {
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (data.all.length === 0) return <EmptyState />

  return (
    <div className="space-y-6">
      <SeverityGroup title="Sudah Kadaluarsa" dotColor="bg-red-500" items={data.expired} />
      <SeverityGroup title="Segera Kadaluarsa" dotColor="bg-orange-500" items={data.expiringSoon} />
      <SeverityGroup title="Perhatian" dotColor="bg-yellow-500" items={data.warning} />
    </div>
  )
}
