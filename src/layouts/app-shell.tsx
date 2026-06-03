"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SearchIcon,
  BellIcon,
  XIcon,
  CheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { useNotifStore } from "@/lib/notif-store";

const NOTIF_COLORS = {
  WARNING: { bg: "bg-amber-500/10", icon: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", iconComponent: AlertTriangleIcon },
  INFO: { bg: "bg-primary/10", icon: "bg-primary", text: "text-primary", dot: "bg-primary", iconComponent: BellIcon },
  SUCCESS: { bg: "bg-emerald-500/10", icon: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", iconComponent: CheckCircleIcon },
};

function formatNotifTime(createdAtStr: string) {
  try {
    const date = new Date(createdAtStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

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
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchCount,
    markRead,
    markAllRead,
  } = useNotifStore();

  const breadcrumbItems = React.useMemo(
    () => getBreadcrumbItems(pathname),
    [pathname],
  );

  React.useEffect(() => {
    fetchCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(() => {
      fetchCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  React.useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen, fetchNotifications]);

  const handleNotifClick = (n: any) => {
    markRead(n.id);
    setNotificationsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

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
            <ThemeToggle className="h-8 rounded-xl px-3 text-muted-foreground hover:text-foreground hover:bg-muted/60" />

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

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead()}
                  className="text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg flex items-center gap-1"
                >
                  <CheckIcon className="size-3.5" /> Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                      <div className="h-2 w-3/4 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <BellIcon className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
                <p className="text-sm font-semibold">No notifications yet</p>
                <p className="text-xs text-muted-foreground/80">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => {
                  const colors = NOTIF_COLORS[n.type] ?? NOTIF_COLORS.INFO;
                  const Icon = colors.iconComponent;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex gap-3.5 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? "bg-primary/[0.03]" : ""}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`size-8 rounded-full flex items-center justify-center ${colors.bg}`}>
                          <Icon className={`size-4 ${colors.text}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight ${!n.read ? "text-foreground font-semibold" : "text-muted-foreground font-normal"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${colors.dot}`} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-2 font-medium">
                          {formatNotifTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/5">
            <p className="text-[11px] text-muted-foreground/50 text-center">
              Click a notification to navigate and resolve
            </p>
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
