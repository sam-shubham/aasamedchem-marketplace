import { setAccessToken, clearAccessToken, getStoredUser, setStoredUser } from '@/utils/storage';
import type { AuthUser } from '@/lib/auth-store';

export type LoginInput = { email: string; password: string };
export type LoginResponse = { user: AuthUser; token: string };

export async function login(input: LoginInput): Promise<AuthUser> {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(input),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 throw new Error((data as { error?: string }).error ?? 'Login failed');
 }
 const data: LoginResponse = await res.json();
 setAccessToken(data.token);
 setStoredUser(data.user);
 return data.user;
}

export async function logout(): Promise<void> {
 clearAccessToken();
 window.location.href = '/login';
}

export async function getSession(): Promise<AuthUser | null> {
 try {
 const res = await fetch('/api/auth/session');
 if (!res.ok) return null;
 const data = await res.json();
 return (data as { user: AuthUser | null }).user ?? null;
 } catch {
 return null;
 }
}

export async function ensureAuthenticated(): Promise<boolean> {
 const user = await getSession();
 return user !== null;
}