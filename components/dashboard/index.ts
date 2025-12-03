/**
 * Dashboard Components - Barrel Export (H.3.1)
 * Reusable dashboard framework for all role-based dashboards
 */

// Layout components
export { DashboardWidget } from "./dashboard-widget"
export type { DashboardWidgetProps } from "./dashboard-widget"

export { DashboardGrid, DashboardSection } from "./dashboard-grid"
export type { DashboardGridProps, DashboardSectionProps } from "./dashboard-grid"

// Widget variants
export { StatWidget } from "./widgets/stat-widget"
export type { StatWidgetProps } from "./widgets/stat-widget"

export { ListWidget } from "./widgets/list-widget"
export type { ListWidgetProps, ListWidgetItem } from "./widgets/list-widget"

export { TableWidget } from "./widgets/table-widget"
export type { TableWidgetProps, TableColumn } from "./widgets/table-widget"

export { ChartWidget } from "./widgets/chart-widget"
export type { ChartWidgetProps } from "./widgets/chart-widget"
