# Room Management Dashboard - Refactoring Summary

## Overview

Refactored the Room Management Dashboard (`/app/dashboard/inpatient/rooms/page.tsx`) following modular architecture principles for better maintainability, readability, and performance.

---

## Refactoring Results

### Before vs After

**Before:**
- **340+ lines** in single file
- Inline functions and calculations
- Difficult to test individual components
- Mixed concerns (UI, logic, state management)

**After:**
- **100 lines** in main page (71% reduction)
- Modular components and custom hooks
- Easy to test each module independently
- Clear separation of concerns

---

## New Architecture

### Custom Hooks (3)

#### 1. `useRoomDashboard` (`/hooks/use-room-dashboard.ts`)
**Purpose:** Fetch room data with auto-refresh capability

**Features:**
- Automatic polling with configurable interval
- Manual refresh function
- Loading and error states
- Last refresh timestamp

**Usage:**
```typescript
const { rooms, isLoading, lastRefresh, refresh } = useRoomDashboard({
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
})
```

**Benefits:**
- Reusable across multiple pages
- Auto-refresh keeps data current
- Consistent error handling

---

#### 2. `useRoomStatistics` (`/hooks/use-room-statistics.ts`)
**Purpose:** Calculate statistics from room data

**Returns:**
```typescript
{
  total: number          // Total rooms
  available: number      // Fully empty rooms
  partial: number        // Partially occupied
  full: number          // Fully occupied
  totalBeds: number     // Total bed count
  occupiedBeds: number  // Occupied bed count
  occupancyRate: number // Overall occupancy %
}
```

**Benefits:**
- Memoized calculations (no recalculation on unrelated renders)
- Single source of truth for statistics
- Easy to add new metrics

---

#### 3. `useRoomFilter` (`/hooks/use-room-filter.ts`)
**Purpose:** Handle room filtering logic

**Filter Types:**
- `all` - Show all rooms
- `available` - Only empty rooms
- `occupied` - Rooms with at least one patient
- `full` - Fully occupied rooms

**Usage:**
```typescript
const { filter, setFilter, filteredRooms } = useRoomFilter(rooms)
```

**Benefits:**
- Memoized filtering (performance optimization)
- Centralized filter logic
- Type-safe filter values

---

### UI Components (4)

#### 1. `RoomDashboardHeader` (`/components/inpatient/room-dashboard-header.tsx`)
**Purpose:** Page header with title and refresh button

**Props:**
- `lastRefresh: Date | null` - Timestamp of last data fetch
- `onRefresh: () => void` - Refresh callback
- `isLoading: boolean` - Loading state

**Features:**
- Shows last update time in Indonesian format
- Animated refresh icon when loading
- Responsive layout

---

#### 2. `RoomStatisticsCards` (`/components/inpatient/room-statistics-cards.tsx`)
**Purpose:** Display 4 statistic cards

**Cards:**
1. **Total Kamar** (neutral)
2. **Kamar Kosong** (green)
3. **Terisi Sebagian** (yellow)
4. **Tingkat Hunian** (blue)

**Features:**
- Color-coded by status
- Dark mode support
- Responsive grid layout

---

#### 3. `RoomFilterButtons` (`/components/inpatient/room-filter-buttons.tsx`)
**Purpose:** Filter toggle buttons

**Buttons:**
- Semua (count)
- Kosong (count)
- Terisi (count)
- Penuh (count)

**Features:**
- Active state highlighting
- Dynamic counts
- Keyboard accessible

---

#### 4. `RoomCard` (`/components/inpatient/room-card.tsx`)
**Purpose:** Individual room display card

**Sections:**
- Header (room number, type, status badge)
- Bed info (occupancy count)
- Occupancy rate (visual progress bar)
- Location (floor, building)
- Daily rate
- Bed assignments (if any)
- Assign bed button

**Features:**
- Color-coded border (green/yellow/red)
- Dynamic status styling
- Displays current patients
- Disabled when full

---

## File Structure

```
hooks/
├── use-room-dashboard.ts     # Data fetching with auto-refresh
├── use-room-statistics.ts    # Statistics calculation
└── use-room-filter.ts        # Filtering logic

components/inpatient/
├── room-dashboard-header.tsx     # Header component
├── room-statistics-cards.tsx     # Statistics display
├── room-filter-buttons.tsx       # Filter controls
├── room-card.tsx                 # Room card
├── bed-assignment-card.tsx       # (existing) Bed info
└── assign-bed-dialog.tsx         # (existing) Assignment dialog

app/dashboard/inpatient/rooms/
├── page.tsx                  # Refactored main page (100 lines)
└── page.tsx.backup          # Original backup (340+ lines)
```

---

## Code Comparison

### Before (340+ lines)

