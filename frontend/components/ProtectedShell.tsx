"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { clearAuth, getStoredAuth, saveAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

type Props = {
  children: React.ReactNode;
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "cashier"] },
  { href: "/products", label: "Products", roles: ["admin", "cashier"] },
  { href: "/categories", label: "Categories", roles: ["admin"] },
  { href: "/inventory", label: "Inventory", roles: ["admin"] },
  { href: "/orders", label: "Orders", roles: ["admin", "cashier"] },
  { href: "/reports", label: "Reports", roles: ["admin"] },
];

export function ProtectedShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.access_token) {
      router.push("/login");
      return;
    }
    apiFetch<User>("/api/auth/me")
      .then((data) => {
        setUser(data);
        saveAuth({ access_token: auth.access_token, user: data });
      })
      .catch(() => {
        clearAuth();
        setError("Session expired. Please sign in again.");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="card px-6 py-4 text-slate-700">Checking session...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="card px-6 py-4 text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/90 backdrop-blur border-r border-slate-200/70 p-5 flex flex-col gap-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Codex POS</p>
          <p className="font-semibold text-slate-900">{user?.email}</p>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {user?.role}
          </span>
        </div>
        <nav className="space-y-1">
          {navLinks
            .filter((link) => (user ? link.roles.includes(user.role) : false))
            .map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
        </nav>
        <button
          onClick={() => {
            clearAuth();
            router.push("/login");
          }}
          className="mt-auto inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Signed in</p>
              <h1 className="text-xl font-semibold text-slate-900">{user?.email}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-900 text-white text-xs font-semibold px-4 py-2">
                {user?.role?.toUpperCase()}
              </span>
              <a
                href="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900 underline decoration-slate-300"
              >
                Dashboard
              </a>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
