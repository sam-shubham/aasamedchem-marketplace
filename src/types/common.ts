// ─── Generic API response wrapper ────────────────────────────────────────────

export type ApiMessageResponse = {
    message: string;
};

export type ApiErrorBody = {
    error?: string;
    message?: string | string[];
    statusCode?: number;
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export type PaginationParams = {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

// ─── Base entity ──────────────────────────────────────────────────────────────

export type BaseEntity = {
    id: string;
    createdAt?: string;
    updatedAt?: string;
};

// ─── Option / Select ──────────────────────────────────────────────────────────

export type SelectOption = {
    label: string;
    value: string;
};
