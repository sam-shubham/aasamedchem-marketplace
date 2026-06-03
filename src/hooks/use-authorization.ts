import type { ACTIONS } from '@/config/rbac';
import { ROLE_ACCESS } from '@/config/rbac';
import { getAccessToken } from '@/utils/storage';

function isRole(value: unknown): value is keyof typeof ROLE_ACCESS {
    return typeof value === 'string' && value in ROLE_ACCESS;
}

export function useAuthorization(required_permissions?: ACTIONS | ACTIONS[]): boolean {
    const token = getAccessToken();
    if (!token) return false;

    const userJson = localStorage.getItem('user');
    if (!userJson) return false;

    let userRole: keyof typeof ROLE_ACCESS;
    try {
        const parsed: unknown = JSON.parse(userJson);
        if (!parsed || typeof parsed !== 'object') return false;

        const role = (parsed as Record<string, unknown>).role;
        if (!isRole(role)) return false;

        userRole = role;
    } catch {
        return false;
    }

    const permissions = ROLE_ACCESS[userRole];

    if (!required_permissions) return true;

    const requiredArr = Array.isArray(required_permissions) ? required_permissions : [required_permissions];
    return requiredArr.some((perm) => permissions.includes(perm));
}
