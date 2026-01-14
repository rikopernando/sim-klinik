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
import { Badge } from "@/components/ui/badge"

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
        avatar: session.user.image || "/bumi-andalas-logo.jpg",
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/bumi-andalas-logo.jpg",
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <Image
                  src="/bumi-andalas-logo.jpg"
                  alt="Klinik Bumi Andalas"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-parkinsans text-base font-semibold">Klinik Bumi Andalas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Role Badge */}
          {roleInfo && (
            <SidebarMenuItem className="px-2 py-1">
              <Badge className={`${roleInfo.color} w-full justify-center text-white`}>
                {roleInfo.label}
              </Badge>
            </SidebarMenuItem>
          )}

          {/* Loading State */}
          {isLoadingRole && (
            <SidebarMenuItem className="px-2 py-1">
              <div className="text-muted-foreground text-center text-xs">Loading role...</div>
            </SidebarMenuItem>
          )}

          {/* No Role Warning */}
          {!isLoadingRole && !userRole && session?.user && (
            <SidebarMenuItem className="px-2 py-1">
              <div className="rounded bg-orange-50 p-2 text-center text-xs text-orange-600">
                No role assigned. Contact admin.
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
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
