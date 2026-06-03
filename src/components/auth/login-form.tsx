"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_ICON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LOCK_ICON = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      const target =
        data.user.role === "ADMIN" ? "/admin/products" : "/seller/orders";
      window.location.assign(target);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-slide-up">
      <div className="rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5 overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground text-base">
              A
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-foreground">
                AasaMedChem
              </span>
              <span className="block text-xs text-muted-foreground">
                Inventory & Order Management
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="text-sm text-muted-foreground">
              Access your inventory dashboard
            </p>
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-border/60 to-transparent mx-6" />

        <div className="px-8 py-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "email" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {EMAIL_ICON}
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@aasamedchem.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="pl-10 h-11 w-full bg-muted/40 border border-border/80 rounded-xl focus:border-primary focus:bg-background transition-all outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "password" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {LOCK_ICON}
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="pl-10 h-11 w-full bg-muted/40 border border-border/80 rounded-xl focus:border-primary focus:bg-background transition-all outline-none text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full font-semibold text-sm rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Signing in...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>

        <div className="px-8 pb-8">
          <div className="rounded-xl bg-muted/50 border border-border/80 p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Test credentials
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Admin:</span>{" "}
                admin@aasamedchem.com / admin123
              </p>
              <p>
                <span className="font-semibold text-foreground">Seller:</span>{" "}
                seller@aasamedchem.com / seller123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
