"use client";

/**
 * Room Management Dashboard
 * Visual display of room occupancy status
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Users, RefreshCw, Building2 } from "lucide-react";

interface Room {
    id: number;
    roomNumber: string;
    roomType: string;
    bedCount: number;
    occupiedBeds: number;
    occupancyRate: number;
    floor: string | null;
    building: string | null;
    dailyRate: string;
    facilities: string | null;
    status: string;
}

export default function RoomDashboardPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    /**
     * Fetch rooms data
     */
    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/rooms");
            const data = await response.json();

            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    /**
     * Get room status color
     */
    const getRoomStatusColor = (room: Room) => {
        if (room.occupiedBeds === 0) {
            return "bg-green-100 border-green-500 text-green-700";
        } else if (room.occupiedBeds < room.bedCount) {
            return "bg-yellow-100 border-yellow-500 text-yellow-700";
        } else {
            return "bg-red-100 border-red-500 text-red-700";
        }
    };

    /**
     * Get status badge
     */
    const getStatusBadge = (room: Room) => {
        if (room.occupiedBeds === 0) {
            return <Badge className="bg-green-600">Kosong</Badge>;
        } else if (room.occupiedBeds < room.bedCount) {
            return <Badge className="bg-yellow-600">Tersedia Sebagian</Badge>;
        } else {
            return <Badge className="bg-red-600">Penuh</Badge>;
        }
    };

    /**
     * Filter rooms
     */
    const filteredRooms = rooms.filter((room) => {
        if (filter === "available") return room.occupiedBeds === 0;
        if (filter === "occupied") return room.occupiedBeds > 0;
        if (filter === "full") return room.occupiedBeds === room.bedCount;
        return true;
    });

    /**
     * Calculate statistics
     */
    const stats = {
        total: rooms.length,
        available: rooms.filter((r) => r.occupiedBeds === 0).length,
        partial: rooms.filter((r) => r.occupiedBeds > 0 && r.occupiedBeds < r.bedCount).length,
        full: rooms.filter((r) => r.occupiedBeds === r.bedCount).length,
        totalBeds: rooms.reduce((sum, r) => sum + r.bedCount, 0),
        occupiedBeds: rooms.reduce((sum, r) => sum + r.occupiedBeds, 0),
    };

    const overallOccupancyRate =
        stats.totalBeds > 0
            ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
            : 0;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Kamar Rawat Inap</h1>
                    <p className="text-muted-foreground">
                        Manajemen dan visualisasi status hunian kamar
                    </p>
                </div>
                <Button variant="outline" onClick={fetchRooms} disabled={isLoading}>
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Kamar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalBeds} bed total
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">
                            Kamar Kosong
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            {stats.available}
                        </div>
                        <p className="text-xs text-green-600">Siap ditempati</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-700">
                            Terisi Sebagian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">
                            {stats.partial}
                        </div>
                        <p className="text-xs text-yellow-600">Masih ada bed tersedia</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">
                            Tingkat Hunian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">
                            {overallOccupancyRate}%
                        </div>
                        <p className="text-xs text-blue-600">
                            {stats.occupiedBeds} dari {stats.totalBeds} bed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    Semua ({rooms.length})
                </Button>
                <Button
                    variant={filter === "available" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("available")}
                >
                    Kosong ({stats.available})
                </Button>
                <Button
                    variant={filter === "occupied" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("occupied")}
                >
                    Terisi ({stats.partial + stats.full})
                </Button>
                <Button
                    variant={filter === "full" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("full")}
                >
                    Penuh ({stats.full})
                </Button>
            </div>

            {/* Room Grid */}
            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                            <p className="text-muted-foreground">Memuat data kamar...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredRooms.map((room) => (
                        <Card
                            key={room.id}
                            className={`border-l-4 ${getRoomStatusColor(room)}`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Kamar {room.roomNumber}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {room.roomType}
                                        </p>
                                    </div>
                                    {getStatusBadge(room)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Bed Info */}
                                <div className="flex items-center gap-2">
                                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {room.occupiedBeds} / {room.bedCount} bed terisi
                                    </span>
                                </div>

                                {/* Occupancy Rate */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Hunian</span>
                                        <span className="font-medium">{room.occupancyRate}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${
                                                room.occupancyRate === 100
                                                    ? "bg-red-600"
                                                    : room.occupancyRate > 0
                                                      ? "bg-yellow-600"
                                                      : "bg-green-600"
                                            }`}
                                            style={{ width: `${room.occupancyRate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                {(room.floor || room.building) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>
                                            {room.building && `${room.building}, `}
                                            {room.floor && `Lantai ${room.floor}`}
                                        </span>
                                    </div>
                                )}

                                {/* Daily Rate */}
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">Tarif Harian</p>
                                    <p className="text-sm font-semibold">
                                        Rp {parseFloat(room.dailyRate).toLocaleString("id-ID")}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={room.occupiedBeds === room.bedCount}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Lihat Detail
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {filteredRooms.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-lg font-medium">
                                Tidak ada kamar yang sesuai filter
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Coba ubah filter atau refresh data
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
