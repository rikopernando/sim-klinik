/**
 * Compound Recipes Management Page
 * Master data for compound medications (obat racik)
 */

"use client"

import { useState } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { toast } from "sonner"
import { IconCirclePlus2, IconSearch } from "@tabler/icons-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/users/pagination"
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

import {
  CompoundRecipeTable,
  CreateCompoundRecipeDialog,
  EditCompoundRecipeDialog,
  ViewCompoundRecipeDialog,
} from "@/components/compound-recipes"

import {
  useCompoundRecipes,
  useDeleteCompoundRecipe,
  useToggleCompoundRecipeStatus,
} from "@/hooks/use-compound-recipes"
import { useDebounce } from "@/hooks/use-debounce"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

export default function CompoundRecipesPage() {
  return (
    <PageGuard roles={["super_admin", "admin", "pharmacist"]}>
      <CompoundRecipesPageContent />
    </PageGuard>
  )
}

function CompoundRecipesPageContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<CompoundRecipeWithCreator | null>(null)
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { recipes, isLoading, meta, refetch } = useCompoundRecipes({
    search: debouncedSearch,
    isActive: includeInactive ? undefined : true,
    page,
    limit: 10,
  })

  const { deleteRecipe, isDeleting } = useDeleteCompoundRecipe()
  const { toggleStatus } = useToggleCompoundRecipeStatus()

  const handleView = (recipe: CompoundRecipeWithCreator) => {
    setSelectedRecipe(recipe)
    setViewDialogOpen(true)
  }

  const handleEdit = (recipe: CompoundRecipeWithCreator) => {
    setSelectedRecipe(recipe)
    setEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setRecipeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!recipeToDelete) return

    try {
      await deleteRecipe(recipeToDelete)
      toast.success("Obat racik berhasil dihapus!")
      setDeleteDialogOpen(false)
      setRecipeToDelete(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus obat racik"
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleStatus({ id, isActive })
      toast.success(
        isActive ? "Obat racik berhasil diaktifkan!" : "Obat racik berhasil dinonaktifkan!"
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal mengubah status"
      toast.error(errorMessage)
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const totalPages = Math.ceil(meta.total / meta.limit)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Obat Racik</h1>
          <p className="text-muted-foreground">
            Kelola resep obat racik yang dapat digunakan oleh dokter
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconCirclePlus2 size={20} className="mr-2" />
          Tambah Obat Racik
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Obat Racik</CardTitle>
          {meta.total > 0 && !isLoading && (
            <CardDescription>Total: {meta.total} obat racik</CardDescription>
          )}
          <CardAction>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform"
                  size={20}
                />
                <Input
                  placeholder="Cari berdasarkan nama atau kode"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  className="min-w-[304px] pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(v) => {
                      setIncludeInactive(Boolean(v))
                      setPage(1)
                    }}
                  />
                  <label htmlFor="include-inactive" className="muted-foreground text-sm">
                    Tampilkan non-aktif
                  </label>
                </div>
              </div>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          {isLoading && recipes.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">Memuat data obat racik...</div>
          ) : (
            <CompoundRecipeTable
              recipes={recipes}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateCompoundRecipeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* View Dialog */}
      <ViewCompoundRecipeDialog
        recipe={selectedRecipe}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Dialog */}
      <EditCompoundRecipeDialog
        recipe={selectedRecipe}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Obat Racik?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan menonaktifkan obat racik. Resep yang sudah dibuat sebelumnya tidak akan
              terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
