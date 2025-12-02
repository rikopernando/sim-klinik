/**
 * Custom hook for drug search functionality with debouncing
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface Drug {
    id: number;
    name: string;
    genericName: string | null;
    unit: string;
    price: string;
    category: string | null;
}

export function useDrugSearch(query: string, minLength: number = 2, debounceMs: number = 300) {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchDrugs = useCallback(async (searchQuery: string) => {
        try {
            setIsSearching(true);
            setError(null);
            const response = await axios.get<{ data: Drug[] }>(`/api/drugs?search=${searchQuery}`);
            setDrugs(response.data.data);
        } catch (err) {
            setError("Gagal mencari obat");
            console.error("Drug search error:", err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        // Reset drugs if query is too short
        if (query.length < minLength) {
            setDrugs([]);
            return;
        }

        // Debounce the search
        const timeoutId = setTimeout(() => {
            searchDrugs(query);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, minLength, debounceMs, searchDrugs]);

    return { drugs, isSearching, error };
}
