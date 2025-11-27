/**
 * Drug Search Component
 */

import { useState} from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDrugSearch, type Drug } from "@/hooks/use-drug-search";

interface DrugSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (drugId: number, drugName: string, drugUnit?: string) => void;
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
    const [showDropdown, setShowDropdown] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Only use searchQuery for the API call, not the display value
    const { drugs, isSearching } = useDrugSearch(searchQuery);

    const handleInputChange = (newValue: string) => {
        setSearchQuery(newValue);
        onChange(newValue);
        setShowDropdown(true);
    };

    const handleSelect = (drug: Drug) => {
        setShowDropdown(false);
        setSearchQuery(""); // Clear search query to stop API calls
        onSelect(drug.id, drug.name, drug.unit);
    };

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
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                />
            </div>
            {isSearching && <p className="text-xs text-muted-foreground">Mencari...</p>}
            {drugs.length > 0 && searchQuery && showDropdown && (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {drugs.map((drug) => (
                        <button
                            key={drug.id}
                            type="button"
                            onClick={() => handleSelect(drug)}
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
