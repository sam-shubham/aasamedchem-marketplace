import { setAccessToken, getAccessToken, clearAccessToken, getStoredUser, removeStoredUser, setStoredUser } from '@/utils/storage';

export class ApiError extends Error {
 status: number;
 constructor(message: string, status: number) {
 super(message);
 this.name = 'ApiError';
 this.status = status;
 }
}

export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const api = {
 getToken: () => getAccessToken(),
 setAccessToken: (token: string) => setAccessToken(token),
 getUser: () => {
 const user = getStoredUser();
 return user as object | null;
 },
 setTokens: (access_token: string, user: object) => {
 setAccessToken(access_token);
 setStoredUser(user);
 },
 clearTokens: () => {
 clearAccessToken();
 removeStoredUser();
 },
 isAuthenticated: () => Boolean(getAccessToken()),
};