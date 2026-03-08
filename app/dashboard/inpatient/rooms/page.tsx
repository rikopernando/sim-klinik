"use client"

/**
 * Room Management Dashboard - Refactored
 * Visual display of room occupancy status with modular architecture
 */

import { useState, useEffect, useCallback } from "react"
import { PageGuard } from "@/components/auth/page-guard"
import { useSearchParams } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { Card, CardContent } from "@/components/ui/card"
import { useRoomDashboard } from "@/hooks/use-room-dashboard"
import { useRoomStatistics } from "@/hooks/use-room-statistics"
import { useRoomFilter } from "@/hooks/use-room-filter"
import { RoomDashboardHeader } from "@/components/inpatient/room-dashboard-header"
import { RoomStatisticsCards } from "@/components/inpatient/room-statistics-cards"
import { RoomFilterButtons } from "@/components/inpatient/room-filter-buttons"
import { RoomCard } from "@/components/inpatient/room-card"
import { AssignBedDialog } from "@/components/inpatient/assign-bed-dialog"
import type { RoomWithOccupancy } from "@/types/inpatient"

export default function RoomDashboardPage() {
  return (
    <PageGuard permissions={["inpatient:manage_beds"]}>
      <RoomDashboardPageContent />
    </PageGuard>
  )
}

function RoomDashboardPageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  // State
  const [assignBedDialogOpen, setAssignBedDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithOccupancy | null>(null)

  // Hooks
  const { rooms, isLoading, lastRefresh, refresh } = useRoomDashboard({
    autoRefresh: true,
    refreshInterval: 30000,
  })
  const statistics = useRoomStatistics(rooms)
  const { filter, setFilter, filteredRooms } = useRoomFilter(rooms)

  // Auto-open bed assignment dialog when coming from registration
  useEffect(() => {
    const assignBedVisitId = searchParams.get("assignBed")
    if (assignBedVisitId && session?.user?.id) {
      setAssignBedDialogOpen(true)
    }
  }, [searchParams, session])

  // Handlers
  const handleAssignBed = useCallback((room: RoomWithOccupancy) => {
    setSelectedRoom(room)
    setAssignBedDialogOpen(true)
  }, [])

  const handleAssignSuccess = useCallback(() => {
    refresh()
    setSelectedRoom(null)
  }, [refresh])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <RoomDashboardHeader lastRefresh={lastRefresh} onRefresh={refresh} isLoading={isLoading} />

      {/* Statistics */}
      <RoomStatisticsCards statistics={statistics} />

      {/* Filters */}
      <RoomFilterButtons
        currentFilter={filter}
        onFilterChange={setFilter}
        statistics={statistics}
      />

      {/* Room Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="text-muted-foreground mx-auto mb-2 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Memuat data kamar...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-medium">Tidak ada kamar yang sesuai filter</p>
              <p className="text-muted-foreground text-sm">Coba ubah filter atau refresh data</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onAssignBed={handleAssignBed} />
          ))}
        </div>
      )}

      {/* Assign Bed Dialog */}
      {session?.user?.id && (
        <AssignBedDialog
          open={assignBedDialogOpen}
          onOpenChange={setAssignBedDialogOpen}
          preSelectedRoomId={selectedRoom?.id}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  )
}
