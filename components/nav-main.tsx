"use client"

import { useRouter, usePathname } from "next/navigation"
import { IconChevronRight, type Icon } from "@tabler/icons-react"
import type { NavGroup } from "@/lib/rbac/navigation"

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

  const groups: NavGroup[] = props.groups || [
    {
      label: "",
      items: props.items || [],
    },
  ]

  const allNavUrls = groups.flatMap((g) =>
    g.items.flatMap((i) => [i.url, ...(i.items?.map((s) => s.url) || [])])
  )

  const hasMoreSpecificMatch = (itemUrl: string) =>
    allNavUrls.some(
      (url) =>
        url !== itemUrl &&
        url.startsWith(itemUrl + "/") &&
        (pathname === url || pathname.startsWith(url + "/"))
    )

  return (
    <>
      {groups.map((group, index) => (
        <SidebarGroup key={group.label || `group-${index}`} className="pt-3 first:pt-0">
          {group.label && (
            <SidebarGroupLabel
              className="mb-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {group.label}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const hasSubitems = item.items && item.items.length > 0

                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : !hasMoreSpecificMatch(item.url) &&
                      (pathname === item.url || pathname.startsWith(item.url + "/"))

                const hasActiveSubitem = hasSubitems
                  ? item.items!.some(
                      (subitem) =>
                        !hasMoreSpecificMatch(subitem.url) &&
                        (pathname === subitem.url || pathname.startsWith(subitem.url + "/"))
                    )
                  : false

                if (hasSubitems) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={hasActiveSubitem}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={hasActiveSubitem}
                            className="[&>svg:first-child]:opacity-75 data-[active=true]:[&>svg:first-child]:opacity-100"
                            style={
                              hasActiveSubitem ? { borderLeft: "2px solid #74c69d" } : undefined
                            }
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <IconChevronRight className="ml-auto opacity-40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                                    style={{
                                      color: isSubitemActive
                                        ? "rgba(255,255,255,0.95)"
                                        : "rgba(255,255,255,0.55)",
                                    }}
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

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="cursor-pointer [&>svg]:opacity-75 data-[active=true]:[&>svg]:opacity-100"
                      onClick={() => router.push(item.url)}
                      tooltip={item.title}
                      isActive={isActive}
                      style={isActive ? { borderLeft: "2px solid #74c69d" } : undefined}
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
