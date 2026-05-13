"use client"

/**
 * Role-Based Access Control Sidebar
 * Dynamically shows navigation based on user role
 */

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getNavigationGroupsForRole } from "@/lib/rbac/navigation"
import type { UserRole } from "@/types/rbac"
import { ROLE_INFO } from "@/types/rbac"

export function AppSidebarRBAC({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const [userRole, setUserRole] = React.useState<UserRole | null>(null)
  const [isLoadingRole, setIsLoadingRole] = React.useState(true)

  // Fetch user role from API
  React.useEffect(() => {
    async function fetchRole() {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/rbac/me")
          if (response.ok) {
            const data = await response.json()
            setUserRole(data.role)
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error)
        } finally {
          setIsLoadingRole(false)
        }
      } else {
        setIsLoadingRole(false)
      }
    }

    fetchRole()
  }, [session?.user?.id])

  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email,
        avatar: session.user.image || "/bumi-andalas-logo-v2.png",
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/bumi-andalas-logo-v2.png",
      }

  // Get navigation groups based on role
  const navigationGroups = React.useMemo(() => {
    if (isLoadingRole) {
      return []
    }
    return getNavigationGroupsForRole(userRole)
  }, [userRole, isLoadingRole])

  // Get role info for display
  const roleInfo = userRole ? ROLE_INFO[userRole] : null

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "1rem 0.875rem 0.875rem",
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto hover:!bg-transparent focus-visible:!ring-0 active:!bg-transparent"
              style={{ padding: "0.25rem 0.5rem" }}
            >
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/bumi-andalas-logo.jpg"
                  alt="Klinik Bumi Andalas"
                  width={36}
                  height={36}
                  className="flex-shrink-0 rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.4)" }}
                />
                <div className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-sm leading-tight font-semibold text-white"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Klinik Bumi Andalas
                  </span>
                  <span
                    className="text-[10px] leading-tight font-semibold tracking-[0.06em] uppercase"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Sistem Informasi Klinik
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Role Badge */}
          {roleInfo && (
            <SidebarMenuItem className="px-2 pb-0.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: "#74c69d" }}
                />
                {roleInfo.label}
              </span>
            </SidebarMenuItem>
          )}

          {/* Loading State */}
          {isLoadingRole && (
            <SidebarMenuItem className="px-2 pb-0.5">
              <div
                className="h-6 w-24 animate-pulse rounded-full"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </SidebarMenuItem>
          )}

          {/* No Role Warning */}
          {!isLoadingRole && !userRole && session?.user && (
            <SidebarMenuItem className="px-2 pb-0.5">
              <div
                className="rounded-lg p-2 text-[11px] font-medium"
                style={{
                  background: "rgba(216,164,17,0.15)",
                  border: "1px solid rgba(216,164,17,0.2)",
                  color: "#d8a411",
                }}
              >
                Tidak ada role. Hubungi admin.
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Role-based Navigation */}
        {navigationGroups.length > 0 && <NavMain groups={navigationGroups} />}

        {/* Static Documents - Only for admin */}
        {/* {userRole === "admin" && <NavDocuments items={staticDocuments} />} */}

        {/* Secondary Navigation */}
        {/* <NavSecondary items={staticSecondaryNav} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
