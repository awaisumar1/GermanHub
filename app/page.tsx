"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Network,
  BookOpen,
  Layers,
  MapIcon,
  Search,
  Compass,
} from "lucide-react";
import { getNodeBySlug } from "@/lib/data";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import { SearchDialog } from "@/components/layout/search-dialog";
import { GraphPreview } from "@/components/home/graph-preview";
import type { NodeType, GraphNode } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    concept: "Concept", word: "Word", theme: "Theme",
    grammar: "Grammar", level: "Level", skill: "Skill", mistake: "Mistakes",
  };
  return labels[type];
}

// ---------------------------------------------------------------------------
// Curated fallback for first-time visitors — only real vertical-slice nodes
// ---------------------------------------------------------------------------

const CURATED_SLUGS: { slug: string; type: NodeType }[] = [
  { slug: "expressing-reasons", type: "concept" },
  { slug: "weil", type: "word" },
  { slug: "denn", type: "word" },
  { slug: "travel", type: "theme" },
  { slug: "sentence-order", type: "grammar" },
  { slug: "modal-verbs", type: "concept" },
];

function getCuratedItems(): GraphNode[] {
  return CURATED_SLUGS
    .map(({ slug, type }) => getNodeBySlug(slug, type))
    .filter((n): n is GraphNode => n !== undefined);
}

// ---------------------------------------------------------------------------
// Exploration mode card
// ---------------------------------------------------------------------------

interface ExplorationMode {
  icon: React.ElementType;
  label: string;
  description: string;
  example?: string;
  href: string;
  color: string;
}

const EXPLORATION_MODES: ExplorationMode[] = [
  {
    icon: Layers,
    label: "Concepts",
    description: "Understand connected linguistic ideas",
    example: "e.g., Expressing Reasons",
    href: "/concept/expressing-reasons",
    color: "var(--color-concept)",
  },
  {
    icon: MapIcon,
    label: "Themes",
    description: "Learn for real-life situations",
    example: "e.g., Travel",
    href: "/theme/travel",
    color: "var(--color-theme)",
  },
  {
    icon: Network,
    label: "Grammar Connections",
    description: "Explore how rules relate",
    example: "e.g., Sentence Order",
    href: "/concept/sentence-order",
    color: "var(--color-grammar)",
  },
  {
    icon: Compass,
    label: "Follow a Curated Route",
    description: "A connected, thoughtfully selected journey",
    example: "A1 → C2 Path",
    href: "/explore/guided",
    color: "var(--color-skill)",
  },
];

// ---------------------------------------------------------------------------
// Platform-aware keyboard shortcut
// ---------------------------------------------------------------------------

function useKbdShortcut(): string {
  // useSyncExternalStore: server snapshot = "Ctrl K", client snapshot reads platform.
  // This avoids setState-in-effect and prevents hydration mismatch.
  return useSyncExternalStore(
    () => () => {},                   // no subscription needed — value is static
    () =>                             // client snapshot
      typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
        ? "⌘K"
        : "Ctrl K",
    () => "Ctrl K"                    // server snapshot
  );
}

// ---------------------------------------------------------------------------
// Continue Exploring — dual-state with stable dimensions
// ---------------------------------------------------------------------------

