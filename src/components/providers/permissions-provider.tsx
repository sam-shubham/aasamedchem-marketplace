'use client';

import * as React from 'react';
import { useAuthStore } from '@/lib/auth-store';

const PermissionsContext = React.createContext<{ permissions: string[]; isLoaded: boolean }>({ permissions: [], isLoaded: true });

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
 const user = useAuthStore((s) => s.user);
 const permissions = user?.role === 'ADMIN' ? ['admin:all'] : ['seller:read'];
 return <PermissionsContext.Provider value={{ permissions, isLoaded: true }}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): string[] {
 return React.useContext(PermissionsContext).permissions;
}

export function usePermissionsLoaded(): boolean {
 return React.useContext(PermissionsContext).isLoaded;
}