'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useAuthorization } from '@/hooks';
import { ACTIONS } from '@/config/rbac';

interface RequireAuthProps {
    required_permissions?: ACTIONS | ACTIONS[];
    redirect_to?: string;
    children: React.ReactNode;
}

/**
 * Wraps children and redirects to redirect_to when unauthorized.
 * Use as a layout-level guard component.
 */
export function RequireAuth({ required_permissions, redirect_to = '/', children }: RequireAuthProps) {
    const router = useRouter();
    const isAuthorized = useAuthorization(required_permissions);

    React.useEffect(() => {
        if (!isAuthorized) router.replace(redirect_to);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized, redirect_to]);

    if (!isAuthorized) return null;
    return <>{children}</>;
}

export type { RequireAuthProps };
