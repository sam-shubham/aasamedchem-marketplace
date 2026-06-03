'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { PERMISSIONS } from '@/config/permissions';
import { usePermissions } from '@/components/providers/permissions-provider';

import type { PermissionScope } from '@/config/permissions';

interface AuthorizedModuleProps {
    module: string;
    user_type?: PermissionScope;
    redirect_to?: string;
    children: React.ReactNode;
}

/**
 * Checks whether the current user has *any* permission within the given module
 * for their user type (platform/tenant). If not, renders nothing (or redirects).
 */
export function AuthorizedModule({ module, user_type = 'platform', redirect_to, children }: AuthorizedModuleProps) {
    const router = useRouter();
    const permissions = usePermissions();

    const modulePermissions = PERMISSIONS.filter((p) => p.permission_scope === user_type && p.permission_code.startsWith(`${user_type}:${module}:`));

    const hasAnyModulePermission = modulePermissions.some((p) => permissions.includes(p.permission_code));

    if (!hasAnyModulePermission) {
        if (redirect_to) router.replace(redirect_to);
        return null;
    }

    return <>{children}</>;
}
