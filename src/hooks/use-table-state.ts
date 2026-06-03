import { useState, useCallback } from 'react';

export type SortOrder = 'asc' | 'desc' | undefined;

export type TableState = {
    page: number;
    limit: number;
    sort: string | undefined;
    order: SortOrder;
    search: string;
};

const DEFAULT_STATE: TableState = {
    page: 1,
    limit: 10,
    sort: undefined,
    order: undefined,
    search: '',
};

export function useTableState(initial: Partial<TableState> = {}): {
    tableState: TableState;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSort: (col: string) => void;
    setSearch: (search: string) => void;
    reset: () => void;
} {
    const [tableState, setTableState] = useState<TableState>({ ...DEFAULT_STATE, ...initial });

    const setPage = useCallback((page: number) => {
        setTableState((s) => ({ ...s, page }));
    }, []);

    const setLimit = useCallback((limit: number) => {
        setTableState((s) => ({ ...s, limit, page: 1 }));
    }, []);

    const setSort = useCallback((col: string) => {
        setTableState((s) => {
            if (s.sort === col) {
                const next: SortOrder = s.order === 'asc' ? 'desc' : s.order === 'desc' ? undefined : 'asc';
                return { ...s, order: next, sort: next ? col : undefined };
            }
            return { ...s, sort: col, order: 'asc' };
        });
    }, []);

    const setSearch = useCallback((search: string) => {
        setTableState((s) => ({ ...s, search, page: 1 }));
    }, []);

    const reset = useCallback(() => setTableState(DEFAULT_STATE), []);

    return { tableState, setPage, setLimit, setSort, setSearch, reset };
}
