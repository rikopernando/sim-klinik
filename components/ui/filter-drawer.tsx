"use client"

/**
 * Filter Drawer Component
 * Reusable drawer for filter controls with active filter count badge
 */

import * as React from "react"
import { Filter, RotateCcw } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"

interface FilterDrawerProps {
  activeFilterCount: number
  onReset: () => void
  children: React.ReactNode
  title?: string
  description?: string
}

export function FilterDrawer({
  activeFilterCount,
  onReset,
  children,
  title = "Filter",
  description = "Atur filter untuk menyaring data",
}: FilterDrawerProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6 pb-4">{children}</div>
        </ScrollArea>
        <DrawerFooter className="flex-row gap-2 border-t pt-4">
          <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <DrawerClose asChild>
            <Button className="flex-1">Tutup</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
