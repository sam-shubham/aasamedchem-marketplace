'use client';

import { LoginForm } from '@/components/auth/login-form';

export function AuthShell() {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center p-6">
 <LoginForm />
 </div>
 );
}

export default AuthShell;