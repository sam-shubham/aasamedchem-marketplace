"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon, BellIcon, XIcon } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Low stock alert",
    detail: "Paracetamol base unit below reorder threshold",
    time: "5 min ago",
    read: false,
    type: "warning",
  },
  {
    id: "2",
    title: "New order received",
    detail: "Seller John Doe placed a quotation",
    time: "1 hr ago",
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Quotation fulfilled",
    detail: "Order #ABC12345 has been marked as fulfilled",
    time: "2 hr ago",
    read: true,
    type: "success",
  },
];

const NOTIF_COLORS = {
  warning: { bg: "bg-amber-500/10", icon: "bg-amber-500", dot: "bg-amber-500" },
  info: { bg: "bg-primary/10", icon: "bg-primary", dot: "bg-primary" },
  success: { bg: "bg-emerald-500/10", icon: "bg-emerald-500", dot: "bg-emerald-500" },
};

function getBreadcrumbItems(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const labelMap: Record<string, string> = {
    admin: "Admin",
    products: "Products",
    quotations: "Quotations",
    seller: "Seller",
    orders: "My Orders",
    cart: "Cart",
  };
  const items = [{ label: "Home", href: "/" }];
  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    items.push({
      label:
        labelMap[segment] ??
        segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: currentPath,
    });
  }
  return items;
}

function ShellHeader() {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
  const breadcrumbItems = React.useMemo(
    () => getBreadcrumbItems(pathname),
    [pathname],
  );

  return (
    <>
      <header className="sticky top-0 z-30 shrink-0 border-b border-border/60 bg-sidebar/95 backdrop-blur-md transition-[width,height] ease-linear">
        <div className="flex h-14 items-center gap-3 px-4">
          <SidebarTrigger className="flex text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors [&_svg]:size-4.5" />

          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
              A
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products, orders..."
                className="pl-8 h-8 w-full bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/60 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Notification bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
              onClick={() => setNotificationsOpen(true)}
            >
              <BellIcon className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full animate-pulse-soft"
                  style={{ background: "var(--primary)" }} />
              )}
            </Button>
          </div>
        </div>

        {/* Breadcrumb strip */}
        <div className="border-t border-border/40 px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="font-semibold text-foreground/80">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className="text-muted-foreground/40" />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Notifications Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-border">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.22 280))" }}>
                  <BellIcon className="size-4 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-foreground">Notifications</SheetTitle>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {NOTIFICATIONS.map((n) => {
                const colors = NOTIF_COLORS[n.type as keyof typeof NOTIF_COLORS] ?? NOTIF_COLORS.info;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3.5 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? "bg-primary/[0.03]" : ""}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`size-8 rounded-full flex items-center justify-center ${colors.bg}`}>
                        <BellIcon className="size-3.5 text-foreground/60" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${colors.dot}`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.detail}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-1.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground/50 text-center">You're all caught up</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-screen w-full flex flex-row items-stretch">
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <ShellHeader />
        <div className="flex min-h-0 flex-1 flex-col px-5 py-5 md:px-7 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