```typescript
export default function RoomDashboardPage() {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  // Inline fetch function
  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/rooms")
      // ... 15 lines of fetch logic
    } catch (error) {
      // ...
    }
  }

  // Inline filter logic
  const filteredRooms = rooms.filter((room) => {
    if (filter === "available") return room.occupiedBeds === 0
    // ... 5 lines
  })

  // Inline statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.occupiedBeds === 0).length,
    // ... 10 lines
  }

  // Inline status functions
  const getRoomStatusColor = (room: RoomWithOccupancy) => {
    // ... 8 lines
  }

  const getStatusBadge = (room: RoomWithOccupancy) => {
    // ... 8 lines
  }

  return (
    <div className="space-y-6 p-6">
      {/* 200+ lines of JSX */}
      {/* Header */}
      <div className="flex...">
        <h1>Dashboard Kamar...</h1>
        {/* ... */}
      </div>

      {/* Statistics Cards */}
      <div className="grid...">
        <Card>...</Card>
        <Card>...</Card>
        {/* ... */}
      </div>

      {/* Filter Buttons */}
      <div className="flex...">
        <Button>...</Button>
        {/* ... */}
      </div>

      {/* Room Grid */}
      <div className="grid...">
        {filteredRooms.map((room) => (
          <Card className={getRoomStatusColor(room)}>
            {/* 50+ lines per card */}
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### After (100 lines)

```typescript
export default function RoomDashboardPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  // State
  const [assignBedDialogOpen, setAssignBedDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithOccupancy | null>(null)

  // Hooks (all logic extracted)
  const { rooms, isLoading, lastRefresh, refresh } = useRoomDashboard({
    autoRefresh: true,
    refreshInterval: 30000,
  })
  const statistics = useRoomStatistics(rooms)
  const { filter, setFilter, filteredRooms } = useRoomFilter(rooms)

  // Auto-open dialog
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
      {/* All UI components extracted */}
      <RoomDashboardHeader
        lastRefresh={lastRefresh}
        onRefresh={refresh}
        isLoading={isLoading}
      />
      <RoomStatisticsCards statistics={statistics} />
      <RoomFilterButtons
        currentFilter={filter}
        onFilterChange={setFilter}
        statistics={statistics}
      />

      {/* Loading/Empty/Grid states */}
      {isLoading ? (
        <LoadingState />
      ) : filteredRooms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onAssignBed={handleAssignBed} />
          ))}
        </div>
      )}

      <AssignBedDialog {...dialogProps} />
    </div>
  )
}
```

---

## Benefits

### 1. **Maintainability** ✅
- Each component has single responsibility
- Easy to locate and fix bugs
- Clear module boundaries

### 2. **Readability** ✅
- Main page is now high-level composition
- No complex inline logic
- Self-documenting component names

### 3. **Performance** ✅
- Memoized calculations (useMemo in hooks)
- Memoized callbacks (useCallback)
- No unnecessary re-renders

### 4. **Reusability** ✅
- Hooks can be used in other pages
- Components can be reused
- Consistent UI patterns

### 5. **Testability** ✅
- Each hook can be unit tested
- Each component can be tested in isolation
- Easy to mock dependencies

### 6. **Scalability** ✅
- Easy to add new filters
- Easy to add new statistics
- Easy to add new card types

---

## Performance Optimizations

### Before:
```typescript
// Recalculated on EVERY render
const stats = {
  total: rooms.length,
  available: rooms.filter(...).length,
  partial: rooms.filter(...).length,
  full: rooms.filter(...).length,
}

// Filtering happens on every render
const filteredRooms = rooms.filter(...)
```

### After:
```typescript
// Memoized - only recalculates when rooms change
const statistics = useRoomStatistics(rooms)

// Memoized - only recalculates when rooms or filter change
const { filter, setFilter, filteredRooms } = useRoomFilter(rooms)
```

**Result:** Significant reduction in unnecessary calculations on re-renders.

---

## Auto-Refresh Feature

**New Feature Added:**
```typescript
const { rooms, isLoading, lastRefresh, refresh } = useRoomDashboard({
  autoRefresh: true,
  refreshInterval: 30000, // Refresh every 30 seconds
})
```

**Benefits:**
- Real-time data without manual refresh
- Configurable interval
- Can be disabled per page
- Shows last update timestamp

---

## Testing Strategy

### Unit Tests (Hooks)

**`useRoomStatistics.test.ts`**
```typescript
describe('useRoomStatistics', () => {
  it('calculates statistics correctly', () => {
    const rooms = [/* test data */]
    const { result } = renderHook(() => useRoomStatistics(rooms))

    expect(result.current.total).toBe(5)
    expect(result.current.available).toBe(2)
    expect(result.current.occupancyRate).toBe(40)
  })
})
```

**`useRoomFilter.test.ts`**
```typescript
describe('useRoomFilter', () => {
  it('filters available rooms', () => {
    const rooms = [/* test data */]
    const { result } = renderHook(() => useRoomFilter(rooms))

    act(() => result.current.setFilter('available'))

    expect(result.current.filteredRooms).toHaveLength(2)
  })
})
```

### Component Tests

**`RoomCard.test.tsx`**
```typescript
describe('RoomCard', () => {
  it('shows green border for empty room', () => {
    render(<RoomCard room={emptyRoom} onAssignBed={jest.fn()} />)

    expect(screen.getByText('Kosong')).toBeInTheDocument()
  })

  it('disables button when full', () => {
    render(<RoomCard room={fullRoom} onAssignBed={jest.fn()} />)

    expect(screen.getByText('Alokasi Bed')).toBeDisabled()
  })
})
```

---

## Migration Notes

### Backup Created
Original file backed up at:
```
/app/dashboard/inpatient/rooms/page.tsx.backup
```

### Breaking Changes
**None** - All functionality preserved, just reorganized.

### API Changes
**None** - Same API endpoints, same data structure.

---

## Future Enhancements

Now that the dashboard is modular, these features are easier to add:

1. **Room Search**
   - Add `useRoomSearch` hook
   - Add `RoomSearchBar` component

2. **Advanced Filters**
   - Filter by room type
   - Filter by floor/building
   - Price range filter

3. **Sort Options**
   - Sort by room number
   - Sort by occupancy rate
   - Sort by daily rate

4. **Export Data**
   - Export to PDF
   - Export to Excel
   - Print room report

5. **Real-time Updates**
   - WebSocket integration
   - Live bed assignment updates
   - Notifications for status changes

---

**Document Version:** 1.0
**Last Updated:** 2025-12-21
**Status:** ✅ Refactored and Ready
