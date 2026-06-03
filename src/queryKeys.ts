export const authQueryKeys = {
    all: ['auth'] as const,
    me: () => [...authQueryKeys.all, 'me'] as const,
};

export const userQueryKeys = {
    all: ['users'] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    get: (id: string) => ['users', 'get', id] as const,
};

export const tenantQueryKeys = {
    all: ['tenants'] as const,
    list: (filters?: Record<string, unknown>) => ['tenants', 'list', filters] as const,
    get: (id: string) => ['tenants', 'get', id] as const,
};
