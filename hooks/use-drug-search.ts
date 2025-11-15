/**
 * Custom hook for drug search functionality
 */

import { useState, useEffect } from "react";
import axios from "axios";

export interface Drug {
    id: number;
    name: string;
    genericName: string | null;
    unit: string;
    category: string | null;
}

export function useDrugSearch(query: string, minLength: number = 2) {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query.length >= minLength) {
            searchDrugs(query);
        } else {
            setDrugs([]);
        }
    }, [query, minLength]);

    const searchDrugs = async (searchQuery: string) => {
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
    };

    return { drugs, isSearching, error };
}
