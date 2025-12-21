/**
 * Room Card Component
 * Individual room display card with bed assignments
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BedDouble, Building2, UserPlus } from "lucide-react"
import { BedAssignmentCard } from "./bed-assignment-card"
import type { RoomWithOccupancy } from "@/types/inpatient"

interface RoomCardProps {
  room: RoomWithOccupancy
  onAssignBed: (room: RoomWithOccupancy) => void
}

export function RoomCard({ room, onAssignBed }: RoomCardProps) {
  // Status styling
  const getStatusColor = () => {
    if (room.occupiedBeds === 0) {
      return "bg-green-100 border-green-500 text-green-700 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400"
    } else if (room.occupiedBeds < room.bedCount) {
      return "bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-700 dark:text-yellow-400"
    } else {
      return "bg-red-100 border-red-500 text-red-700 dark:bg-red-950/20 dark:border-red-700 dark:text-red-400"
    }
  }

  const getStatusBadge = () => {
    if (room.occupiedBeds === 0) {
      return <Badge className="bg-green-600 dark:bg-green-700">Kosong</Badge>
    } else if (room.occupiedBeds < room.bedCount) {
      return <Badge className="bg-yellow-600 dark:bg-yellow-700">Tersedia Sebagian</Badge>
    } else {
      return <Badge className="bg-red-600 dark:bg-red-700">Penuh</Badge>
    }
  }

  const getOccupancyBarColor = () => {
    if (room.occupancyRate === 100) return "bg-red-600"
    if (room.occupancyRate > 0) return "bg-yellow-600"
    return "bg-green-600"
  }

  return (
    <Card className={`border-l-4 ${getStatusColor()}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Kamar {room.roomNumber}</CardTitle>
            <p className="text-muted-foreground text-sm">{room.roomType}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bed Info */}
        <div className="flex items-center gap-2">
          <BedDouble className="text-muted-foreground h-4 w-4" />
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
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full ${getOccupancyBarColor()}`}
              style={{ width: `${room.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Location */}
        {(room.floor || room.building) && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Building2 className="h-4 w-4" />
            <span>
              {room.building && `${room.building}, `}
              {room.floor && `Lantai ${room.floor}`}
            </span>
          </div>
        )}

        {/* Daily Rate */}
        <div className="border-t pt-2">
          <p className="text-muted-foreground text-xs">Tarif Harian</p>
          <p className="text-sm font-semibold">
            Rp {parseFloat(room.dailyRate).toLocaleString("id-ID")}
          </p>
        </div>

        {/* Bed Assignments */}
        {room.assignments && room.assignments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Pasien di Kamar Ini</p>
            <BedAssignmentCard assignments={room.assignments} roomBedCount={room.bedCount} />
          </div>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          className="w-full"
          disabled={room.occupiedBeds === room.bedCount}
          onClick={() => onAssignBed(room)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Alokasi Bed
        </Button>
      </CardContent>
    </Card>
  )
}
