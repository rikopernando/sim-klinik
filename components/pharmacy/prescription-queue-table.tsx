import { ClipboardX } from "lucide-react"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PrescriptionQueueItem } from "@/types/pharmacy"
import { Pagination } from "@/types/api"

import { PrescriptionRow } from "./queue/prescription-row"

interface PrescriptionQueueTableProps {
  queue: PrescriptionQueueItem[]
  isLoading: boolean
  error: string | null
  onProcess: (item: PrescriptionQueueItem) => void
  pagination?: Pagination
  onPageChange?: (page: number) => void
}

const LoadingState = () => (
  <div className="space-y-3 p-4">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)

const ErrorState = ({ error }: { error: string }) => (
  <div className="p-8 text-center text-sm text-red-600">{error}</div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center gap-2 py-12 text-center">
    <ClipboardX className="text-muted-foreground h-8 w-8" />
    <p className="text-muted-foreground text-sm font-medium">Tidak ada resep yang menunggu</p>
    <p className="text-muted-foreground text-xs">Semua resep telah diproses</p>
  </div>
)

export function PrescriptionQueueTable({
  queue,
  isLoading,
  error,
  onProcess,
  pagination,
  onPageChange,
}: PrescriptionQueueTableProps) {
  if (isLoading)
    return (
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <LoadingState />
      </div>
    )
  if (error)
    return (
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <ErrorState error={error} />
      </div>
    )
  if (queue.length === 0)
    return (
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <EmptyState />
      </div>
    )

  const showPagination = pagination && onPageChange && pagination.totalPages > 1

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[50px] pl-4">#</TableHead>
              <TableHead className="min-w-[180px]">Pasien</TableHead>
              <TableHead className="min-w-[200px]">Resep</TableHead>
              <TableHead className="min-w-[150px]">Dokter</TableHead>
              <TableHead className="min-w-[120px]">Waktu</TableHead>
              <TableHead className="min-w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((item, index) => (
              <PrescriptionRow
                key={item.visit.id}
                item={item}
                index={index}
                onProcess={onProcess}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-muted-foreground text-sm">
            Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} kunjungan)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
