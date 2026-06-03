// ─── Actions / Permission tokens ───────────────────────────────────────────────

export enum ACTIONS {
    // Dashboard / Overview
    VIEW_DASHBOARD = 'Dashboard:View',

    // User Management
    LIST_USERS = 'User:List',
    READ_USER = 'User:Read',
    ADD_USER = 'User:Add',
    UPDATE_USER = 'User:Update',
    DELETE_USER = 'User:Delete',

    // Organization Management
    LIST_ORGANIZATIONS = 'Organization:List',
    READ_ORGANIZATION = 'Organization:Read',
    ADD_ORGANIZATION = 'Organization:Add',
    UPDATE_ORGANIZATION = 'Organization:Update',
    DELETE_ORGANIZATION = 'Organization:Delete',

    // Policy / Rule Management
    LIST_POLICIES = 'Policy:List',
    READ_POLICY = 'Policy:Read',
    ADD_POLICY = 'Policy:Add',
    UPDATE_POLICY = 'Policy:Update',
    DELETE_POLICY = 'Policy:Delete',

    // Block List Management
    LIST_BLOCKLIST = 'BlockList:List',
    READ_BLOCKLIST = 'BlockList:Read',
    ADD_BLOCKLIST = 'BlockList:Add',
    UPDATE_BLOCKLIST = 'BlockList:Update',
    DELETE_BLOCKLIST = 'BlockList:Delete',

    // Extension Management
    LIST_EXTENSIONS = 'Extension:List',
    READ_EXTENSION = 'Extension:Read',
    INSTALL_EXTENSION = 'Extension:Install',
    REMOVE_EXTENSION = 'Extension:Remove',

    // Analytics / Reports
    VIEW_ANALYTICS = 'Analytics:View',
    EXPORT_REPORT = 'Analytics:Export',

    // Settings
    MANAGE_SETTINGS = 'Settings:Manage',

    // Team Management
    INVITE_TEAM_MEMBER = 'Team:Invite',
    REMOVE_TEAM_MEMBER = 'Team:Remove',
    UPDATE_TEAM_ROLE = 'Team:UpdateRole',
}

// Alias for backward compatibility
export const actions = ACTIONS;

// ─── Roles ────────────────────────────────────────────────────────────────────

export type ROLES = 'admin' | 'super_admin' | 'manager' | 'viewer';
export type Roles = ROLES;

type RoleAccessMap = Record<ROLES, ACTIONS[]>;

const ADMIN_PERMS = Object.values(ACTIONS);

const MANAGER_PERMS = [
    ACTIONS.VIEW_DASHBOARD,
    ACTIONS.LIST_USERS,
    ACTIONS.READ_USER,
    ACTIONS.LIST_POLICIES,
    ACTIONS.READ_POLICY,
    ACTIONS.ADD_POLICY,
    ACTIONS.UPDATE_POLICY,
    ACTIONS.LIST_BLOCKLIST,
    ACTIONS.READ_BLOCKLIST,
    ACTIONS.ADD_BLOCKLIST,
    ACTIONS.UPDATE_BLOCKLIST,
    ACTIONS.LIST_EXTENSIONS,
    ACTIONS.READ_EXTENSION,
    ACTIONS.VIEW_ANALYTICS,
];

const VIEWER_PERMS = [ACTIONS.VIEW_DASHBOARD, ACTIONS.LIST_USERS, ACTIONS.READ_USER, ACTIONS.LIST_POLICIES, ACTIONS.READ_POLICY, ACTIONS.LIST_BLOCKLIST, ACTIONS.READ_BLOCKLIST, ACTIONS.VIEW_ANALYTICS];

export const ROLE_ACCESS: RoleAccessMap = {
    admin: ADMIN_PERMS,
    super_admin: ADMIN_PERMS,
    manager: MANAGER_PERMS,
    viewer: VIEWER_PERMS,
};

// Alias for backward compatibility
export const role_access = ROLE_ACCESS;

// ─── Public routes (no role check needed — just auth) ──────────────────────────

export const COMMON_ROUTES = ['/reset-password'];
export const common_routes = COMMON_ROUTES;

// Alias for backward compatibility
export type RoleAccess = RoleAccessMap;
