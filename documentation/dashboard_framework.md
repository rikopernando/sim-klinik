# Dashboard Framework (H.3.1)

**Reusable Dashboard Layout Component with Widget System**

This document describes the dashboard framework that provides a consistent, reusable foundation for all role-based dashboards in the clinic management system.

---

## Overview

**Task:** H.3.1 - Create reusable dashboard layout component with widget system
**Implementation Date:** 2025-11-20
**Status:** ✅ Completed
**Priority:** High

The dashboard framework provides a set of composable components for building role-specific dashboards with consistent styling, layout, and user experience.

---

## Architecture

### Component Hierarchy

```
Dashboard Framework
├── Layout Components
│   ├── DashboardWidget (Base container)
│   ├── DashboardGrid (Responsive grid)
│   └── DashboardSection (Grouped sections)
└── Widget Variants
    ├── StatWidget (Metrics & KPIs)
    ├── ListWidget (Activity lists)
    ├── TableWidget (Tabular data)
    └── ChartWidget (Visualizations)
```

---

## Components

### 1. DashboardWidget (Base Component)

**File:** `/components/dashboard/dashboard-widget.tsx`

Base container component that wraps all dashboard widgets with consistent styling.

**Props:**

```typescript
interface DashboardWidgetProps {
  title: string // Widget title
  description?: string // Optional description
  icon?: LucideIcon // Optional icon
  iconColor?: string // Icon color class
  children: ReactNode // Widget content
  className?: string // Additional classes
  headerAction?: ReactNode // Action button/element in header
  variant?: "default" | "compact" // Display variant
}
```

**Usage:**

```tsx
import { DashboardWidget } from "@/components/dashboard"
import { Users } from "lucide-react"
;<DashboardWidget
  title="Total Patients"
  description="Registered patients"
  icon={Users}
  iconColor="text-blue-500"
>
  <p className="text-3xl font-bold">245</p>
</DashboardWidget>
```

---

### 2. DashboardGrid

**File:** `/components/dashboard/dashboard-grid.tsx`

Responsive grid layout for organizing widgets.

**Props:**

```typescript
interface DashboardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6 // Grid columns (default: 3)
  gap?: "sm" | "md" | "lg" // Grid gap size
  className?: string
}
```

**Usage:**

```tsx
import { DashboardGrid } from "@/components/dashboard"
;<DashboardGrid columns={4} gap="lg">
  {/* Widgets go here */}
</DashboardGrid>
```

**Responsive Behavior:**

- Mobile: 1 column
- Desktop: Specified column count
- Auto-adjusts to screen size

---

### 3. DashboardSection

**File:** `/components/dashboard/dashboard-grid.tsx`

Groups related widgets with optional header.

**Props:**

```typescript
interface DashboardSectionProps {
  title?: string // Section title
  description?: string // Section description
  children: ReactNode
  className?: string
  action?: ReactNode // Header action element
}
```

**Usage:**

```tsx
import { DashboardSection } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
;<DashboardSection
  title="Key Metrics"
  description="Overview statistik hari ini"
  action={<Button>View All</Button>}
>
  {/* Widgets or grids go here */}
</DashboardSection>
```

---

### 4. StatWidget

**File:** `/components/dashboard/widgets/stat-widget.tsx`

Display key metrics and statistics.

**Props:**

```typescript
interface StatWidgetProps {
  title: string
  value: string | number // Main metric value
  subtitle?: string // Secondary info
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number // Percentage change
    label: string // Trend label
    isPositive?: boolean // Green (up) or red (down)
  }
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  className?: string
}
```

**Usage:**

```tsx
import { StatWidget } from "@/components/dashboard"
import { Users } from "lucide-react"
;<StatWidget
  title="Total Pasien"
  value={245}
  subtitle="pasien terdaftar"
  icon={Users}
  iconColor="text-blue-500"
  trend={{ value: 12, label: "dari bulan lalu", isPositive: true }}
  badge={{ label: "Live", variant: "default" }}
/>
```

**Visual Output:**

```
┌──────────────────────────┐
│ 👥 Total Pasien    [Live]│
│                          │
│ 245                      │
│ pasien terdaftar         │
│ ↑ 12% dari bulan lalu    │
└──────────────────────────┘
```

