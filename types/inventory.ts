import { DrugInventoryInput } from "@/lib/pharmacy/validation"
import { DrugInventoryWithDetails } from "./pharmacy"

export type DrugInventoryInputValues = Omit<
  DrugInventoryInput,
  "stockQuantity" | "expiryDate" | "receivedDate"
> & {
  expiryDate?: Date
  receivedDate?: Date
  drugName: string
  drugUnit: string
  stockQuantity: string
}

export interface DuplicateBatchCheck {
  exists: boolean
  batch?: DrugInventoryWithDetails
}
