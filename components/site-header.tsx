"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SmartBreadcrumb } from "@/components/smart-breadcrumb"

function CurrentDateTime() {
  const [dateStr, setDateStr] = useState("")

  useEffect(() => {
    const update = () =>
      setDateStr(
        new Date().toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      )
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!dateStr) return null
  return <span className="text-muted-foreground hidden text-xs sm:block">{dateStr}</span>
}

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <SmartBreadcrumb />
        <div className="ml-auto flex items-center">
          <CurrentDateTime />
        </div>
      </div>
    </header>
  )
}
