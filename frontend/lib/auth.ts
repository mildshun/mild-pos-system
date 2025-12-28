"use client";

import type { AuthState } from "./types";

const STORAGE_KEY = "codex-pos-auth";

export function getStoredAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