---

### 5. ListWidget

**File:** `/components/dashboard/widgets/list-widget.tsx`

Display lists of items with optional actions.

**Props:**

```typescript
interface ListWidgetItem {
  id: string | number
  title: string
  subtitle?: string
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
}

interface ListWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  items: ListWidgetItem[]
  emptyMessage?: string
  maxHeight?: string // Scroll after this height
  headerAction?: ReactNode
  className?: string
  onItemClick?: (item: ListWidgetItem) => void
}
```

**Usage:**

```tsx
import { ListWidget } from "@/components/dashboard"
import { Activity, Users } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "New patient registered",
    subtitle: "John Doe - MR123456",
    icon: Users,
    badge: { label: "New", variant: "default" },
    action: {
      label: "View",
      onClick: () => console.log("View patient"),
    },
  },
]

;<ListWidget
  title="Aktivitas Terkini"
  description="Aktivitas sistem dalam 1 jam terakhir"
  icon={Activity}
  items={activities}
  maxHeight="350px"
  onItemClick={(item) => console.log("Clicked:", item)}
/>
```

---

### 6. TableWidget

**File:** `/components/dashboard/widgets/table-widget.tsx`

Display tabular data with custom column rendering.

**Props:**

```typescript
interface TableColumn<T> {
  header: string
  accessorKey: keyof T | string
  cell?: (row: T) => ReactNode // Custom cell renderer
  className?: string
}

interface TableWidgetProps<T> {
  title: string
  description?: string
  icon?: LucideIcon
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  maxHeight?: string
  headerAction?: ReactNode
  className?: string
  onRowClick?: (row: T) => void
}
```

**Usage:**

```tsx
import { TableWidget } from "@/components/dashboard"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const columns = [
  { header: "Nama", accessorKey: "name" },
  { header: "No. RM", accessorKey: "mrNumber" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => <Badge>{row.status}</Badge>,
  },
]

const data = [
  { name: "John Doe", mrNumber: "MR001", status: "Active" },
  { name: "Jane Smith", mrNumber: "MR002", status: "Completed" },
]

;<TableWidget
  title="Antrian Pasien"
  icon={Users}
  columns={columns}
  data={data}
  onRowClick={(row) => console.log("Selected:", row)}
/>
```

---

### 7. ChartWidget

**File:** `/components/dashboard/widgets/chart-widget.tsx`

Wrapper for chart libraries (Recharts, Chart.js, etc.).

**Props:**

```typescript
interface ChartWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode // Chart component
  headerAction?: ReactNode
  className?: string
}
```

**Usage:**

```tsx
import { ChartWidget } from "@/components/dashboard"
import { TrendingUp } from "lucide-react"
// import { LineChart, Line } from "recharts"; // Future integration
;<ChartWidget title="Revenue Trend" description="Pendapatan 7 hari terakhir" icon={TrendingUp}>
  {/* Chart component goes here */}
  <div className="h-64">Chart placeholder</div>
</ChartWidget>
```

---

## Complete Dashboard Example

**File:** `/app/dashboard/example/page.tsx`

See the example dashboard for a complete demonstration of all components working together.

**URL:** `http://localhost:3000/dashboard/example`

**Structure:**

```tsx
export default function ExampleDashboard() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1>Dashboard Title</h1>
                <Button>Action</Button>
            </div>

            {/* Stats Section */}
            <DashboardSection title="Key Metrics">
                <DashboardGrid columns={4}>
                    <StatWidget {...} />
                    <StatWidget {...} />
                    <StatWidget {...} />
                    <StatWidget {...} />
                </DashboardGrid>
            </DashboardSection>

            {/* Content Section */}
            <DashboardSection title="Activity & Queue">
                <DashboardGrid columns={2}>
                    <ListWidget {...} />
                    <TableWidget {...} />
                </DashboardGrid>
            </DashboardSection>

            {/* Chart Section */}
            <DashboardSection title="Analytics">
                <DashboardGrid columns={1}>
                    <ChartWidget {...} />
                </DashboardGrid>
            </DashboardSection>
        </div>
    );
}
```

---

## Import Pattern

Use barrel export for clean imports:

