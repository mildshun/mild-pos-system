"use client";

import { useState } from "react";

import { ProtectedShell } from "@/components/ProtectedShell";
import { apiFetch } from "@/lib/api";
import type { DailyReport } from "@/lib/types";

export default function ReportsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<DailyReport>(`/api/reports/daily?date=${date}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Admin</p>
            <h1 className="text-3xl font-bold text-slate-900">Daily Report</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm bg-white shadow-sm"
            />
            <button onClick={load} className="btn-primary text-sm px-4">
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {report && (
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">{report.date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Order count</p>
                <p className="font-semibold text-slate-900">{report.order_count}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="font-semibold text-slate-900">${report.total_amount}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900">Top products</h3>
              {report.top_products.length === 0 ? (
                <p className="text-sm text-slate-600">No sales yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {report.top_products.map((p) => (
                    <li key={p.product_id} className="flex justify-between">
                      <span>{p.name}</span>
                      <span>
                        {p.quantity} sold (${p.total})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedShell>
  );
}
