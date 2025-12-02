/**
 * Custom hook for service search functionality with debouncing
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface Service {
    id: number;
    code: string;
    name: string;
    serviceType: string;
    price: string;
    description: string | null;
    category: string | null;
}

export function useServiceSearch(
    query: string,
    serviceType: string = "procedure",
    minLength: number = 2,
    debounceMs: number = 300
) {
    const [services, setServices] = useState<Service[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchServices = useCallback(async (searchQuery: string) => {
        try {
            setIsSearching(true);
            setError(null);
            const response = await axios.get<{ data: Service[] }>(
                `/api/services?search=${searchQuery}&serviceType=${serviceType}`
            );
            setServices(response.data.data);
        } catch (err) {
            setError("Gagal mencari layanan");
            console.error("Service search error:", err);
        } finally {
            setIsSearching(false);
        }
    }, [serviceType]);

    useEffect(() => {
        // Reset services if query is too short
        if (query.length < minLength) {
            setServices([]);
            return;
        }

        // Debounce the search
        const timeoutId = setTimeout(() => {
            searchServices(query);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, minLength, debounceMs, searchServices]);

    return { services, isSearching, error };
}
