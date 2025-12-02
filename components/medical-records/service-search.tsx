/**
 * Service Search Component
 * Autocomplete search for medical procedures/services
 */

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useServiceSearch, type Service } from "@/hooks/use-service-search";
import { formatCurrency } from "@/lib/billing/billing-utils";

interface ServiceSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (service: Service) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    serviceType?: string;
}

export function ServiceSearch({
    value,
    onChange,
    onSelect,
    label = "Cari Tindakan",
    placeholder = "Ketik nama tindakan...",
    required = false,
    serviceType = "procedure",
}: ServiceSearchProps) {
    const [showDropdown, setShowDropdown] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Only use searchQuery for the API call, not the display value
    const { services, isSearching } = useServiceSearch(searchQuery, serviceType);

    const handleInputChange = (newValue: string) => {
        setSearchQuery(newValue);
        onChange(newValue);
        setShowDropdown(true);
    };

    const handleSelect = (service: Service) => {
        setShowDropdown(false);
        setSearchQuery(""); // Clear search query to stop API calls
        onSelect(service);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="serviceSearch">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                {isSearching ? (
                    <Spinner className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                    id="serviceSearch"
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10"
                />
                {services.length > 0 && searchQuery && showDropdown && (
                    <div className="absolute z-50 w-full bg-background mt-1 shadow-xl max-h-60 space-y-1 overflow-y-auto rounded-md border p-2">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => handleSelect(service)}
                                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Kode: {service.code}
                                            {service.description && ` • ${service.description}`}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-primary whitespace-nowrap">
                                        {formatCurrency(parseFloat(service.price))}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
