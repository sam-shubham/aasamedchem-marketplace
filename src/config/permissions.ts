// Permission codes follow the format: {user_type}:{module}:{operation}
// user_type: platform | tenant | internal
// module: users | roles | permissions | tenants | tenant-groups | extensions | policies | blocklist
// operation: add | read | update | delete | assign | block | unblock | install | uninstall

export const PERMISSIONS = [
    // ── User Management ──────────────────────────────────────────────────────
    { permission_name: 'Add Platform Users', permission_code: 'platform:users:add', category_name: 'platform_users', permission_scope: 'platform', description: 'Add new user accounts within the organization' },
    { permission_name: 'View Platform Users', permission_code: 'platform:users:read', category_name: 'platform_users', permission_scope: 'platform', description: 'View and access platform user account details and information' },
    { permission_name: 'Update Platform Users', permission_code: 'platform:users:update', category_name: 'platform_users', permission_scope: 'platform', description: 'Update and modify existing user account information' },
    { permission_name: 'Delete Platform Users', permission_code: 'platform:users:delete', category_name: 'platform_users', permission_scope: 'platform', description: 'Delete and remove user accounts from the system' },
    { permission_name: 'Add Tenant Users', permission_code: 'tenant:users:add', category_name: 'tenant_users', permission_scope: 'tenant', description: 'Add new user accounts within the tenant organization' },
    { permission_name: 'View Tenant Users', permission_code: 'tenant:users:read', category_name: 'tenant_users', permission_scope: 'tenant', description: 'View and access tenant user account details and information' },
    { permission_name: 'Update Tenant Users', permission_code: 'tenant:users:update', category_name: 'tenant_users', permission_scope: 'tenant', description: 'Update and modify existing user account information in tenant organization' },
    { permission_name: 'Delete Tenant Users', permission_code: 'tenant:users:delete', category_name: 'tenant_users', permission_scope: 'tenant', description: 'Delete and remove user accounts from the tenant organization' },

    // ── Role Management ─────────────────────────────────────────────────────
    { permission_name: 'Add Platform Roles', permission_code: 'platform:roles:add', category_name: 'platform_roles', permission_scope: 'platform', description: 'Add and define new platform-level organizational roles' },
    { permission_name: 'View Platform Roles', permission_code: 'platform:roles:read', category_name: 'platform_roles', permission_scope: 'platform', description: 'View and review platform-level role configurations and permissions' },
    { permission_name: 'Update Platform Roles', permission_code: 'platform:roles:update', category_name: 'platform_roles', permission_scope: 'platform', description: 'Update and modify existing platform-level role configurations and permissions' },
    { permission_name: 'Delete Platform Roles', permission_code: 'platform:roles:delete', category_name: 'platform_roles', permission_scope: 'platform', description: 'Delete and remove platform-level roles from the organization' },
    { permission_name: 'Add Tenant Roles', permission_code: 'tenant:roles:add', category_name: 'tenant_roles', permission_scope: 'tenant', description: 'Add and define new tenant-level organizational roles' },
    { permission_name: 'View Tenant Roles', permission_code: 'tenant:roles:read', category_name: 'tenant_roles', permission_scope: 'tenant', description: 'View and review tenant-level role configurations and permissions' },
    { permission_name: 'Update Tenant Roles', permission_code: 'tenant:roles:update', category_name: 'tenant_roles', permission_scope: 'tenant', description: 'Update and modify existing tenant-level role configurations and permissions' },
    { permission_name: 'Delete Tenant Roles', permission_code: 'tenant:roles:delete', category_name: 'tenant_roles', permission_scope: 'tenant', description: 'Delete and remove tenant-level roles from the organization' },

    // ── Permission Management ───────────────────────────────────────────────
    { permission_name: 'View Platform Permissions', permission_code: 'platform:permissions:read', category_name: 'platform_permissions', permission_scope: 'platform', description: 'View and list all platform-level system permissions' },
    {
        permission_name: 'Assign Platform Permissions',
        permission_code: 'platform:permissions:assign',
        category_name: 'platform_permissions',
        permission_scope: 'platform',
        description: 'Assign and manage permissions for platform-level organizational roles',
    },
    { permission_name: 'View Tenant Permissions', permission_code: 'tenant:permissions:read', category_name: 'tenant_permissions', permission_scope: 'tenant', description: 'View and list all tenant-level system permissions' },
    { permission_name: 'Assign Tenant Permissions', permission_code: 'tenant:permissions:assign', category_name: 'tenant_permissions', permission_scope: 'tenant', description: 'Assign and manage permissions for tenant-level organizational roles' },

    // ── Tenant Management - Platform ───────────────────────────────────────
    { permission_name: 'Add Platform Tenants', permission_code: 'platform:tenants:add', category_name: 'tenants', permission_scope: 'platform', description: 'Add and provision new tenant organizations on the platform' },
    { permission_name: 'View Platform Tenants', permission_code: 'platform:tenants:read', category_name: 'tenants', permission_scope: 'platform', description: 'View and access tenant organization details and configurations' },
    { permission_name: 'Update Platform Tenants', permission_code: 'platform:tenants:update', category_name: 'tenants', permission_scope: 'platform', description: 'Update and modify tenant organization settings and configurations' },
    { permission_name: 'Delete Platform Tenants', permission_code: 'platform:tenants:delete', category_name: 'tenants', permission_scope: 'platform', description: 'Delete and remove tenant organizations from the platform' },

    // ── Tenant Management - Tenant ──────────────────────────────────────────
    { permission_name: 'View Tenant Details', permission_code: 'tenant:tenants:read', category_name: 'tenants', permission_scope: 'tenant', description: 'View and access tenant organization details and configurations' },
    { permission_name: 'Update Tenant Details', permission_code: 'tenant:tenants:update', category_name: 'tenants', permission_scope: 'tenant', description: 'Update and modify tenant organization settings and configurations' },

    // ── Tenant Group Management ──────────────────────────────────────────────
    { permission_name: 'Add Tenant Groups', permission_code: 'tenant:tenant-groups:add', category_name: 'tenant_groups', permission_scope: 'tenant', description: 'Add and define new tenant groups within the tenant organization' },
    { permission_name: 'View Tenant Groups', permission_code: 'tenant:tenant-groups:read', category_name: 'tenant_groups', permission_scope: 'tenant', description: 'View and access tenant group details and configurations' },
    { permission_name: 'Update Tenant Groups', permission_code: 'tenant:tenant-groups:update', category_name: 'tenant_groups', permission_scope: 'tenant', description: 'Update and modify tenant group settings and configurations' },
    { permission_name: 'Delete Tenant Groups', permission_code: 'tenant:tenant-groups:delete', category_name: 'tenant_groups', permission_scope: 'tenant', description: 'Delete and remove tenant groups from the tenant organization' },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]['permission_code'];
export type PermissionScope = 'platform' | 'tenant';

export function getModulePermissions(user_type: PermissionScope, module: string): PermissionCode[] {
    return PERMISSIONS.filter((p) => p.permission_scope === user_type && p.permission_code.startsWith(`${user_type}:${module}:`)).map((p) => p.permission_code);
}

export function buildPermissionCode(user_type: PermissionScope, module: string, operation: 'add' | 'read' | 'update' | 'delete' | 'assign' | 'block' | 'unblock' | 'install' | 'uninstall'): `${PermissionScope}:${string}:${string}` {
    return `${user_type}:${module}:${operation}`;
}
