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
    <Tabs value={activeStatus} onValueChange={onStatusChange}>
      <div className="overflow-x-auto">
        <TabsList className="inline-flex">
          <TabsTrigger value="all" className="gap-2">
            Semua
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{counts.all}</span>
          </TabsTrigger>

          <TabsTrigger value="registered" className="gap-2">
            Terdaftar
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{counts.registered}</span>
          </TabsTrigger>

          <TabsTrigger value="in_examination" className="gap-2">
            Diperiksa
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
              {counts.in_examination}
            </span>
          </TabsTrigger>

          <TabsTrigger value="examined" className="gap-2">
            Selesai
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{counts.examined}</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  )
}
