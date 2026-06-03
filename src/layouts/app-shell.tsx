"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon, BellIcon } from "lucide-react";
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
  },
  {
    id: "2",
    title: "New order received",
    detail: "Seller John Doe placed a quotation",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    title: "Quotation fulfilled",
    detail: "Order #ABC12345 has been marked as fulfilled",
    time: "2 hr ago",
    read: true,
  },
];

function getBreadcrumbItems(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const labelMap: Record<string, string> = {
    admin: "Admin",
    products: "Products",
    quotations: "Quotations",
    seller: "Seller",
    orders: "My Orders",
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
      <header className="sticky top-0 z-30 shrink-0 border-b bg-sidebar transition-[width,height] ease-linear">
        <div className="flex h-14 items-center gap-3 px-4">
          <SidebarTrigger className="flex text-muted-foreground hover:text-foreground [&_svg]:size-5" />
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <SearchIcon className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products, orders..."
                className="ps-9 h-9 w-full bg-muted/60 border-border text-foreground placeholder:text-muted-foreground text-sm rounded-xl"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 relative text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setNotificationsOpen(true)}
          >
            <BellIcon className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>
        <div className="border-t border-border/60 px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-border">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-lg font-semibold text-foreground">
              Notifications
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-6 py-4 hover:bg-accent/50 transition-colors cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                      <BellIcon className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.detail}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              End of notifications
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
        <div className="flex min-h-0 flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
