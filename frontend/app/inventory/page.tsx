"use client";

import { useEffect, useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import type { Inventory } from "@/lib/types";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setStatus("Loading...");
    try {
      const data = await apiFetch<Inventory[]>("/api/inventory");
      setInventory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatus(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQuantity = async (product_id: number, quantity: number) => {
    setStatus("Updating...");
    try {
      await apiFetch<Inventory>(`/api/inventory/${product_id}`, { method: "PATCH", body: { quantity } });
      load();
    } catch (err: any) {
      setError(err.message);
      setStatus(null);
    }
  };

  return (
    <ProtectedShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Inventory</h1>
          {status && <p className="text-sm text-slate-600">{status}</p>}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="rounded-lg bg-white border border-slate-200">
          {inventory.length === 0 ? (
            <p className="p-4 text-sm text-slate-600">No inventory records.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2">Product ID</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => (
                  <tr key={inv.product_id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{inv.product_id}</td>
                    <td className="px-3 py-2">{inv.quantity}</td>
                    <td className="px-3 py-2 text-slate-500">{new Date(inv.updated_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        defaultValue={inv.quantity}
                        onBlur={(e) => updateQuantity(inv.product_id, Number(e.target.value))}
                        className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedShell>
  );
}
