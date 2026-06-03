'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { ChevronUpIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

function getInitials(name: string): string {
 const parts = name.trim().split(/\s+/);
 if (parts.length >= 2) {
 return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
 }
 return name.slice(0, 2).toUpperCase();
}

export function NavUser() {
 const { state } = useSidebar();
 const isCollapsed = state === 'collapsed';
 const { user, logout } = useAuthStore();

 if (!user) {
 return (
 <SidebarMenu>
 <SidebarMenuItem>
 <SidebarMenuButton size="lg" className={isCollapsed ? 'size-11 justify-center' : ''}>
 <div className="shrink-0">
 <Avatar className={`rounded-lg ${isCollapsed ? 'size-6' : 'h-8 w-8'}`}>
 <AvatarFallback className="rounded-lg text-xs">--</AvatarFallback>
 </Avatar>
 </div>
 {!isCollapsed && (
 <div className="grid flex-1 text-left text-sm leading-tight">
 <span className="truncate font-medium text-muted-foreground">Loading...</span>
 </div>
 )}
 </SidebarMenuButton>
 </SidebarMenuItem>
 </SidebarMenu>
 );
 }

 const initials = getInitials(user.name);
 const roleLabel = user.role === 'ADMIN' ? 'Administrator' : 'Seller';

 return (
 <SidebarMenu>
 <SidebarMenuItem>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
 <div className="shrink-0">
 <Avatar className={`rounded-lg ${isCollapsed ? 'size-6' : 'h-8 w-8'}`}>
 <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
 </Avatar>
 </div>
 <div className={`grid flex-1 text-left text-sm leading-tight ${isCollapsed ? 'hidden' : ''}`}>
 <span className="truncate font-medium">{user.name}</span>
 <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
 </div>
 <ChevronUpIcon className={`size-4 ${isCollapsed ? 'hidden' : 'ml-auto'}`} />
 </SidebarMenuButton>
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isCollapsed ? 'top' : 'right'} align="end" sideOffset={4}>
 <DropdownMenuLabel className="p-0 font-normal">
 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
 <Avatar className="h-8 w-8 rounded-lg">
 <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
 </Avatar>
 <div className="grid flex-1 text-left text-sm leading-tight">
 <span className="truncate font-medium">{user.name}</span>
 <span className="truncate text-xs text-muted-foreground">{user.email}</span>
 </div>
 </div>
 </DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem onSelect={() => logout()}>
 <span>Log out</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </SidebarMenuItem>
 </SidebarMenu>
 );
}