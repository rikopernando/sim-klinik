/**
 * useRooms Hook
 * Manages room data fetching and state
 */

import { useState, useEffect, useCallback } from "react";
import { RoomWithOccupancy, RoomStatistics, APIResponse } from "@/types/inpatient";
import { calculateRoomStatistics, sortRoomsByNumber } from "@/lib/inpatient/room-utils";

interface UseRoomsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    statusFilter?: string;
    roomTypeFilter?: string;
}

interface UseRoomsReturn {
    rooms: RoomWithOccupancy[];
    sortedRooms: RoomWithOccupancy[];
    statistics: RoomStatistics;
    isLoading: boolean;
    error: string | null;
    fetchRooms: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useRooms(options: UseRoomsOptions = {}): UseRoomsReturn {
    const { autoRefresh = false, refreshInterval = 60000, statusFilter, roomTypeFilter } = options;

    const [rooms, setRooms] = useState<RoomWithOccupancy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch rooms data from API
     */
    const fetchRooms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (statusFilter) params.append("status", statusFilter);
            if (roomTypeFilter) params.append("roomType", roomTypeFilter);

            const response = await fetch(`/api/rooms?${params.toString()}`);
            const data: APIResponse<RoomWithOccupancy[]> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch rooms");
            }

            setRooms(data.data || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch rooms";
            setError(errorMessage);
            console.error("Rooms fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, roomTypeFilter]);

    /**
     * Manual refresh
     */
    const refresh = useCallback(async () => {
        await fetchRooms();
    }, [fetchRooms]);

    /**
     * Calculate statistics from rooms
     */
    const statistics = calculateRoomStatistics(rooms);

    /**
     * Sort rooms by room number
     */
    const sortedRooms = sortRoomsByNumber(rooms);

    /**
     * Initial fetch
     */
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    /**
     * Auto-refresh interval
     */
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchRooms();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchRooms]);

    return {
        rooms,
        sortedRooms,
        statistics,
        isLoading,
        error,
        fetchRooms,
        refresh,
    };
}
