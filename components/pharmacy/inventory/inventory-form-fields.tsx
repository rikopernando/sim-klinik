/**
 * Inventory Form Fields Component
 * Reusable form fields for inventory management
 */

import { DatePickerField } from "@/components/forms/date-picker-field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { DrugInventoryInputValues } from "@/types/inventory";

interface InventoryFormFieldsProps {
    formData: DrugInventoryInputValues;
    onChange: (field: string, value: string | Date) => void;
    disabled?: boolean;
    isCheckingDuplicate?: boolean;
}

export function InventoryFormFields({
    formData,
    onChange,
    disabled = false,
}: InventoryFormFieldsProps) {
    return (
        <>
            {/* Batch Number and Expiry Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                    <FormField htmlFor="batchNumber" label='Nomor Batch' required>
                        <Input
                            id="batchNumber"
                            value={formData.batchNumber}
                            onChange={(e) => onChange("batchNumber", e.target.value)}
                            placeholder="Masukkan nomor batch dari kemasan"
                            required
                            disabled={disabled}
                        />
                        </FormField>
                </div>

                <div className="col-span-2 md:col-span-1">
                    <DatePickerField 
                        required
                        label="Tanggal Kadaluarsa"
                        value={formData.expiryDate}
                        onChange={(date) => onChange('expiryDate', date as Date)}
                    />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <FormField htmlFor="stockQuantity" label='Jumlah Stok' required>
                    <Input
                        id="stockQuantity"
                        type="number"
                        min="1"
                        value={formData.stockQuantity}
                        onChange={(e) => onChange("stockQuantity", e.target.value)}
                        placeholder="Masukkan jumlah"
                        required
                        disabled={disabled}
                    />
                    </FormField>
                </div>

                <div className="col-span-2 md:col-span-1">
                    <FormField htmlFor="unit" label='Satuan'>
                    <Input
                        id="satuan"
                        type="text"
                        value={formData.drugUnit}
                        placeholder="Satuan"
                        disabled
                    />
                    </FormField>
                </div>

                <div className="col-span-2 md:col-span-1">
                    <FormField htmlFor="purchasePrice" label='Harga Beli'>
                    <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => onChange("purchasePrice", e.target.value)}
                        placeholder="0.00"
                        disabled={disabled}
                    />
                    </FormField>
                </div>

                <div className="col-span-2 md:col-span-1">
                    <FormField htmlFor="supplier" label='Supplier'>
                    <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => onChange("supplier", e.target.value)}
                        placeholder="Nama supplier"
                        disabled={disabled}
                    />
                    </FormField>
                </div>

                <div className="col-span-2 md:col-span-1">
                    <DatePickerField 
                        required
                        label="Tanggal Terima"
                        value={formData.receivedDate}
                        onChange={(date) => onChange('receivedDate', date as Date)}
                    />
                </div>
            </div>
        </>
    );
}
