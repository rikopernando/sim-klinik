/**
 * Custom hook for ICD-10 code search
 * Handles debounced search with API calls
 */

import { useState, useEffect } from "react";

export interface ICD10Code {
    id: number;
    code: string;
    description: string;
    category: string | null;
}

export function useICD10Search(query: string) {
    const [codes, setCodes] = useState<ICD10Code[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!query || query.length < 2) {
            setCodes([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `/api/icd10/search?q=${encodeURIComponent(query)}&limit=20`
                );
                const data = await response.json();
                setCodes(data.data || []);
            } catch (error) {
                console.error("Failed to search ICD-10 codes:", error);
                setCodes([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    return { codes, isSearching };
}
