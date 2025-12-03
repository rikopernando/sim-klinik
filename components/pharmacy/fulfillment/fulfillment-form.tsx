/**
 * Fulfillment Form Component
 * Form for entering fulfillment details
 */

import { memo, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { DrugInventoryWithDetails } from "@/lib/services/inventory.service"
import { FormField } from "@/components/ui/form-field"
import { getPharmacists, Pharmacist } from "@/lib/services/pharmacist.service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FulfillmentFormProps {
  selectedBatch: DrugInventoryWithDetails | null
  prescriptionQuantity: number
  unit: string
  dispensedQuantity: string
  fulfilledBy: string
  notes: string
  isSubmitting: boolean
  onDispensedQuantityChange: (value: string) => void
  onFulfilledByChange: (value: string) => void
  onNotesChange: (value: string) => void
}

export const FulfillmentForm = memo(function FulfillmentForm({
  selectedBatch,
  prescriptionQuantity,
  unit,
  dispensedQuantity,
  fulfilledBy,
  notes,
  isSubmitting,
  onDispensedQuantityChange,
  onFulfilledByChange,
  onNotesChange,
}: FulfillmentFormProps) {
  const maxQuantity = selectedBatch?.stockQuantity || prescriptionQuantity

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch doctors from API using service
    const fetchPharmacists = async () => {
      setLoading(true)
      try {
        const pharmacistsList = await getPharmacists()
        setPharmacists(pharmacistsList)
      } catch (error) {
        console.error("Error fetching pharmacists:", error)
        setErrorMessage("Gagal memuat daftar farmasi")
      } finally {
        setLoading(false)
      }
    }

    fetchPharmacists()
  }, [])

  return (
    <div className="space-y-4">
      {/* Quantity and Pharmacist */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <FormField htmlFor="dispensedQuantity" label="Jumlah yang Diberikan" required>
            <Input
              id="dispensedQuantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={dispensedQuantity}
              onChange={(e) => onDispensedQuantityChange(e.target.value)}
              placeholder={`Max: ${maxQuantity}`}
              disabled={isSubmitting || !selectedBatch}
            />
            {selectedBatch && (
              <p className="text-muted-foreground mt-1 text-xs">
                Stok tersedia: {selectedBatch.stockQuantity} {unit}
              </p>
            )}
          </FormField>
        </div>

        <div className="col-span-2 md:col-span-1">
          <FormField htmlFor="fulfilledBy" label="Diproses Oleh" required>
            <Select onValueChange={(value) => onFulfilledByChange(value)} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Memuat farmasi..."
                      : pharmacists.length === 0
                        ? "Tidak ada farmasi tersedia"
                        : "Pilih farmasi"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {pharmacists.map((pharmacist) => (
                  <SelectItem key={pharmacist.id} value={pharmacist.id}>
                    {pharmacist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Notes */}
      <div className="col-span-2">
        <FormField htmlFor="notes" label="Catatan">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan"
            disabled={isSubmitting}
          />
        </FormField>
      </div>
    </div>
  )
})
