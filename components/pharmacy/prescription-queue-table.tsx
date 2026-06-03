/**
 * Prescription Queue Table Component
 * Displays prescription queue grouped by visit with pagination
 */

import { useMemo } from "react"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
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
  <Card>
    <CardContent className="text-muted-foreground p-8 text-center">Loading...</CardContent>
  </Card>
)

const ErrorState = ({ error }: { error: string }) => (
  <Card>
    <CardContent className="p-8 text-center text-red-600">Error: {error}</CardContent>
  </Card>
)

const EmptyState = () => (
  <Card>
    <CardContent className="text-muted-foreground p-8 text-center">
      Tidak ada resep yang menunggu
    </CardContent>
  </Card>
)

export function PrescriptionQueueTable({
  queue,
  isLoading,
  error,
  onProcess,
  pagination,
  onPageChange,
}: PrescriptionQueueTableProps) {
  const tableRows = useMemo(
    () =>
      queue.map((item, index) => (
        <PrescriptionRow key={item.visit.id} item={item} index={index} onProcess={onProcess} />
      )),
    [queue, onProcess]
  )

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (queue.length === 0) return <EmptyState />

  const showPagination = pagination && onPageChange && pagination.totalPages > 1

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[180px]">Pasien / No. Kunjungan</TableHead>
                  <TableHead className="min-w-[200px]">Resep</TableHead>
                  <TableHead className="min-w-[150px]">Dokter</TableHead>
                  <TableHead className="min-w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{tableRows}</TableBody>
            </Table>
          </div>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between px-2 pt-4">
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
      </CardContent>
    </Card>
  )
}
