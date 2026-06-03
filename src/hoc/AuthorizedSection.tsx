'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { buildPermissionCode } from '@/config/permissions';
import { usePermissions } from '@/components/providers/permissions-provider';

import type { PermissionScope } from '@/config/permissions';

type PermissionOperation = 'add' | 'read' | 'update' | 'delete' | 'assign' | 'block' | 'unblock' | 'install' | 'uninstall';

interface AuthorizedSectionProps {
    module: string;
    action: PermissionOperation;
    user_type?: PermissionScope;
    redirect_to?: string;
    children: React.ReactNode;
}

/**
 * Checks whether the current user has a *specific action* permission
 * within the given module for their user type.
 */
export function AuthorizedSection({ module, action, user_type = 'platform', redirect_to, children }: AuthorizedSectionProps) {
    const router = useRouter();
    const permissions = usePermissions();

    const requiredCode = buildPermissionCode(user_type, module, action);
    const hasPermission = permissions.includes(requiredCode);

    if (!hasPermission) {
        if (redirect_to) router.replace(redirect_to);
        return null;
    }

    return <>{children}</>;
}
