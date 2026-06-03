"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboardIcon,
  PackageIcon,
  FileTextIcon,
  ShoppingCartIcon,
  Settings2Icon,
} from "lucide-react";
import { NavMain, NavUser } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth-store";

function AasaLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3 px-3"}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
        A
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="truncate text-base font-bold tracking-tight text-foreground">
            AasaMedChem
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Inventory & Order
          </span>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <AasaLogo collapsed={isCollapsed} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <NavMain />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
