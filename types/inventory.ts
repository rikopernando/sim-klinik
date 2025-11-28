import { DrugInventoryInput } from "@/lib/pharmacy/validation";

export type DrugInventoryInputValues = Omit<DrugInventoryInput, 'stockQuantity' 
|'expiryDate' | 'receivedDate'> & {
  expiryDate?: Date;
  receivedDate?: Date;
  drugName: string;
  drugUnit: string;
  stockQuantity: string;
}