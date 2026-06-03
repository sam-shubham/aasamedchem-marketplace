"use client";

import { useState } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { MailIcon, LockKeyholeIcon, ArrowRightIcon } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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
      const target = data.user.role === "ADMIN" ? "/admin/products" : "/seller/orders";
      window.location.assign(target);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left panel: brand / illustration ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col items-center justify-center px-16"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.06 270) 0%, oklch(0.14 0.04 264) 50%, oklch(0.18 0.08 240) 100%)",
        }}
      >
        {/* Decorative glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px] rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: "radial-gradient(circle, oklch(0.66 0.20 270), transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] rounded-full opacity-15 blur-3xl animate-float"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.17 215), transparent 70%)", animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10 blur-2xl"
          style={{ background: "radial-gradient(circle, oklch(0.68 0.19 145), transparent 70%)" }} />

        {/* Grid lines overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center space-y-8">
          {/* Logo image — white version via brightness filter */}
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo2.webp"
              alt="AasaMedChem"
              width={260}
              height={80}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>

          <p className="text-lg font-medium" style={{ color: "oklch(0.80 0.06 270)" }}>
            Inventory &amp; Order Management
          </p>

          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.62 0.04 264)" }}>
            Streamline your pharmaceutical chemical supply chain with precision inventory tracking, real-time quotations, and order management.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {["Real-time Inventory", "Smart Quotations", "Order Tracking", "Multi-role Access"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  background: "oklch(1 0 0 / 5%)",
                  borderColor: "oklch(1 0 0 / 12%)",
                  color: "oklch(0.75 0.05 270)",
                }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="text-xs" style={{ color: "oklch(0.45 0.03 264)" }}>
            © 2025 AasaMedChem · Secure & Encrypted
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px] animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <Image
              src="/logo2.webp"
              alt="AasaMedChem"
              width={160}
              height={52}
              className="object-contain h-10 w-auto"
              priority
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1.5">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card shadow-lg p-7 space-y-5">
            <form
              onSubmit={(e) => { e.preventDefault(); void handleSubmit(e); }}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <MailIcon
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 transition-colors duration-150 ${focusedField === "email" ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={1.75}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@aasamedchem.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-4 h-11 w-full rounded-xl border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-150"
                    style={{
                      borderColor: focusedField === "email" ? "var(--primary)" : "var(--border)",
                      boxShadow: focusedField === "email" ? "0 0 0 3px var(--primary-glow)" : "none",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <LockKeyholeIcon
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 transition-colors duration-150 ${focusedField === "password" ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={1.75}
                  />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 pr-4 h-11 w-full rounded-xl border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-150"
                    style={{
                      borderColor: focusedField === "password" ? "var(--primary)" : "var(--border)",
                      boxShadow: focusedField === "password" ? "0 0 0 3px var(--primary-glow)" : "none",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 animate-scale-in">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[0.98] mt-1"
                style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, oklch(0.55 0.22 280) 100%)",
                  boxShadow: "0 2px 16px var(--primary-glow)",
                }}
              >
                {loading ? (
                  <><Spinner size="sm" /> Signing in...</>
                ) : (
                  <>Sign in <ArrowRightIcon className="size-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Test credentials */}
          <div className="mt-5 rounded-xl border border-border/70 bg-muted/40 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              Demo credentials
            </p>
            <div className="space-y-2">
              {[
                { role: "Admin", email: "admin@aasamedchem.com", pass: "admin123", color: "oklch(0.52 0.22 270)" },
                { role: "Seller", email: "seller@aasamedchem.com", pass: "seller123", color: "oklch(0.60 0.19 215)" },
              ].map((c) => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.pass); }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/80 group cursor-pointer"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white text-[10px] font-bold"
                    style={{ background: c.color }}>
                    {c.role[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{c.role}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                    click to fill
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
