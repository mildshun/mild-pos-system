"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@local.dev");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AuthState & { token_type: string; expires_at: string }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveAuth({ access_token: data.access_token, user: data.user });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl bg-white shadow p-8 space-y-6 w-full max-w-md">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-wide text-slate-500">Codex POS</p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-600">Use the seeded credentials for local dev.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Email</label>
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Password</label>
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring focus:ring-slate-200"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
