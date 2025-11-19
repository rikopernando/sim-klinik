/**
 * Dashboard Widget Component (H.3.1)
 * Reusable widget component for dashboard layouts
 */

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DashboardWidgetProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
    variant?: "default" | "compact";
}

export function DashboardWidget({
    title,
    description,
    icon: Icon,
    iconColor = "text-primary",
    children,
    className,
    headerAction,
    variant = "default",
}: DashboardWidgetProps) {
    return (
        <Card className={cn("h-full", className)}>
            <CardHeader className={cn(variant === "compact" && "pb-3")}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={cn("h-5 w-5", iconColor)} />}
                        <div>
                            <CardTitle className={cn(variant === "compact" && "text-sm font-medium")}>
                                {title}
                            </CardTitle>
                            {description && (
                                <CardDescription className="mt-1">{description}</CardDescription>
                            )}
                        </div>
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
