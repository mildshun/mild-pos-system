"use client";

import { getStoredAuth, clearAuth } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  token?: string;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const auth = getStoredAuth();
  const token = options.token || auth?.access_token;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) {
    // no content
    return {} as T;
  }

  return (await res.json()) as T;
}
