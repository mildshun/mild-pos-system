"use client";

import { useEffect, useMemo, useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import type { Product, Order } from "@/lib/types";

type CartItem = { product_id: number; quantity: number };

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await apiFetch<Product[]>("/api/products");
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiFetch<Order[]>("/api/orders?limit=10");
      setOrders(data);
    } catch {
      // optional
    }
  };

  useEffect(() => {
    Promise.all([loadProducts(), loadOrders()]).finally(() => setLoading(false));
  }, []);

  const addToCart = (product_id: number) => {
    setCart((items) => {
      const existing = items.find((i) => i.product_id === product_id);
      if (existing) {
        return items.map((i) => (i.product_id === product_id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...items, { product_id, quantity: 1 }];
    });
  };

  const updateQuantity = (product_id: number, quantity: number) => {
    setCart((items) =>
      items
        .map((i) => (i.product_id === product_id ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const createOrder = async () => {
    setStatus("Submitting...");
    setError(null);
    try {
      const order = await apiFetch<Order>("/api/orders", { method: "POST", body: { items: cart } });
      setStatus(`Order #${order.id} created`);
      setCart([]);
      loadOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatus(null);
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.product_id);
      return sum + (prod ? Number(prod.price) * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Cashier</p>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          </div>
          {status && <div className="text-sm text-slate-700">{status}</div>}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 card p-4">
            <h2 className="font-semibold mb-3 text-slate-900">Products</h2>
            {loading ? (
              <p className="text-sm text-slate-600">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-600">No products available.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {products.map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 p-3 space-y-2 bg-white">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.sku}</div>
                    <div className="text-sm font-semibold text-slate-800">${p.price}</div>
                    <button onClick={() => addToCart(p.id)} className="w-full btn-primary text-sm">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Cart</h2>
              <span className="text-xs text-slate-500">Total ${cartTotal.toFixed(2)}</span>
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-600">No items.</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.product_id);
                  return (
                    <div key={item.product_id} className="flex items-center justify-between gap-2 border border-slate-100 rounded-lg px-3 py-2">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{product?.name}</p>
                        <p className="text-xs text-slate-500">ID {item.product_id}</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                        className="w-16 rounded-md border border-slate-200 px-2 py-1 text-sm"
                      />
                    </div>
                  );
                })}
                <button
                  onClick={createOrder}
                  className="w-full btn-primary text-sm"
                  disabled={cart.length === 0}
                >
                  Submit Order
                </button>
              </div>
            )}
            {status && <p className="text-sm text-slate-600">{status}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-3 text-slate-900">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-600">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="rounded-md border border-slate-100 p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Order #{o.id}</div>
                    <div className="text-sm text-slate-600">Total ${o.total_amount}</div>
                  </div>
                  <div className="text-xs text-slate-500">Items: {o.items?.length ?? 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedShell>
  );
}
