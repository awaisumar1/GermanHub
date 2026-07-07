"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecentExploration } from "@/types";

const STORAGE_KEY = "german-hub-explorations";
const MAX_ITEMS = 10;

/**
 * Read explorations from localStorage.
 * Returns an empty array if localStorage is unavailable (SSR) or data is invalid.
 */
function readFromStorage(): RecentExploration[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentExploration[]) : [];
  } catch {
    return [];
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
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Hook for managing recently explored nodes in localStorage.
 *
 * - `explorations` — the current list (most recent first, max 10)
 * - `addExploration(item)` — add a new exploration (deduplicates, caps at 10)
 * - `clearExplorations()` — remove all stored explorations
 */
export function useRecentExplorations() {
  const [explorations, setExplorations] = useState<RecentExploration[]>([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setExplorations(readFromStorage());
  }, []);

  const addExploration = useCallback(
    (item: Omit<RecentExploration, "visitedAt">) => {
      setExplorations((prev) => {
        const now = new Date().toISOString();
        const newItem: RecentExploration = { ...item, visitedAt: now };

        // Remove any existing entry with the same slug + type
        const deduped = prev.filter(
          (e) => !(e.slug === item.slug && e.type === item.type)
        );

        // Prepend the new item and cap at MAX_ITEMS
        const updated = [newItem, ...deduped].slice(0, MAX_ITEMS);

        writeToStorage(updated);
        return updated;
      });
    },
    []
  );

  const getExplorations = useCallback((): RecentExploration[] => {
    return readFromStorage();
  }, []);

  const clearExplorations = useCallback(() => {
    setExplorations([]);
    writeToStorage([]);
  }, []);

  return {
    explorations,
    addExploration,
    getExplorations,
    clearExplorations,
  } as const;
}
