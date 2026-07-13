"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { RecentExploration } from "@/types";

const STORAGE_KEY = "german-hub-explorations";
const MAX_ITEMS = 10;
const EMPTY_EXPLORATIONS: RecentExploration[] = [];

let cachedRaw: string | null = null;
let cachedParsed: RecentExploration[] = EMPTY_EXPLORATIONS;

/**
 * Read explorations from localStorage.
 * Returns an empty array if localStorage is unavailable (SSR) or data is invalid.
 */
function readFromStorage(): RecentExploration[] {
  if (typeof window === "undefined") return EMPTY_EXPLORATIONS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EXPLORATIONS;

    // Cache the parsed array to provide a stable reference for useSyncExternalStore
    if (raw === cachedRaw) {
      return cachedParsed;
    }

    const parsed: unknown = JSON.parse(raw);
    const newArray = Array.isArray(parsed) ? (parsed as RecentExploration[]) : EMPTY_EXPLORATIONS;

    cachedRaw = raw;
    cachedParsed = newArray;

    return newArray;
  } catch {
    return EMPTY_EXPLORATIONS;
  }
}

/**
 * Write explorations to localStorage.
 * Silently fails if localStorage is unavailable.
 */
function writeToStorage(items: RecentExploration[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("local-storage"));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("local-storage", callback);
  return () => window.removeEventListener("local-storage", callback);
};

/**
 * Hook for managing recently explored nodes in localStorage.
 *
 * - `explorations` — the current list (most recent first, max 10)
 * - `addExploration(item)` — add a new exploration (deduplicates, caps at 10)
 * - `clearExplorations()` — remove all stored explorations
 */
export function useRecentExplorations() {
  const explorations = useSyncExternalStore(
    subscribe,
    () => readFromStorage(),
    () => EMPTY_EXPLORATIONS
  );

  const addExploration = useCallback(
    (item: Omit<RecentExploration, "visitedAt">) => {
      const prev = readFromStorage();
      const now = new Date().toISOString();
      const newItem: RecentExploration = { ...item, visitedAt: now };

      // Remove any existing entry with the same slug + type
      const deduped = prev.filter(
        (e) => !(e.slug === item.slug && e.type === item.type)
      );

      // Prepend the new item and cap at MAX_ITEMS
      const updated = [newItem, ...deduped].slice(0, MAX_ITEMS);

      writeToStorage(updated);
    },
    []
  );

  const getExplorations = useCallback((): RecentExploration[] => {
    return readFromStorage();
  }, []);

  const clearExplorations = useCallback(() => {
    writeToStorage([]);
  }, []);

  return {
    explorations,
    addExploration,
    getExplorations,
    clearExplorations,
  } as const;
}
