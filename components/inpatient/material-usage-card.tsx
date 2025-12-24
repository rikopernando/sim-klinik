/**
 * Material Usage Card Component
 * Displays history of material/supplies usage
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { MaterialUsage } from "@/types/inpatient"
import { formatCurrency } from "@/lib/utils/billing"
import { formatDateTime } from "@/lib/utils/date"

interface MaterialUsageCardProps {
  materials: MaterialUsage[]
  totalCost: string
}

export function MaterialUsageCard({ materials, totalCost }: MaterialUsageCardProps) {
  if (materials.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">Belum ada penggunaan material</div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu Pakai</TableHead>
            <TableHead>Nama Material</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead className="text-right">Harga Satuan</TableHead>
            <TableHead className="text-right">Total Harga</TableHead>
            <TableHead>Digunakan Oleh</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{formatDateTime(material.usedAt)}</TableCell>
              <TableCell>{material.materialName}</TableCell>
              <TableCell className="text-right">{material.quantity}</TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(parseFloat(material.unitPrice))}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(parseFloat(material.totalPrice))}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {material.usedBy || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                {material.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="text-right font-semibold">
              Total Biaya Material
            </TableCell>
            <TableCell className="text-right text-lg font-bold">
              Rp {new Intl.NumberFormat("id-ID").format(parseFloat(totalCost))}
            </TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
