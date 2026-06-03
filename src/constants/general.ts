export const APP_NAME = 'AIS Integrity Platform';
export const APP_DESCRIPTION = 'Enterprise workforce security and access control';

export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    ORGANIZATIONS: '/organizations',
    POLICIES: '/policies',
    BLOCKLIST: '/blocklist',
    EXTENSIONS: '/extensions',
    SETTINGS: '/settings',
} as const;

export const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    USER: 'user',
} as const;
export const API_TIMEOUT_MS = 60_000;
