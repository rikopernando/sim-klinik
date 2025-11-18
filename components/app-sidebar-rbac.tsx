"use client";

/**
 * Role-Based Access Control Sidebar
 * Dynamically shows navigation based on user role
 */

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import {
    IconHelp,
    IconSearch,
    IconSettings,
    IconDatabase,
    IconReport,
    IconFileWord,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getNavigationForRole } from "@/lib/rbac/navigation";
import type { UserRole } from "@/types/rbac";
import { ROLE_INFO } from "@/types/rbac";
import { Badge } from "@/components/ui/badge";

const staticSecondaryNav = [
    {
        title: "Settings",
        url: "#",
        icon: IconSettings,
    },
    {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
    },
    {
        title: "Search",
        url: "#",
        icon: IconSearch,
    },
];

const staticDocuments = [
    {
        name: "Data Library",
        url: "#",
        icon: IconDatabase,
    },
    {
        name: "Reports",
        url: "#",
        icon: IconReport,
    },
    {
        name: "Word Assistant",
        url: "#",
        icon: IconFileWord,
    },
];

export function AppSidebarRBAC({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();
    const [userRole, setUserRole] = React.useState<UserRole | null>(null);
    const [isLoadingRole, setIsLoadingRole] = React.useState(true);

    // Fetch user role from API
    React.useEffect(() => {
        async function fetchRole() {
            if (session?.user?.id) {
                try {
                    const response = await fetch("/api/rbac/me");
                    if (response.ok) {
                        const data = await response.json();
                        setUserRole(data.role);
                    }
                } catch (error) {
                    console.error("Failed to fetch user role:", error);
                } finally {
                    setIsLoadingRole(false);
                }
            } else {
                setIsLoadingRole(false);
            }
        }

        fetchRole();
    }, [session?.user?.id]);

    const userData = session?.user
        ? {
              name: session.user.name || "User",
              email: session.user.email,
              avatar: session.user.image || "/codeguide-logo.png",
          }
        : {
              name: "Guest",
              email: "guest@example.com",
              avatar: "/codeguide-logo.png",
          };

    // Get navigation items based on role
    const navigationItems = React.useMemo(() => {
        if (isLoadingRole) {
            return [];
        }
        return getNavigationForRole(userRole);
    }, [userRole, isLoadingRole]);

    // Get role info for display
    const roleInfo = userRole ? ROLE_INFO[userRole] : null;

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/">
                                <Image
                                    src="/codeguide-logo.png"
                                    alt="SIM Klinik"
                                    width={32}
                                    height={32}
                                    className="rounded-lg"
                                />
                                <span className="text-base font-semibold font-parkinsans">
                                    SIM Klinik
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Role Badge */}
                    {roleInfo && (
                        <SidebarMenuItem className="px-2 py-1">
                            <Badge className={`${roleInfo.color} text-white w-full justify-center`}>
                                {roleInfo.label}
                            </Badge>
                        </SidebarMenuItem>
                    )}

                    {/* Loading State */}
                    {isLoadingRole && (
                        <SidebarMenuItem className="px-2 py-1">
                            <div className="text-xs text-muted-foreground text-center">
                                Loading role...
                            </div>
                        </SidebarMenuItem>
                    )}

                    {/* No Role Warning */}
                    {!isLoadingRole && !userRole && session?.user && (
                        <SidebarMenuItem className="px-2 py-1">
                            <div className="text-xs text-orange-600 text-center bg-orange-50 rounded p-2">
                                No role assigned. Contact admin.
                            </div>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Role-based Navigation */}
                {navigationItems.length > 0 && <NavMain items={navigationItems} />}

                {/* Static Documents - Only for admin */}
                {userRole === "admin" && <NavDocuments items={staticDocuments} />}

                {/* Secondary Navigation */}
                <NavSecondary items={staticSecondaryNav} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={userData} />
            </SidebarFooter>
        </Sidebar>
    );
}
