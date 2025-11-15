/**
 * Drug Search Component
 */

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDrugSearch, type Drug } from "@/hooks/use-drug-search";

interface DrugSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (drug: Drug) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export function DrugSearch({
    value,
    onChange,
    onSelect,
    label = "Cari Obat",
    placeholder = "Ketik nama obat...",
    required = false,
}: DrugSearchProps) {
    const { drugs, isSearching } = useDrugSearch(value);

    return (
        <div className="space-y-2">
            <Label htmlFor="drugSearch">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id="drugSearch"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                />
            </div>
            {isSearching && <p className="text-xs text-muted-foreground">Mencari...</p>}
            {drugs.length > 0 && value && (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {drugs.map((drug) => (
                        <button
                            key={drug.id}
                            type="button"
                            onClick={() => {
                                onSelect(drug);
                                onChange(drug.name);
                            }}
                            className="w-full rounded px-2 py-1 text-left text-sm hover:bg-accent"
                        >
                            {drug.name} {drug.genericName && `(${drug.genericName})`} - {drug.unit}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
