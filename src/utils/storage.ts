import { TOKEN_KEYS } from '@/constants/general';

// ─── Access token (localStorage) ─────────────────────────────────────────────

export function setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEYS.ACCESS, token);
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export function clearAccessToken(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEYS.ACCESS);
}

// ─── User (localStorage) ─────────────────────────────────────────────────────

export function getStoredUser<T>(): T | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(TOKEN_KEYS.USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function setStoredUser<T>(user: T): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
}

export function removeStoredUser(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEYS.USER);
}

// ─── Clear all auth state ────────────────────────────────────────────────────

export function clearAuthStorage(): void {
    clearAccessToken();
    removeStoredUser();
}
