/**
 * crossRoleStore.ts — Generic localStorage-backed store with React hooks.
 * Enables cross-role data sharing (patient ↔ pharmacy ↔ lab ↔ doctor ↔ secretary).
 * Uses BroadcastChannel for same-tab + cross-tab sync.
 *
 * // TODO BACKEND: Replace with real-time subscriptions (WebSocket / Supabase Realtime)
 */
import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createStore<T>(key: string, initialData: T) {
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`store_${key}`) : null;
  const listeners = new Set<Listener>();

  function read(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialData;
    } catch {
      return initialData;
    }
  }

  let snapshot = read();

  function getSnapshot(): T {
    return snapshot;
  }

  function emit() {
    snapshot = read();
    listeners.forEach((l) => l());
  }

  // Listen for cross-tab updates
  channel?.addEventListener("message", () => emit());

  // Listen for same-tab updates from other stores
  window.addEventListener("storage", (e) => {
    if (e.key === key) emit();
  });

  function set(updater: T | ((prev: T) => T)) {
    const prev = read();
    const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
    localStorage.setItem(key, JSON.stringify(next));
    snapshot = next;
    listeners.forEach((l) => l());
    channel?.postMessage("update");
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /** Reset store to initial data */
  function reset() {
    set(initialData);
  }

  return { getSnapshot, set, subscribe, reset, read };
}

/** React hook for any store created with createStore */
export function useStore<T>(store: ReturnType<typeof createStore<T>>): [T, (updater: T | ((prev: T) => T)) => void] {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return [data, store.set];
}
