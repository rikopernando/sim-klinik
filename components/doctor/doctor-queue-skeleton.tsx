/**
 * Doctor Dashboard Queue Skeleton
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardSection } from "@/components/dashboard"

export function DoctorQueueSkeleton() {
  return (
    <DashboardSection title="Antrian Pasien" description="Daftar pasien yang perlu ditangani">
      <div className="space-y-4">
        {/* Tabs Skeleton */}
        <div className="grid w-full grid-cols-3 gap-2">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>

        {/* List Items Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-[120px]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                  <Skeleton className="h-8 w-[70px] rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
