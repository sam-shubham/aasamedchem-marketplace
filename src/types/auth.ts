// ─── Auth types ────────────────────────────────────────────────────────────────

export type AuthUser = {
    email: string;
    name: string;
    role: string;
    user_type: 'platform' | 'tenant' | 'internal';
    tenant_id?: string;
    permissions?: string[];
};

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginInput = {
    email: string;
    password: string;
    captchaToken: string;
};

export type LoginResponse = {
    message: string;
    accessToken?: string;
    user: AuthUser;
    requires2FA: boolean;
    twoFAUrl?: string | null;
    setupRequired?: boolean;
};

// ─── 2FA ─────────────────────────────────────────────────────────────────────

export type Verify2FAInput = {
    code: string;
    captchaToken: string;
};

export type Verify2FAResponse = {
    message: string;
    accessToken: string;
    user: AuthUser;
    requires2FA?: boolean;
};

// ─── Password Reset ───────────────────────────────────────────────────────────

export type SendPasswordResetEmailInput = {
    email: string;
    captchaToken: string;
};

export type SendPasswordResetEmailResponse = {
    message: string;
};

export type ResetPasswordInput = {
    newPassword: string;
    confirmPassword: string;
    resetToken: string;
    captchaToken: string;
};

export type ResetPasswordResponse = {
    message: string;
};

// ─── Me / Session ─────────────────────────────────────────────────────────────

export type MeResponse = {
    user: AuthUser;
};

// ─── Backend response shapes (raw, before normalization) ─────────────────────

export type BackendLoginResponse = {
    message: string;
    access_token?: string;
    refresh_token?: string;
    otp_auth_url?: string;
    user?: Partial<AuthUser>;
};

export type BackendVerify2FAResponse = {
    message: string;
    access_token: string;
    refresh_token: string;
    user?: Partial<AuthUser>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normalizeUser(raw_user?: Partial<AuthUser>, fallback_email?: string): AuthUser {
    const email = raw_user?.email || fallback_email || 'user@example.com';
    return {
        email,
        name: raw_user?.name || email.split('@')[0] || 'User',
        role: raw_user?.role || 'admin',
        user_type: raw_user?.user_type || 'platform',
    };
}
