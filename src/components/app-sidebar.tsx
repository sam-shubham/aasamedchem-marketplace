"use client";

import * as React from "react";
import Image from "next/image";
import { NavMain, NavUser } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";

function AasaLogo({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    // Icon-only: show just the "A" mark (left portion of the logo)
    return (
      <div className="flex items-center justify-center w-full">
        <div className="relative h-8 w-8 overflow-hidden rounded-lg flex items-center justify-center">
          <Image
            src="/logo2.webp"
            alt="AasaMedChem"
            width={120}
            height={40}
            className="object-cover object-left scale-[2.4] translate-x-[-18%]"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center px-1">
      <Image
        src="/logo2.webp"
        alt="AasaMedChem"
        width={148}
        height={48}
        className="object-contain"
        style={{ maxHeight: 40, width: 'auto' }}
        priority
      />
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
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
