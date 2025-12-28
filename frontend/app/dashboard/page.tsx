"use client";

import { useEffect, useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import type { Order, Product, User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<User>("/api/auth/me"),
      apiFetch<Product[]>("/api/products"),
      apiFetch<Order[]>("/api/orders?limit=5"),
    ])
      .then(([me, prod, ord]) => {
        setUser(me);
        setProducts(prod);
        setOrders(ord);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="card px-4 py-3">
            <p className="text-sm text-slate-500">Role</p>
            <p className="font-semibold text-slate-900">{user?.role ?? "…"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Products", value: products.length },
            { label: "Recent orders", value: orders.length },
            { label: "User", value: user?.email ?? "…" },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? "…" : item.value}</p>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-600">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">Order #{o.id}</p>
                    <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">${o.total_amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedShell>
  );
}
