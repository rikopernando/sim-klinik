/**
 * Patients Pagination Component
 * Navigation controls for paginated patient list
 */

import { Button } from "@/components/ui/button";
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface PatientsPaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

export function PatientsPagination({
    pagination,
    onPageChange,
}: PatientsPaginationProps) {
    if (pagination.totalPages <= 1) {
        return null;
    }

    const canGoPrevious = pagination.page > 1;
    const canGoNext = pagination.page < pagination.totalPages;

    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Halaman {pagination.page} dari {pagination.totalPages}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={!canGoPrevious}
                    title="First page"
                >
                    <IconChevronsLeft size={16} />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={!canGoPrevious}
                    title="Previous page"
                >
                    <IconChevronLeft size={16} />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={!canGoNext}
                    title="Next page"
                >
                    <IconChevronRight size={16} />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={!canGoNext}
                    title="Last page"
                >
                    <IconChevronsRight size={16} />
                </Button>
            </div>
        </div>
    );
}
