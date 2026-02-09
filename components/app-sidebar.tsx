"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import { ROLE_NAVIGATION_GROUPS } from "@/lib/rbac/navigation"
import type { UserRole } from "@/types/rbac"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

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

  // Get user role from session, default to 'admin' if not found
  const userRole = (session?.user?.role as UserRole) || "admin"

  // Get navigation groups for this role
  const navigationGroups = ROLE_NAVIGATION_GROUPS[userRole] || ROLE_NAVIGATION_GROUPS.admin

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <Image
                  src="/bumi-andalas-logo-v2.png"
                  alt="Sim Klinik"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-parkinsans text-base font-semibold">Sim Klinik</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navigationGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
