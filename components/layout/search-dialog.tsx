"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import type { NodeType, SearchResult } from "@/types";

// Import data directly for client-side search
import conceptsData from "@/data/concepts.json";
import wordsData from "@/data/words.json";
import themesData from "@/data/themes.json";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchableItem {
  slug: string;
  title: string;
  type: NodeType;
  summary: string;
  tags?: string[];
}

// Build a flat searchable list from all data
function getAllSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  for (const c of conceptsData) {
    items.push({
      slug: c.slug,
      title: c.title,
      type: c.type as NodeType,
      summary: c.summary,
      tags: c.tags,
    });
  }

  for (const w of wordsData) {
    items.push({
      slug: w.slug,
      title: w.word,
      type: w.type as NodeType,
      summary: w.summary,
      tags: w.tags,
    });
  }

  for (const t of themesData) {
    items.push({
      slug: t.slug,
      title: t.title,
      type: t.type as NodeType,
      summary: t.summary,
      tags: t.tags,
    });
  }

  return items;
}

import { getNodeHref } from "@/lib/routes";

function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    concept: "var(--color-concept)",
    word: "var(--color-word)",
    theme: "var(--color-theme)",
    grammar: "var(--color-grammar)",
    level: "var(--color-level)",
    skill: "var(--color-skill)",
    mistake: "var(--color-mistake)",
  };
  return colors[type];
}

function getTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    concept: "Concept",
    word: "Word",
    theme: "Theme",
    grammar: "Grammar",
    level: "Level",
    skill: "Skill",
    mistake: "Mistakes",
  };
  return labels[type];
}

function searchItems(query: string, items: SearchableItem[]): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  return items
    .map((item) => {
      let score = 0;
      const title = item.title.toLowerCase();
      const summary = item.summary.toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      // Exact title match
      if (title === q) score += 100;
      // Title starts with query
      else if (title.startsWith(q)) score += 80;
      // Title contains query
      else if (title.includes(q)) score += 60;
      // Summary contains query
      if (summary.includes(q)) score += 30;
      // Tags match
      for (const tag of tags) {
        if (tag.includes(q)) score += 20;
      }

      return { ...item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items] = useState(getAllSearchableItems);

  // Reset state on open
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Cmd+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Instant search on every keystroke
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(0);
      setResults(searchItems(value, items));
    },
    [items]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  };

  const navigate = (result: SearchResult) => {
    router.push(getNodeHref(result.slug, result.type));
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative max-w-xl mx-auto mt-[15vh] animate-fade-in">
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
            <Search className="w-4 h-4 text-[var(--color-text-dim)] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search concepts, words, themes..."
              className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-dim)] text-sm outline-none"
            />
            {query && (
              <button
                onClick={() => handleSearch("")}
                className="p-1 rounded hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[var(--color-text-dim)]" />
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.slug}`}
                  onClick={() => navigate(result)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer ${
                    index === selectedIndex
                      ? "bg-[var(--color-accent-muted)]"
                      : "hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <span
                    className="node-dot flex-shrink-0"
                    style={{ backgroundColor: getNodeColor(result.type) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--color-text)] truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">
                      {result.summary}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-dim)] flex-shrink-0">
                    {getTypeLabel(result.type)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[var(--color-text-dim)] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {query && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                No results for &quot;{query}&quot;
              </p>
              <p className="text-xs text-[var(--color-text-dim)] mt-1">
                Try searching for a word like &quot;weil&quot; or a concept like &quot;reasons&quot;
              </p>
            </div>
          )}

          {/* Hint */}
          {!query && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                Start typing to search the knowledge graph
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--color-text-dim)]">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>Esc Close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
