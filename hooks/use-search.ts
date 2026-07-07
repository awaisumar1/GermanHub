"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResult } from "@/types";
import { searchNodes } from "@/lib/data";

const DEBOUNCE_MS = 150;

/**
 * Client-side instant search hook with 150ms debounce.
 * Searches across all node types using title, summary, and tags.
 *
 * @param query - The current search input string
 * @returns An array of matching SearchResult objects sorted by relevance
 */
export function useSearch(query: string): SearchResult[] {
  const [results, setResults] = useState<SearchResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear previous debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const trimmed = query.trim();

    // Clear results immediately for empty queries
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }

    // Debounce the search
    timerRef.current = setTimeout(() => {
      setResults(searchNodes(trimmed));
    }, DEBOUNCE_MS);

    // Cleanup on unmount or query change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  return results;
}