function ContinueExploringSection() {
  const { explorations } = useRecentExplorations();

  // useRecentExplorations() returns [] on SSR and populates after mount via its
  // own internal useEffect, so explorations.length > 0 reliably means
  // "client has mounted AND has valid history" — no separate mounted flag needed.
  const curatedItems = getCuratedItems();

  let displayItems: GraphNode[] = curatedItems;
  let sectionLabel = "Start Exploring";
  let isPersonalised = false;

  if (explorations.length > 0) {
    // Individually validate each stored entry — filter invalid, keep valid ones
    const validItems = explorations
      .slice(0, 6)
      .map((e) => getNodeBySlug(e.slug, e.type))
      .filter((n): n is GraphNode => n !== undefined);

    if (validItems.length > 0) {
      displayItems = validItems;
      sectionLabel = "Continue Exploring";
      isPersonalised = true;
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 pb-12">
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-4 h-4 text-[var(--color-accent)]" />
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {sectionLabel}
        </h2>
        {isPersonalised && (
          <span className="text-xs text-[var(--color-text-dim)] ml-1">
            — your recent visits
          </span>
        )}
      </div>

      {/* Fixed 2-row grid (3 cols on lg, 2 on sm, 1 on xs) — stable height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayItems.slice(0, 6).map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={getNodeHref(item.slug, item.type)}
            className="card-base card-interactive p-4 flex items-center gap-3 group min-h-[3.5rem]"
          >
            <span
              className="node-dot flex-shrink-0"
              style={{ backgroundColor: getNodeColor(item.type) }}
              aria-hidden="true"
            />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate">
                {item.title}
              </span>
              <span className="block text-xs text-[var(--color-text-dim)]">
                {getTypeLabel(item.type)}
              </span>
            </span>
            <ArrowRight
              className="w-3 h-3 text-[var(--color-text-dim)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const kbdLabel = useKbdShortcut();

  // Global ⌘K / Ctrl+K handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle background ambient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full opacity-[0.03] blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-[var(--color-word)] rounded-full opacity-[0.03] blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            <span className="gradient-text">Explore</span>{" "}
            <span className="text-[var(--color-text)]">the German</span>
            <br />
            <span className="text-[var(--color-text)]">Language</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
            See how German words, grammar, and real-life situations connect.
          </p>

          {/* CTA group — clear primary/secondary hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary */}
            <Link
              href="/concept/expressing-reasons"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold text-base transition-colors duration-200 shadow-lg hover:shadow-[var(--shadow-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              Start with Expressing Reasons
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            {/* Secondary */}
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-base hover:border-[var(--color-accent-muted)] hover:text-[var(--color-text)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <Network className="w-4 h-4" aria-hidden="true" />
              Open Knowledge Graph
            </Link>
          </div>
        </div>
      </section>

      {/* ── Graph Preview ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-14">
        <GraphPreview />
      </section>

      {/* ── Exploration Modes ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-dim)] mb-5">
          Choose how to explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPLORATION_MODES.map((mode) => (
            <Link
              key={mode.label}
              href={mode.href}
              className="card-base card-interactive p-5 flex flex-col gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${mode.color} 12%, transparent)` }}
              >
                <mode.icon className="w-5 h-5" style={{ color: mode.color }} aria-hidden="true" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mb-1">
                  {mode.label}
                </span>
                <span className="block text-xs text-[var(--color-text-dim)] leading-relaxed">
                  {mode.description}
                </span>
                <span className="block text-[10px] text-[var(--color-text-muted)] mt-2 italic">
                  {mode.example}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Concept ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Featured Concept</h2>
        </div>

        <Link href="/concept/expressing-reasons" className="block group">
          <div className="card-base card-interactive p-7 sm:p-9 relative overflow-hidden">
            {/* Left accent stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-concept)] rounded-l-lg" aria-hidden="true" />

            <div className="pl-4">
              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="node-dot node-dot-concept" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
                  Concept
                </span>
                <span className="cefr-badge cefr-a2">A2</span>
                <span className="cefr-badge cefr-b1">B1</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mb-1">
                Expressing Reasons
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] italic mb-4">
                Gründe ausdrücken
              </p>

              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mb-6">
                Learn five different ways to express reasons and causes in German — from
                subordinating conjunctions that move the verb to the end, to connecting adverbs
                that let you state consequences.
              </p>

              {/* Word chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["weil", "denn", "deshalb", "deswegen", "daher"].map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-accent-glow)] border border-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  >
                    {word}
                  </span>
                ))}
              </div>

              {/* Faded mini-table preview */}
              <div className="relative overflow-hidden rounded-lg border border-[var(--color-border-subtle)] max-w-md">
                <table className="w-full text-sm border-collapse" aria-hidden="true">
                  <thead>
                    <tr className="bg-[var(--color-surface)]">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wider">Word</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wider">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wider">Verb Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--color-border-subtle)]">
                      <td className="px-3 py-2 font-mono text-[var(--color-accent)]">weil</td>
                      <td className="px-3 py-2 text-[var(--color-text-muted)]">subordinating</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">verb-last</td>
                    </tr>
                    <tr className="border-t border-[var(--color-border-subtle)]">
                      <td className="px-3 py-2 font-mono text-[var(--color-accent)]">denn</td>
                      <td className="px-3 py-2 text-[var(--color-text-muted)]">coordinating</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">verb-second</td>
                    </tr>
                  </tbody>
                </table>
                {/* Fade mask */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg-card))" }}
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-5 text-sm font-medium text-[var(--color-accent)]">
                Start exploring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Continue Exploring ─────────────────────────────────────────── */}
      <ContinueExploringSection />

      {/* ── Search Strip ───────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <p className="text-center text-xs text-[var(--color-text-dim)] mb-3">
          Looking for something specific?
        </p>
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] transition-colors duration-200 cursor-pointer group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors duration-200" aria-hidden="true" />
          <span className="text-[var(--color-text-muted)] text-sm">
            Search words, concepts, grammar...
          </span>
          <kbd className="ml-auto hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
            {kbdLabel}
          </kbd>
        </button>
      </section>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
