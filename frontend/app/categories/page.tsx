"use client";

import { useEffect, useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Category[]>("/api/categories");
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch<Category>("/api/categories", { method: "POST", body: { name, is_active: true } });
      setName("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deactivate = async (id: number) => {
    await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  const activate = async (id: number) => {
    await apiFetch(`/api/categories/${id}`, { method: "PATCH", body: { is_active: true } });
    load();
  };

  return (
    <ProtectedShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Admin</p>
            <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={addCategory} className="card p-4 space-y-3">
            <h2 className="font-semibold text-slate-900">Add Category</h2>
            <input
              required
              placeholder="Name"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full btn-primary text-sm">
              Create
            </button>
          </form>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-slate-600">Loading categories…</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-slate-600">No categories.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr key={cat.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{cat.name}</td>
                      <td className="px-4 py-3">{cat.is_active ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          {cat.is_active ? (
                            <button className="text-sm text-red-600" onClick={() => deactivate(cat.id)}>
                              Deactivate
                            </button>
                          ) : (
                            <button className="text-sm text-slate-700 underline decoration-slate-300" onClick={() => activate(cat.id)}>
                              Activate
                            </button>
                          )}
                          <button
                            className="text-sm text-red-500 underline decoration-slate-300"
                            onClick={() => deactivate(cat.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ProtectedShell>
  );
}
