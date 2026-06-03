import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of the given value.
 * Delays updating the local copy until `delay` ms have passed since the last change.
 */
export function useDebounce<T>(value: T, delay = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
