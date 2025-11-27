/**
 * Inventory Form Fields Component
 * Reusable form fields for inventory management
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InventoryFormFieldsProps {
    formData: {
        batchNumber: string;
        expiryDate: string;
        stockQuantity: string;
        purchasePrice: string;
        supplier: string;
        receivedDate: string;
    };
    onChange: (field: string, value: string) => void;
    disabled?: boolean;
    isCheckingDuplicate?: boolean;
}

export function InventoryFormFields({
    formData,
    onChange,
    disabled = false,
    isCheckingDuplicate = false,
}: InventoryFormFieldsProps) {
    return (
        <>
            {/* Batch Number and Expiry Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="batchNumber">
                        Nomor Batch <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="batchNumber"
                        value={formData.batchNumber}
                        onChange={(e) => onChange("batchNumber", e.target.value)}
                        placeholder="Masukkan nomor batch dari kemasan"
                        required
                        disabled={disabled}
                    />
                    {isCheckingDuplicate && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Memeriksa duplikasi...
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="expiryDate">
                        Tanggal Kadaluarsa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => onChange("expiryDate", e.target.value)}
                        required
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Stock Quantity and Purchase Price */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="stockQuantity">
                        Jumlah Stok <span className="text-destructive">*</span>
                    </Label>
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
                </div>

                <div>
                    <Label htmlFor="purchasePrice">Harga Beli (Opsional)</Label>
                    <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => onChange("purchasePrice", e.target.value)}
                        placeholder="0.00"
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Supplier and Received Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="supplier">Supplier (Opsional)</Label>
                    <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => onChange("supplier", e.target.value)}
                        placeholder="Nama supplier"
                        disabled={disabled}
                    />
                </div>

                <div>
                    <Label htmlFor="receivedDate">Tanggal Terima</Label>
                    <Input
                        id="receivedDate"
                        type="date"
                        value={formData.receivedDate}
                        onChange={(e) => onChange("receivedDate", e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </>
    );
}
