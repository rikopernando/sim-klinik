/**
 * Pagination Component
 * Navigation for paginated data
 */

"use client";

import { Button } from "@/components/ui/button";
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
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
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrevious}
                    title="Previous page"
                >
                    <IconChevronLeft size={16} />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    title="Next page"
                >
                    <IconChevronRight size={16} />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoNext}
                    title="Last page"
                >
                    <IconChevronsRight size={16} />
                </Button>
            </div>
        </div>
    );
}
