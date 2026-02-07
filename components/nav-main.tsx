"use client"

import { useRouter, usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconMail, IconChevronRight, type Icon } from "@tabler/icons-react"
import type { NavGroup } from "@/lib/rbac/navigation"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

  // Collect all navigation URLs for detecting more specific matches
  const allNavUrls = groups.flatMap((g) =>
    g.items.flatMap((i) => [i.url, ...(i.items?.map((s) => s.url) || [])])
  )

  // Check if there's a more specific nav item that matches the current pathname
  const hasMoreSpecificMatch = (itemUrl: string) =>
    allNavUrls.some(
      (url) =>
        url !== itemUrl &&
        url.startsWith(itemUrl + "/") &&
        (pathname === url || pathname.startsWith(url + "/"))
    )

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
                // Check if item has subitems
                const hasSubitems = item.items && item.items.length > 0

                // Special handling for dashboard: only active when exactly on /dashboard
                // For other routes: active when pathname matches or starts with the route
                // BUT not if there's a more specific sibling route that also matches
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : !hasMoreSpecificMatch(item.url) &&
                      (pathname === item.url || pathname.startsWith(item.url + "/"))

                // For items with subitems, check if any subitem is active
                // Apply the same hasMoreSpecificMatch logic to subitems
                const hasActiveSubitem = hasSubitems
                  ? item.items!.some(
                      (subitem) =>
                        !hasMoreSpecificMatch(subitem.url) &&
                        (pathname === subitem.url || pathname.startsWith(subitem.url + "/"))
                    )
                  : false

                if (hasSubitems) {
                  // Render collapsible menu for items with subitems
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={hasActiveSubitem}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={hasActiveSubitem}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items!.map((subitem) => {
                              const isSubitemActive =
                                !hasMoreSpecificMatch(subitem.url) &&
                                (pathname === subitem.url || pathname.startsWith(subitem.url + "/"))

                              return (
                                <SidebarMenuSubItem key={subitem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubitemActive}
                                    className="cursor-pointer"
                                  >
                                    <a onClick={() => router.push(subitem.url)}>
                                      <span>{subitem.title}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                // Render regular menu item for items without subitems
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
