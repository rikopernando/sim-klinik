/**
 * Doctor Dashboard Statistics Skeleton
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardGrid, DashboardSection } from "@/components/dashboard"

export function DoctorStatsSkeleton() {
  return (
    <DashboardSection title="Statistik Hari Ini" description="Overview kunjungan pasien">
      <DashboardGrid columns={4}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-[60px]" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </DashboardGrid>
    </DashboardSection>
  )
}
