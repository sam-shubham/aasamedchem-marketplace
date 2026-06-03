/**
 * Returns a subset of obj containing only keys with non-undefined values.
 */
export function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null && v !== '') {
            (result as Record<string, unknown>)[k] = v;
        }
    }
    return result;
}

/**
 * Shallow-compare two objects for equality (useful for React deps).
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
    if (a === b) return true;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => a[k] === b[k]);
}
