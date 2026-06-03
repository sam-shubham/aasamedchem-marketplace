import { useSearchParams } from 'next/navigation';

/**
 * Returns the parsed value of a single search parameter.
 */
export function useSearchParam(key: string): string | null {
    const searchParams = useSearchParams();
    return searchParams.get(key);
}

/**
 * Returns all search params as a plain object.
 */
export function useSearchParamsObject(): Record<string, string> {
    const searchParams = useSearchParams();
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
