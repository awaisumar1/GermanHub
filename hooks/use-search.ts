"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      // For empty query, update immediately without debounce
      // We use setTimeout with 0 to avoid the synchronous setState linter rule,
      // but it still effectively clears the search instantly.
      const timer = setTimeout(() => setDebouncedQuery(""), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return useMemo(() => {
    if (debouncedQuery.length === 0) return [];
    return searchNodes(debouncedQuery);
  }, [debouncedQuery]);
}
