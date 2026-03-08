/**
 * ER Queue Tabs Component
 * Filters ER queue by visit status
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ERQueueTabsProps {
  activeStatus: string
  onStatusChange: (status: string) => void
  counts: {
    all: number
    registered: number
    in_examination: number
    examined: number
  }
}

export function ERQueueTabs({ activeStatus, onStatusChange, counts }: ERQueueTabsProps) {
  return (
    <Tabs value={activeStatus} onValueChange={onStatusChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          Semua
          <span className="bg-muted ml-2 rounded-full px-2 py-0.5 text-xs">{counts.all}</span>
        </TabsTrigger>

        <TabsTrigger value="registered">
          Terdaftar
          <span className="bg-muted ml-2 rounded-full px-2 py-0.5 text-xs">
            {counts.registered}
          </span>
        </TabsTrigger>

        <TabsTrigger value="in_examination">
          Sedang Diperiksa
          <span className="bg-muted ml-2 rounded-full px-2 py-0.5 text-xs">
            {counts.in_examination}
          </span>
        </TabsTrigger>

        <TabsTrigger value="examined">
          Selesai Diperiksa
          <span className="bg-muted ml-2 rounded-full px-2 py-0.5 text-xs">{counts.examined}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
