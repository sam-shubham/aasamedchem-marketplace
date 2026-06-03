'use client';

import { useAuthStore, type AuthUser } from '@/lib/auth-store';

export function useUser(): AuthUser | null {
 return useAuthStore((s) => s.user);
}