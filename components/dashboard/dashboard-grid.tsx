/**
 * Dashboard Grid Layout Component (H.3.1)
 * Responsive grid layout for dashboard widgets
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: "sm" | "md" | "lg";
    className?: string;
}

export function DashboardGrid({
    children,
    columns = 3,
    gap = "md",
    className,
}: DashboardGridProps) {
    const columnsClass = {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4",
        5: "md:grid-cols-5",
        6: "md:grid-cols-6",
    };

    const gapClass = {
        sm: "gap-3",
        md: "gap-4",
        lg: "gap-6",
    };

    return (
        <div
            className={cn(
                "grid grid-cols-1",
                columnsClass[columns],
                gapClass[gap],
                className
            )}
        >
            {children}
        </div>
    );
}

export interface DashboardSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function DashboardSection({
    title,
    description,
    children,
    className,
    action,
}: DashboardSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {(title || description || action) && (
                <div className="flex items-center justify-between">
                    <div>
                        {title && <h2 className="text-xl font-semibold">{title}</h2>}
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
