/**
 * Compound Recipe Table Component
 * Displays compound recipes in a table with actions
 */

"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconDotsVertical, IconEdit, IconEye, IconTrash, IconToggleLeft } from "@tabler/icons-react"
import type { CompoundRecipeWithCreator } from "@/types/compound-recipe"

interface CompoundRecipeTableProps {
  recipes: CompoundRecipeWithCreator[]
  onView: (recipe: CompoundRecipeWithCreator) => void
  onEdit: (recipe: CompoundRecipeWithCreator) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

export function CompoundRecipeTable({
  recipes,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CompoundRecipeTableProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">Tidak ada obat racik ditemukan</div>
    )
  }

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-"
    const numPrice = parseFloat(price)
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Komposisi</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dibuat</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-mono text-sm">{recipe.code}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{recipe.name}</p>
                {recipe.description && (
                  <p className="text-muted-foreground line-clamp-1 text-xs">{recipe.description}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {recipe.composition.slice(0, 3).map((ingredient, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ingredient.drugName}
                  </Badge>
                ))}
                {recipe.composition.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{recipe.composition.length - 3} lainnya
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{formatPrice(recipe.price)}</TableCell>
            <TableCell>
              {recipe.isActive ? (
                <Badge className="bg-green-600">Aktif</Badge>
              ) : (
                <Badge variant="secondary">Non-aktif</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="text-xs">
                <p>{format(new Date(recipe.createdAt), "dd MMM yyyy")}</p>
                {recipe.creator && (
                  <p className="text-muted-foreground">oleh {recipe.creator.name}</p>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <IconDotsVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(recipe)}>
                    <IconEye size={16} className="mr-2" />
                    Lihat Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(recipe)}>
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(recipe.id, !recipe.isActive)}>
                    <IconToggleLeft size={16} className="mr-2" />
                    {recipe.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(recipe.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash size={16} className="mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
