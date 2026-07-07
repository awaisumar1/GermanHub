"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ArrowRight, Shuffle, Network, Sparkles, Clock } from "lucide-react";
import type { RecentExploration, NodeType } from "@/types";
import { SearchDialog } from "@/components/layout/search-dialog";

function getNodeHref(slug: string, type: NodeType): string {
  switch (type) {
    case "concept": return `/concept/${slug}`;
    case "word": return `/word/${slug}`;
    case "theme": return `/theme/${slug}`;
    default: return `/node/${type}/${slug}`;
  }
}

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

const quickLinks = [
  { slug: "weil", type: "word" as NodeType, label: "weil" },
  { slug: "denn", type: "word" as NodeType, label: "denn" },
  { slug: "deshalb", type: "word" as NodeType, label: "deshalb" },
  { slug: "deswegen", type: "word" as NodeType, label: "deswegen" },
  { slug: "daher", type: "word" as NodeType, label: "daher" },
];

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentExplorations, setRecentExplorations] = useState<RecentExploration[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("german-hub-explorations");
      if (stored) {
        setRecentExplorations(JSON.parse(stored));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full opacity-[0.03] blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-[var(--color-word)] rounded-full opacity-[0.03] blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Title */}
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Explore</span>{" "}
              <span className="text-[var(--color-text)]">the German</span>
              <br />
              <span className="text-[var(--color-text)]">Language</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              A knowledge graph for learning German. Discover how words,
              grammar, and ideas connect — by exploring, not studying.
            </p>
          </div>

          {/* Search Box */}
          <div className="animate-fade-in-up max-w-xl mx-auto mb-8">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] shadow-lg hover:shadow-[var(--shadow-glow)] transition-all duration-300 cursor-pointer group"
            >
              <Search className="w-5 h-5 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors" />
              <span className="text-[var(--color-text-muted)] text-base">
                Search words, concepts, grammar...
              </span>
              <kbd className="ml-auto hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-2 flex-wrap animate-fade-in-up">
            <span className="text-xs text-[var(--color-text-dim)] mr-1">Try:</span>
            {quickLinks.map((link) => (
              <Link
                key={link.slug}
                href={getNodeHref(link.slug, link.type)}
                className="px-3 py-1 rounded-full text-sm bg-[var(--color-surface)] hover:bg-[var(--color-accent-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all duration-200 border border-transparent hover:border-[var(--color-accent-muted)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Concept */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Featured Concept</h2>
        </div>

        <Link href="/concept/expressing-reasons" className="block group">
          <div className="card-base card-interactive p-8 sm:p-10">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="node-dot node-dot-concept" />
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
                    Concept
                  </span>
                  <span className="cefr-badge cefr-a2">A2</span>
                  <span className="cefr-badge cefr-b1">B1</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors mb-1">
                  Expressing Reasons
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  Gründe ausdrücken
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mb-6">
              Learn five different ways to express reasons and causes in German — from subordinating
              conjunctions to connecting adverbs.
            </p>
            <div className="flex flex-wrap gap-2">
              {["weil", "denn", "deshalb", "deswegen", "daher"].map((word) => (
                <span
                  key={word}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-accent-glow)] border border-[var(--color-accent-muted)] text-[var(--color-accent)]"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </section>

      {/* Action Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Random Concept */}
          <Link href="/concept/expressing-reasons" className="group">
            <div className="card-base card-interactive p-6 flex items-center gap-4 h-full">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-theme)]/10 flex items-center justify-center flex-shrink-0">
                <Shuffle className="w-5 h-5 text-[var(--color-theme)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  Random Concept
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Discover something new
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-dim)] ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </Link>

          {/* Explore Graph */}
          <Link href="/graph" className="group">
            <div className="card-base card-interactive p-6 flex items-center gap-4 h-full">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-skill)]/10 flex items-center justify-center flex-shrink-0">
                <Network className="w-5 h-5 text-[var(--color-skill)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  Knowledge Graph
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  See how everything connects
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-dim)] ml-auto opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Explorations */}
      {mounted && recentExplorations.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-[var(--color-text-dim)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Recent Explorations
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {recentExplorations.slice(0, 6).map((item) => (
              <Link
                key={`${item.type}-${item.slug}`}
                href={getNodeHref(item.slug, item.type)}
                className="card-base card-interactive p-4 flex items-center gap-3 group"
              >
                <span
                  className="node-dot flex-shrink-0"
                  style={{ backgroundColor: getNodeColor(item.type) }}
                />
                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                  {item.title}
                </span>
                <ArrowRight className="w-3 h-3 text-[var(--color-text-dim)] ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
