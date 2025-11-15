/**
 * Reusable List Item Component for RME lists
 */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    showDelete?: boolean;
    className?: string;
}

export function ListItem({ children, onDelete, showDelete = true, className }: ListItemProps) {
    return (
        <div className={`flex items-start justify-between rounded-lg border p-4 ${className || ""}`}>
            <div className="flex-1">{children}</div>
            {showDelete && onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            )}
        </div>
    );
}
