import { create } from 'zustand';
import { getAccessToken, getStoredUser, clearAccessToken, removeStoredUser, setAccessToken, setStoredUser } from '@/utils/storage';

export type AuthUser = {
 id: string;
 name: string;
 email: string;
 role: 'ADMIN' | 'SELLER';
};

type AuthStep = 'login' | 'dashboard';

interface AuthState {
 step: AuthStep;
 isAuthenticated: boolean;
 user: AuthUser | null;
 hasChecked: boolean;
 setStep: (step: AuthStep) => void;
 completeAuth: (user: AuthUser) => void;
 logout: () => void;
}

function restoreFromStorage(): Partial<AuthState> | null {
 if (typeof window === 'undefined') return null;
 const token = getAccessToken();
 const user = getStoredUser<AuthUser>();
 if (token && user) {
 return { step: 'dashboard', isAuthenticated: true, user, hasChecked: true };
 }
 return null;
}

const initial: AuthState = {
 step: 'login',
 isAuthenticated: false,
 user: null,
 hasChecked: false,
 setStep: () => {},
 completeAuth: () => {},
 logout: () => {},
};

export const useAuthStore = create<AuthState>((set) => ({
 ...initial,
 ...restoreFromStorage(),

 setStep: (step) => set({ step }),

 completeAuth: (user) => {
 setStoredUser(user);
 set({ step: 'dashboard', isAuthenticated: true, user, hasChecked: true });
 },

 logout: () => {
 clearAccessToken();
 removeStoredUser();
 set({ step: 'login', isAuthenticated: false, user: null, hasChecked: true });
 },
}));