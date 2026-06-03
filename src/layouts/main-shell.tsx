"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import AuthShell from "@/layouts/auth-shell";
import { useAuthStore } from "@/lib/auth-store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, isAuthenticated } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          logout();
        } else {
          useAuthStore.getState().completeAuth(data.user);
        }
      })
      .catch(() => logout())
      .finally(() => setHasChecked(true));
  }, []);

  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthShell />;
  }

  return <AppShell>{children}</AppShell>;
}