```tsx
// ✅ Recommended
import {
  DashboardGrid,
  DashboardSection,
  StatWidget,
  ListWidget,
  TableWidget,
} from "@/components/dashboard"

// ❌ Avoid
import { StatWidget } from "@/components/dashboard/widgets/stat-widget"
```

---

## Design Patterns

### 1. Consistent Layout

All dashboards should follow this structure:

```tsx
<div className="container mx-auto space-y-6 p-6">
  {/* 1. Header with title and actions */}
  {/* 2. Stats section with 3-4 key metrics */}
  {/* 3. Content sections with mixed widget types */}
  {/* 4. Optional chart/analytics section */}
</div>
```

### 2. Responsive Grid

Use appropriate column counts:

- **4 columns**: Stat cards (main metrics)
- **3 columns**: Balanced layout (medium widgets)
- **2 columns**: Side-by-side comparison (lists, tables)
- **1 column**: Full-width content (charts, tables)

### 3. Visual Hierarchy

**Priority Levels:**

1. **Primary metrics** → StatWidget (top row, 4 columns)
2. **Activity/Queue** → ListWidget/TableWidget (middle, 2-3 columns)
3. **Analytics** → ChartWidget (bottom, full width)

### 4. Loading States

Add loading states to widgets:

```tsx
{
  isLoading ? (
    <StatWidget title="Loading..." value={<Loader2 className="animate-spin" />} />
  ) : (
    <StatWidget title="Total Pasien" value={data.count} />
  )
}
```

### 5. Empty States

Handle empty data gracefully:

```tsx
<ListWidget items={activities} emptyMessage="Belum ada aktivitas hari ini" />
```

---

## Role-Specific Dashboard Implementation

### Example: Doctor Dashboard (H.3.3)

```tsx
"use client"

import { DashboardGrid, DashboardSection, StatWidget, ListWidget } from "@/components/dashboard"
import { Stethoscope, Users, FileText } from "lucide-react"

export default function DoctorDashboard() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard Dokter</h1>

      {/* Key Metrics */}
      <DashboardSection title="Statistik Hari Ini">
        <DashboardGrid columns={3}>
          <StatWidget
            title="Antrian Pasien"
            value={12}
            subtitle="pasien menunggu"
            icon={Users}
            iconColor="text-blue-500"
          />
          <StatWidget
            title="Pasien Selesai"
            value={8}
            subtitle="pasien hari ini"
            icon={Stethoscope}
            iconColor="text-green-500"
          />
          <StatWidget
            title="RME Belum Dikunci"
            value={3}
            subtitle="rekam medis"
            icon={FileText}
            iconColor="text-orange-500"
            badge={{ label: "Action Needed", variant: "destructive" }}
          />
        </DashboardGrid>
      </DashboardSection>

      {/* Patient Queue */}
      <DashboardSection title="Antrian Pasien">
        <ListWidget
          title="Pasien Menunggu"
          icon={Users}
          items={patientQueue}
          onItemClick={(patient) => router.push(`/medical-records/${patient.id}`)}
        />
      </DashboardSection>
    </div>
  )
}
```

---

## Best Practices

### ✅ DO

- Use consistent spacing (`space-y-6` for sections)
- Provide meaningful empty states
- Add loading indicators for async data
- Use appropriate icon colors for visual distinction
- Keep stat values concise and readable
- Enable click handlers for interactive widgets
- Add header actions for quick access

### ❌ DON'T

- Mix different gap sizes in the same dashboard
- Overload stat widgets with too much info
- Use more than 4-5 stat cards in one row
- Forget to handle loading and error states
- Hard-code data - use hooks/API calls
- Skip accessibility (ARIA labels, keyboard nav)

---

## Styling Customization

All widgets use shadcn/ui components and Tailwind classes:

**Color Variables (from `globals.css`):**

```css
--primary: #1e90ff --secondary: #2c3e50 --accent: #00cec9 --muted: #f8f9fa --destructive: #ef4444;
```

**Custom Widget Colors:**

```tsx
<StatWidget
  iconColor="text-blue-500" // Primary metric
  iconColor="text-green-500" // Positive/success
  iconColor="text-yellow-500" // Warning
  iconColor="text-red-500" // Alert/critical
  iconColor="text-purple-500" // Info/secondary
/>
```

---

