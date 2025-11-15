/**
 * Empty State Component for RME
 */

interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
