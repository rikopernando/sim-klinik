"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Route label mapping - customize labels for specific routes
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  registration: "Pendaftaran",
  patients: "Data Pasien",
  new: "Pasien Baru",
  edit: "Ubah Data Pasien",
  queue: "Antrian",
  doctor: "Dokter",
  emergency: "Emergency Room",
  "medical-records": "Rekam Medik",
  inpatient: "Rawat Jalan",
  rooms: "Room",
  pharmacy: "Farmasi",
  inventory: "Inventory",
  cashier: "Kasir",
  users: "User",
  discharge: "Patient Discharge",
  example: "Example",
}

// Dynamic segment handlers - for routes with [id], [visitId], etc.
const dynamicSegmentHandlers: Record<string, (value: string) => string> = {
  id: (value) => `Patient #${value}`,
  visitId: (value) => `Visit #${value}`,
}

function formatSegment(segment: string): string {
  // Check if it's a dynamic segment like [id] or [visitId]
  const dynamicMatch = segment.match(/^\[(.+)\]$/)
  if (dynamicMatch) {
    const key = dynamicMatch[1]
    return dynamicSegmentHandlers[key]?.(key) || key
  }

  // Check if we have a custom label
  if (routeLabels[segment]) {
    return routeLabels[segment]
  }

  // Fallback: capitalize and replace hyphens with spaces
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function SmartBreadcrumb() {
  const pathname = usePathname()

  // Split pathname and filter out empty segments
  const segments = pathname.split("/").filter(Boolean)

  // Don't show breadcrumb on root dashboard
  if (segments.length === 1 && segments[0] === "dashboard") {
    return null
  }

  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1

    // For dynamic segments, use the actual value from URL
    const label = formatSegment(segment)

    return {
      href,
      label,
      isLast,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="contents">
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>
                    {index === 0 && item.label === "Home" ? (
                      <span className="flex items-center gap-1.5">
                        <Home className="size-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