## Performance Considerations

### Data Fetching

Use React hooks with auto-refresh:

```tsx
const { data, isLoading, refresh } = usePatientQueue({
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
})
```

### Lazy Loading

For large lists, use virtual scrolling:

```tsx
<ListWidget
  items={largeDataset}
  maxHeight="400px" // Enables scrolling
/>
```

### Memoization

Prevent unnecessary re-renders:

```tsx
const columns = useMemo(
  () => [
    { header: "Name", accessorKey: "name" },
    { header: "Status", accessorKey: "status" },
  ],
  []
)
```

---

## Future Enhancements

### Chart Integration

Install chart library (e.g., Recharts):

```bash
npm install recharts
```

Use with ChartWidget:

```tsx
import { LineChart, Line, XAxis, YAxis } from "recharts"
;<ChartWidget title="Revenue Trend">
  <LineChart data={revenueData} width={600} height={300}>
    <XAxis dataKey="date" />
    <YAxis />
    <Line dataKey="revenue" stroke="#1E90FF" />
  </LineChart>
</ChartWidget>
```

### Real-time Updates

Integrate with SSE/WebSocket:

```tsx
const { data } = useRealtimeQueue() // SSE hook

;<ListWidget items={data} />
```

### Drag & Drop Dashboard

Allow users to customize widget layout:

```tsx
import { DndContext } from "@dnd-kit/core"
;<DndContext onDragEnd={handleDragEnd}>
  <DashboardGrid columns={3}>{/* Draggable widgets */}</DashboardGrid>
</DndContext>
```

---

## Testing

### Unit Tests

Test individual widget rendering:

```tsx
describe("StatWidget", () => {
  it("displays metric value correctly", () => {
    render(<StatWidget title="Total" value={100} />)
    expect(screen.getByText("100")).toBeInTheDocument()
  })

  it("shows trend indicator", () => {
    render(<StatWidget title="Total" value={100} trend={{ value: 10, isPositive: true }} />)
    expect(screen.getByText("↑ 10%")).toBeInTheDocument()
  })
})
```

### Integration Tests

Test dashboard composition:

```tsx
describe("DoctorDashboard", () => {
  it("renders all stat widgets", () => {
    render(<DoctorDashboard />)
    expect(screen.getByText("Antrian Pasien")).toBeInTheDocument()
    expect(screen.getByText("Pasien Selesai")).toBeInTheDocument()
  })
})
```

---

## Troubleshooting

**Problem:** Widgets not responsive on mobile
**Solution:** Ensure parent container uses `grid-cols-1` base class

**Problem:** Icons not displaying
**Solution:** Import from `lucide-react` correctly

**Problem:** TypeScript errors with generic TableWidget
**Solution:** Explicitly type your data: `TableWidget<PatientData>`

**Problem:** Stat widget overflowing
**Solution:** Use shorter titles or adjust font size

---

## Related Documentation

- `/documentation/frontend_guidelines_document.md` - UI/UX patterns
- `/app/dashboard/page.tsx` - Role-based dashboard home
- `/app/dashboard/example/page.tsx` - Complete example implementation

---

## Summary

✅ **Task H.3.1 Complete**

**What was implemented:**

- ✅ DashboardWidget - Base container component
- ✅ DashboardGrid & DashboardSection - Layout components
- ✅ StatWidget - Metrics display
- ✅ ListWidget - Activity lists
- ✅ TableWidget - Tabular data
- ✅ ChartWidget - Visualization wrapper
- ✅ Barrel export for clean imports
- ✅ Complete example dashboard
- ✅ Comprehensive documentation

**Benefits:**

- Consistent dashboard UX across all roles
- Reusable, composable components
- Type-safe with TypeScript
- Responsive out of the box
- Easy to extend with new widget types
- Supports loading, error, and empty states
- Compatible with shadcn/ui design system

**Next Steps:**

- H.3.2 - Admin Dashboard (using framework)
- H.3.3 - Doctor Dashboard (using framework)
- H.3.4 - Nurse Dashboard (using framework)

---

**Last Updated:** 2025-11-20
**Implemented By:** Claude Code
**Task:** H.3.1
**Technology:** Next.js 15, React, TypeScript, shadcn/ui, Tailwind CSS
