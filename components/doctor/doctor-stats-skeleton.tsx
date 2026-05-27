import { Skeleton } from "@/components/ui/skeleton"

export function DoctorStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl border px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="mt-2 h-8 w-12" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}
