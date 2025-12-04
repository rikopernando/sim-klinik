"use client"

import { useRouter, usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import type { NavGroup } from "@/lib/rbac/navigation"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Support both flat items (legacy) and grouped structure (new)
type NavMainProps =
  | {
      groups: NavGroup[]
      items?: never
    }
  | {
      items: {
        title: string
        url: string
        icon?: Icon
      }[]
      groups?: never
    }

export function NavMain(props: NavMainProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Convert flat items to groups for consistent rendering
  const groups: NavGroup[] = props.groups || [
    {
      label: "",
      items: props.items || [],
    },
  ]

  return (
    <>
      {/* Quick Create Section */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Grouped Navigation */}
      {groups.map((group, index) => (
        <SidebarGroup key={group.label || `group-${index}`}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                // Special handling for dashboard: only active when exactly on /dashboard
                // For other routes: active when pathname matches or starts with the route
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.url || pathname.startsWith(item.url + "/")

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="cursor-pointer"
                      onClick={() => router.push(item.url)}
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
