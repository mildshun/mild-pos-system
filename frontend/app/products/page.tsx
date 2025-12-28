"use client";

import { useEffect, useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import type { Product, Category } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", category_id: "", price: "" });
  const [editForm, setEditForm] = useState<{ id: number | null; name: string; category_id: string; price: string; is_active: boolean }>({
    id: null,
    name: "",
    category_id: "",
    price: "",
    is_active: true,
  });
  const [role, setRole] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        apiFetch<Product[]>(`/api/products${query ? `?query=${encodeURIComponent(query)}` : ""}`),
        apiFetch<Category[]>("/api/categories"),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const auth = getStoredAuth();
    setRole(auth?.user.role ?? null);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch<Product>("/api/products", {
        method: "POST",
        body: {
          sku: form.sku,
          name: form.name,
          category_id: Number(form.category_id),
          price: Number(form.price),
          is_active: true,
        },
      });
      setForm({ sku: "", name: "", category_id: "", price: "" });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (product: Product) => {
    setEditForm({
      id: product.id,
      name: product.name,
      category_id: String(product.category_id),
      price: String(product.price),
      is_active: product.is_active,
    });
  };
  const deleteProduct = async (id: number) => {
    setError(null);
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      if (editForm.id === id) {
        setEditForm({ id: null, name: "", category_id: "", price: "", is_active: true });
      }
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;
    setError(null);
    try {
      await apiFetch<Product>(`/api/products/${editForm.id}`, {
        method: "PATCH",
        body: {
          name: editForm.name,
          category_id: Number(editForm.category_id),
          price: Number(editForm.price),
          is_active: editForm.is_active,
        },
      });
      setEditForm({ id: null, name: "", category_id: "", price: "", is_active: true });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Catalog</p>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          </div>
          <div className="flex gap-2">
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white"
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={load} className="btn-primary text-sm px-4">
              Search
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {role === "admin" && (
            <form onSubmit={handleCreate} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Create Product</h2>
                <span className="text-xs text-slate-500">Admin only</span>
              </div>
              <input
                required
                placeholder="SKU"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
              <input
                required
                placeholder="Name"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <select
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white"
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (#{cat.id})
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Price"
                type="number"
                step="0.01"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full btn-primary text-sm">
                Create
              </button>
            </form>
          )}

          {role === "admin" && (
            <form onSubmit={handleUpdate} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Edit Product</h2>
                <span className="text-xs text-slate-500">{editForm.id ? `Editing #${editForm.id}` : "Select row"}</span>
              </div>
              <input
                placeholder="Name"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                disabled={!editForm.id}
              />
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white"
                value={editForm.category_id}
                onChange={(e) => setEditForm((f) => ({ ...f, category_id: e.target.value }))}
                disabled={!editForm.id}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (#{cat.id})
                  </option>
                ))}
              </select>
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={editForm.price}
                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                disabled={!editForm.id}
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                  disabled={!editForm.id}
                />
                Active
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full btn-primary text-sm disabled:opacity-60" disabled={!editForm.id}>
                Save changes
              </button>
              <button
                type="button"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setEditForm({ id: null, name: "", category_id: "", price: "", is_active: true })}
                disabled={!editForm.id}
              >
                Clear
              </button>
            </form>
          )}

          <div className="lg:col-span-2 card overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-slate-600">Loading products...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : products.length === 0 ? (
              <div className="p-4 text-slate-600">No products found.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600">
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Active</th>
                    {role === "admin" && <th className="px-4 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.sku}</td>
                      <td className="px-4 py-3">{p.name}</td>
                      <td className="px-4 py-3">{p.category_id}</td>
                      <td className="px-4 py-3 font-semibold">${p.price}</td>
                      <td className="px-4 py-3">{p.is_active ? "Yes" : "No"}</td>
                      {role === "admin" && (
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              className="text-sm text-slate-700 underline decoration-slate-300"
                              onClick={() => startEdit(p)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-sm text-red-600 underline decoration-slate-300"
                              onClick={() => deleteProduct(p.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
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
