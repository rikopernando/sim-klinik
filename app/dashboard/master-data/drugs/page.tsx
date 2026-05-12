"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Search, FlaskConical, Pill, SlidersHorizontal } from "lucide-react"
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
import { DrugTable, DrugDialog } from "@/components/master-data/drugs"
import { useDrugs, useCreateDrug, useUpdateDrug } from "@/hooks/use-drugs"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"
import type { InventoryItemRecord, ItemType } from "@/types/drug"
import type { CreateDrugSchema } from "@/lib/validations/drug"

export default function DrugsPage() {
  return (
    <PageGuard roles={["super_admin", "admin", "pharmacist"]}>
      <DrugsPageContent />
    </PageGuard>
  )
}

type TabValue = "all" | ItemType

const TABS: { value: TabValue; label: string; icon?: React.ReactNode }[] = [
  { value: "all", label: "Semua" },
  {
    value: "drug",
    label: "Obat",
    icon: <Pill className="h-3.5 w-3.5" />,
  },
  {
    value: "material",
    label: "Bahan Medis",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
  },
]

function DrugsPageContent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItemRecord | null>(null)
  const [pendingToggle, setPendingToggle] = useState<InventoryItemRecord | null>(null)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<TabValue>("all")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  const { items, meta, isLoading } = useDrugs({
    search: debouncedSearch,
    itemType: tab === "all" ? undefined : tab,
    isActive: includeInactive ? undefined : true,
    page,
    limit: 20,
  })

  // Separate counts for stat chips (no filter)
  const { meta: drugMeta } = useDrugs({ itemType: "drug", isActive: true, limit: 1 })
  const { meta: materialMeta } = useDrugs({ itemType: "material", isActive: true, limit: 1 })

  const { create, isCreating } = useCreateDrug()
  const { update, isUpdating } = useUpdateDrug()

  const handleCreate = async (values: CreateDrugSchema & { isActive?: boolean }) => {
    try {
      await create(values)
      toast.success("Item berhasil ditambahkan")
    } catch {
      toast.error("Gagal menambahkan item")
      throw new Error("failed")
    }
  }

  const handleEdit = async (values: CreateDrugSchema & { isActive?: boolean }) => {
    if (!selectedItem) return
    try {
      await update({ id: selectedItem.id, input: values })
      toast.success("Item berhasil diperbarui")
    } catch {
      toast.error("Gagal memperbarui item")
      throw new Error("failed")
    }
  }

  const confirmToggleActive = async () => {
    if (!pendingToggle) return
    try {
      await update({ id: pendingToggle.id, input: { isActive: !pendingToggle.isActive } })
      toast.success(pendingToggle.isActive ? "Item dinonaktifkan" : "Item diaktifkan")
    } catch {
      toast.error("Gagal mengubah status")
    } finally {
      setPendingToggle(null)
    }
  }

  const openCreate = () => {
    setSelectedItem(null)
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryItemRecord) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* ── Page header ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Obat &amp; Bahan Medis</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola master katalog obat dan bahan medis klinik
          </p>

          {/* Stat chips */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              <Pill className="h-3 w-3" />
              {drugMeta.total} Obat aktif
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <FlaskConical className="h-3 w-3" />
              {materialMeta.total} Bahan medis aktif
            </span>
          </div>
        </div>

        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Item
        </Button>
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Tab switcher */}
        <div className="bg-muted/60 flex items-center gap-0.5 rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value)
                setPage(1)
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                tab === t.value
                  ? cn(
                      "shadow-sm",
                      t.value === "drug"
                        ? "bg-white text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                        : t.value === "material"
                          ? "bg-white text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "text-foreground dark:bg-card bg-white"
                    )
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Cari nama obat atau generik…"
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
          <span className="text-muted-foreground ml-auto text-sm">{meta.total} item ditemukan</span>
        )}
      </div>

      {/* ── Table ── */}
      <DrugTable
        items={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onToggleActive={setPendingToggle}
      />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ── Form dialog ── */}
      <DrugDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSubmit={selectedItem ? handleEdit : handleCreate}
        isSubmitting={isCreating || isUpdating}
      />

      {/* ── Toggle active confirmation ── */}
      <AlertDialog open={!!pendingToggle} onOpenChange={(o) => !o && setPendingToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.isActive ? "Nonaktifkan item?" : "Aktifkan item?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.isActive ? (
                <>
                  <strong>{pendingToggle.name}</strong> akan dinonaktifkan dan tidak akan muncul
                  dalam pilihan resep maupun stok opname.
                </>
              ) : (
                <>
                  <strong>{pendingToggle?.name}</strong> akan diaktifkan kembali dan tersedia untuk
                  digunakan.
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
