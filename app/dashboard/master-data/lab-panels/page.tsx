"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Search, LayoutList, SlidersHorizontal } from "lucide-react"
import { PageGuard } from "@/components/auth/page-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/users/pagination"
import { LabPanelTable, LabPanelDialog } from "@/components/master-data/lab-panels"
import { useLabPanels, useCreateLabPanel, useUpdateLabPanel } from "@/hooks/use-lab-panels"
import { useDebounce } from "@/hooks/use-debounce"
import type { LabPanelRecord } from "@/types/lab-panel"

export default function LabPanelsPage() {
  return (
    <PageGuard roles={["super_admin", "admin", "lab_supervisor"]}>
      <LabPanelsPageContent />
    </PageGuard>
  )
}

function LabPanelsPageContent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LabPanelRecord | null>(null)
  const [pendingToggle, setPendingToggle] = useState<LabPanelRecord | null>(null)
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  const { items, meta, isLoading } = useLabPanels({
    search: debouncedSearch,
    isActive: includeInactive ? undefined : true,
    page,
    limit: 20,
  })

  const { meta: allMeta } = useLabPanels({ isActive: true, limit: 1 })

  const { create, isCreating } = useCreateLabPanel()
  const { update, isUpdating } = useUpdateLabPanel()

  const handleCreate = async (values: Parameters<typeof create>[0]) => {
    try {
      await create(values)
      toast.success("Panel berhasil ditambahkan")
    } catch {
      toast.error("Gagal menambahkan panel")
      throw new Error("failed")
    }
  }

  const handleEdit = async (values: Parameters<typeof create>[0]) => {
    if (!selectedItem) return
    try {
      await update({ id: selectedItem.id, input: values })
      toast.success("Panel berhasil diperbarui")
    } catch {
      toast.error("Gagal memperbarui panel")
      throw new Error("failed")
    }
  }

  const confirmToggleActive = async () => {
    if (!pendingToggle) return
    try {
      await update({ id: pendingToggle.id, input: { isActive: !pendingToggle.isActive } })
      toast.success(pendingToggle.isActive ? "Panel dinonaktifkan" : "Panel diaktifkan")
    } catch {
      toast.error("Gagal mengubah status panel")
    } finally {
      setPendingToggle(null)
    }
  }

  const openCreate = () => {
    setSelectedItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: LabPanelRecord) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel Pemeriksaan</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola paket panel pemeriksaan laboratorium dan radiologi
          </p>

          {/* Stat chip */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
              <LayoutList className="h-3 w-3" />
              {allMeta.total} Panel aktif
            </span>
          </div>
        </div>

        <Button
          onClick={openCreate}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Panel
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Cari nama atau kode panel…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>

        {/* Include inactive */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-inactive"
            checked={includeInactive}
            onCheckedChange={(v) => {
              setIncludeInactive(Boolean(v))
              setPage(1)
            }}
          />
          <label
            htmlFor="include-inactive"
            className="text-muted-foreground flex cursor-pointer items-center gap-1 text-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Tampilkan nonaktif
          </label>
        </div>

        {/* Result count */}
        {!isLoading && meta.total > 0 && (
          <span className="text-muted-foreground ml-auto text-sm">
            {meta.total} panel ditemukan
          </span>
        )}
      </div>

      {/* Table */}
      <LabPanelTable
        items={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onToggleActive={setPendingToggle}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Form dialog */}
      <LabPanelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSubmit={selectedItem ? handleEdit : handleCreate}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Toggle active confirmation */}
      <AlertDialog open={!!pendingToggle} onOpenChange={(o) => !o && setPendingToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.isActive ? "Nonaktifkan panel?" : "Aktifkan panel?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.isActive ? (
                <>
                  <strong>{pendingToggle.name}</strong> akan dinonaktifkan dan tidak akan muncul
                  dalam pilihan order pemeriksaan.
                </>
              ) : (
                <>
                  <strong>{pendingToggle?.name}</strong> akan diaktifkan kembali dan tersedia untuk
                  dipesan.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleActive}
              disabled={isUpdating}
              className={
                pendingToggle?.isActive
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {isUpdating
                ? "Menyimpan…"
                : pendingToggle?.isActive
                  ? "Ya, nonaktifkan"
                  : "Ya, aktifkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
