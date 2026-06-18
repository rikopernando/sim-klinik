export function ERQueueLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div>
                <div className="bg-muted mb-1.5 h-3.5 w-36 animate-pulse rounded" />
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              </div>
            </div>
            <div className="bg-muted h-5 w-20 animate-pulse rounded-full" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="bg-muted h-3 w-28 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-muted h-7 w-14 animate-pulse rounded" />
              <div className="bg-muted h-7 w-32 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
