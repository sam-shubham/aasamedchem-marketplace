"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackageIcon,
  FileTextIcon,
  ShoppingCartIcon,
  Settings2Icon,
  ChevronUpIcon,
  LogOutIcon,
  UserIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth-store";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (
      parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
    ).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: ("ADMIN" | "SELLER")[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboardIcon,
    roles: ["ADMIN"],
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: PackageIcon,
    roles: ["ADMIN"],
  },
  {
    title: "Quotations",
    url: "/admin/quotations",
    icon: FileTextIcon,
    roles: ["ADMIN"],
  },
  {
    title: "Dashboard",
    url: "/seller/dashboard",
    icon: LayoutDashboardIcon,
    roles: ["SELLER"],
  },
  {
    title: "My Orders",
    url: "/seller/orders",
    icon: ShoppingCartIcon,
    roles: ["SELLER"],
  },
  {
    title: "Browse Products",
    url: "/seller/products",
    icon: PackageIcon,
    roles: ["SELLER"],
  },
  // { title: 'Settings',        url: '/settings',         icon: Settings2Icon },
];

function NavMain() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const visible = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role as "ADMIN" | "SELLER");
  });

  return (
    <SidebarMenu>
      {visible.map((item) => {
        const Icon = item.icon;
        // match both exact and nested paths (e.g. /admin/products/123)
        const isActive =
          pathname === item.url || pathname.startsWith(item.url + "/");
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
              <Link href={item.url}>
                <Icon className="shrink-0 size-[18px]" strokeWidth={1.75} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavUser() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <UserIcon className="size-4 text-muted-foreground" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm font-medium text-muted-foreground">
                Loading…
              </span>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const initials = getInitials(user.name);
  const roleLabel = user.role === "ADMIN" ? "Administrator" : "Seller";
  const roleColor =
    user.role === "ADMIN"
      ? "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))"
      : "linear-gradient(135deg, oklch(0.60 0.19 215), oklch(0.48 0.18 200))";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* Avatar */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                style={{ background: roleColor }}
              >
                {initials}
              </div>

              {/* Name + role (hidden when icon-only) */}
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronUpIcon className="ml-auto size-3.5 text-muted-foreground shrink-0" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-xl border border-border shadow-lg"
            side={isCollapsed ? "right" : "top"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-3 py-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                  style={{ background: roleColor }}
                >
                  {initials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => logout()}
              className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <LogOutIcon className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { NavMain, NavUser };
