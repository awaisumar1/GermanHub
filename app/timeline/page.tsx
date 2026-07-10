"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Globe,
  Network,
  ChevronUp,
  Layers,
  BookMarked,
  Star,
} from "lucide-react";
import { getAllConcepts } from "@/lib/data";
import { PremiumGrammarTable } from "@/components/ui/premium-grammar-table";
import { InteractiveSyntax } from "@/components/ui/interactive-syntax";
import { InteractivePractice } from "@/components/ui/interactive-practice";
import type { CEFRLevel, BlockCategory, ConceptBlock, Concept } from "@/types";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const ALL_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const ALL_CATEGORIES: BlockCategory[] = ["Wortschatz", "Grammatik", "Sätze", "Praxis"];
const LEVEL_ORDER: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
const CATEGORY_ORDER: Record<string, number> = { Grammatik: 0, Wortschatz: 1, Sätze: 2, Praxis: 3 };

type LanguageMode = "both" | "de" | "en";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FlatBlock {
  block: ConceptBlock;
  concept: Concept;
  /** Globally unique ID for this entry */
  id: string;
}

// ─── FLATTENING ENGINE ───────────────────────────────────────────────────────

function flattenAndSort(concepts: Concept[]): FlatBlock[] {
  const flat: FlatBlock[] = [];

  for (const concept of concepts) {
    if (!concept.blocks) continue;
    for (const block of concept.blocks) {
      flat.push({
        block,
        concept,
        id: `${concept.slug}__${block.level}__${block.title}`,
      });
    }
  }

  // Strict sequential ordering: CEFR level first, then category within level
  return flat.sort((a, b) => {
    const levelDiff = LEVEL_ORDER[a.block.level] - LEVEL_ORDER[b.block.level];
    if (levelDiff !== 0) return levelDiff;
    const catA = CATEGORY_ORDER[a.block.category ?? ""] ?? 99;
    const catB = CATEGORY_ORDER[b.block.category ?? ""] ?? 99;
    if (catA !== catB) return catA - catB;
    // Within same level+category, sort by concept title for determinism
    return a.concept.title.localeCompare(b.concept.title);
  });
}

// ─── MARKDOWN BOLD HELPER ────────────────────────────────────────────────────

function renderMarkdownBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[var(--color-accent)] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── LEVEL DIVIDER ──────────────────────────────────────────────────────────

function LevelDivider({ level }: { level: CEFRLevel }) {
  const labels: Record<CEFRLevel, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Mastery",
  };
  return (
    <div className="flex items-center gap-4 my-10 animate-fade-in">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold text-sm"
        style={{
          borderColor: `var(--color-cefr-${level.toLowerCase()})`,
          color: `var(--color-cefr-${level.toLowerCase()})`,
          backgroundColor: `color-mix(in srgb, var(--color-cefr-${level.toLowerCase()}) 10%, transparent)`,
        }}
      >
        <span className="text-xs uppercase tracking-widest opacity-70">CEFR</span>
        <span className="text-base">{level}</span>
        <span className="opacity-60 font-normal">—</span>
        <span className="font-semibold">{labels[level]}</span>
      </div>
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

// ─── BLOCK CARD ─────────────────────────────────────────────────────────────

function TimelineBlockCard({
  entry,
  showDe,
  showEn,
  cardRef,
}: {
  entry: FlatBlock;
  showDe: boolean;
  showEn: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const { block, concept } = entry;
  const isMasterRef =
    block.title.includes("Master Reference") ||
    block.titleDe?.includes("Gesamtübersicht");

  return (
    <div
      ref={cardRef}
      data-level={block.level}
      data-concept={concept.slug}
      data-block-title={block.title}
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isMasterRef
          ? "ring-1 ring-amber-400/30 bg-gradient-to-br from-amber-950/20 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)] border-amber-400/20"
          : "card-base"
      }`}
    >
      {/* CEFR accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
        style={{ backgroundColor: `var(--color-cefr-${block.level.toLowerCase()})` }}
      />

      <div className="pl-5 pr-5 pt-5 pb-6 sm:pl-6 sm:pr-6 sm:pt-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {isMasterRef && (
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            )}
            <span
              className="px-2 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: `var(--color-cefr-${block.level.toLowerCase()})` }}
            >
              {block.level}
            </span>
            {block.category && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                {block.category}
              </span>
            )}
            <h3
              className={`text-base font-bold ${
                isMasterRef ? "text-amber-300" : "text-[var(--color-text)]"
              }`}
            >
              {!showEn && block.titleDe ? block.titleDe : block.title}
            </h3>
          </div>

          {/* Concept source + graph link */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[var(--color-text-dim)]">
              {concept.title}
            </span>
            <Link
              href={`/graph?focus=${concept.slug}`}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border border-[var(--color-border-subtle)] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-colors"
            >
              <Network className="w-3 h-3" />
              View on Graph
            </Link>
          </div>
        </div>

        {/* Dynamic overview callout */}
        {block.dynamicOverview && (
          <div
            className="mb-4 px-4 py-3 rounded-xl border-l-4 bg-[var(--color-surface)] text-[13px] leading-relaxed text-[var(--color-text-secondary)] italic"
            style={{ borderColor: `var(--color-cefr-${block.level.toLowerCase()})` }}
          >
            {!showEn && block.dynamicOverview.de
              ? block.dynamicOverview.de
              : block.dynamicOverview.en}
          </div>
        )}

        {/* Prose content */}
        {(block.content || block.contentDe) && (
          <div className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-5 whitespace-pre-line">
            {renderMarkdownBold(
              !showEn && block.contentDe ? block.contentDe : block.content ?? ""
            )}
          </div>
        )}

        {/* Grammar Tables */}
        {block.tables?.map((table, i) => (
          <PremiumGrammarTable key={i} table={table} />
        ))}

        {/* Syntax Playgrounds */}
        {block.syntaxPlaygrounds?.map((pg, i) => (
          <InteractiveSyntax
            key={`syntax-${i}`}
            playground={pg}
            showDe={showDe}
            showEn={showEn}
          />
        ))}

        {/* Practice Quizzes */}
        {block.practices?.map((quiz, i) => (
          <InteractivePractice
            key={`quiz-${i}`}
            quiz={quiz}
            showDe={showDe}
            showEn={showEn}
          />
        ))}

        {/* Examples */}
        {block.examples && block.examples.length > 0 && (
          <div className="space-y-3 mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
              {!showEn ? "Beispiele" : "Examples"}
            </h4>
            {block.examples.map((ex, i) => (
              <div
                key={i}
                className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-subtle)]"
              >
                {showDe && (
                  <p className="font-medium text-[14px] text-[var(--color-text)] mb-1.5 leading-loose">
                    {ex.highlight ? (
                      <span>
                        {ex.de
                          .split(new RegExp(`(${ex.highlight.join("|")})`, "gi"))
                          .map((part, j) =>
                            ex.highlight?.some(
                              (h) => h.toLowerCase() === part.toLowerCase()
                            ) ? (
                              <span
                                key={j}
                                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold border border-[var(--color-accent)]/30 shadow-sm"
                              >
                                {part}
                              </span>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                      </span>
                    ) : (
                      ex.de
                    )}
                  </p>
                )}
                {showEn && (
                  <p
                    className={`text-sm text-[var(--color-text-muted)] italic ${
                      showDe ? "" : "text-base not-italic text-[var(--color-text)]"
                    }`}
                  >
                    {ex.en}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STICKY ANCHOR SIDEBAR ──────────────────────────────────────────────────

function AnchorSidebar({
  currentLevel,
  currentConceptTitle,
  currentBlockTitle,
  totalVisible,
  allLevels,
}: {
  currentLevel: CEFRLevel | null;
  currentConceptTitle: string;
  currentBlockTitle: string;
  totalVisible: number;
  allLevels: CEFRLevel[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2 pointer-events-none"
    >
      {/* Main anchor pill */}
      <div
        className="pointer-events-auto cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-[var(--color-border)] rounded-xl px-4 py-3 shadow-elevated max-w-[220px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookMarked className="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
                  Now Reading
                </span>
              </div>
              {currentLevel && (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-1.5"
                  style={{
                    backgroundColor: `var(--color-cefr-${currentLevel.toLowerCase()})`,
                  }}
                >
                  {currentLevel}
                </span>
              )}
              <p className="text-xs font-semibold text-[var(--color-text)] leading-tight mb-0.5">
                {currentConceptTitle}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                {currentBlockTitle}
              </p>
              <div className="mt-3 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-dim)]">
                  {totalVisible} blocks
                </span>
                <div className="flex gap-1">
                  {allLevels.map((lvl) => (
                    <div
                      key={lvl}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: `var(--color-cefr-${lvl.toLowerCase()})`,
                        opacity: lvl === currentLevel ? 1 : 0.25,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass border border-[var(--color-border)] rounded-full p-2.5 shadow-elevated"
              title="Reading position"
            >
              {currentLevel ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: `var(--color-cefr-${currentLevel.toLowerCase()})`,
                  }}
                >
                  {currentLevel}
                </div>
              ) : (
                <BookMarked className="w-4 h-4 text-[var(--color-text-dim)]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Level progress dots */}
      <div className="pointer-events-none flex flex-col gap-1.5 items-center">
        {ALL_LEVELS.map((lvl) => (
          <div
            key={lvl}
            className="w-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: `var(--color-cefr-${lvl.toLowerCase()})`,
              height: lvl === currentLevel ? "12px" : "6px",
              opacity: lvl === currentLevel ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── FILTER BAR ─────────────────────────────────────────────────────────────

function FilterBar({
  activeLevels,
  activeCategories,
  languageMode,
  availableLevels,
  availableCategories,
  onToggleLevel,
  onToggleCategory,
  onSetLanguage,
}: {
  activeLevels: CEFRLevel[];
  activeCategories: BlockCategory[];
  languageMode: LanguageMode;
  availableLevels: Set<CEFRLevel>;
  availableCategories: Set<BlockCategory>;
  onToggleLevel: (lvl: CEFRLevel) => void;
  onToggleCategory: (cat: BlockCategory) => void;
  onSetLanguage: (mode: LanguageMode) => void;
}) {
  return (
    <div className="glass border-b border-[var(--color-border)] sticky top-14 z-30 px-4 sm:px-6 py-3 flex flex-col gap-3">
      {/* Row 1: Level + Category filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {/* Levels */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-dim)] flex-shrink-0">
            Level:
          </span>
          <button
            onClick={() => {
              if (activeLevels.length > 0)
                ALL_LEVELS.forEach(() => {});
              // clear all — handled in parent by resetting to []
              onToggleLevel("A1"); // hack: will be intercepted by parent
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeLevels.length === 0
                ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
            data-all-levels
          >
            All
          </button>
          {ALL_LEVELS.map((lvl) => {
            const isActive = activeLevels.includes(lvl);
            const isAvail = availableLevels.has(lvl);
            return (
              <button
                key={lvl}
                disabled={!isAvail}
                onClick={() => onToggleLevel(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !isAvail
                    ? "opacity-25 cursor-not-allowed bg-[var(--color-surface)] text-[var(--color-text-dim)]"
                    : isActive
                    ? "text-white shadow-sm cursor-pointer"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] cursor-pointer"
                }`}
                style={
                  isActive && isAvail
                    ? { backgroundColor: `var(--color-cefr-${lvl.toLowerCase()})` }
                    : undefined
                }
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block w-px h-5 bg-[var(--color-border)]" />

        {/* Categories */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-dim)] flex-shrink-0">
            Type:
          </span>
          <button
            onClick={() => {
              // parent handles via data attr
            }}
            data-all-categories
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCategories.length === 0
                ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategories.includes(cat);
            const isAvail = availableCategories.has(cat);
            return (
              <button
                key={cat}
                disabled={!isAvail}
                onClick={() => onToggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  !isAvail
                    ? "opacity-25 cursor-not-allowed bg-[var(--color-surface)] text-[var(--color-text-dim)]"
                    : isActive
                    ? "bg-[var(--color-accent)] text-white shadow-sm cursor-pointer"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] cursor-pointer"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Language mode */}
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-[var(--color-text-dim)] flex-shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-dim)] flex-shrink-0">
          Language:
        </span>
        {(
          [
            { key: "both", label: "Both" },
            { key: "de", label: "Deutsch Only" },
            { key: "en", label: "English Only" },
          ] as { key: LanguageMode; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSetLanguage(key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              languageMode === key
                ? "bg-[var(--color-theme)] text-white shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const [activeLevels, setActiveLevels] = useState<CEFRLevel[]>([]);
  const [activeCategories, setActiveCategories] = useState<BlockCategory[]>([]);
  const [languageMode, setLanguageMode] = useState<LanguageMode>("both");
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel | null>(null);
  const [currentConceptTitle, setCurrentConceptTitle] = useState("—");
  const [currentBlockTitle, setCurrentBlockTitle] = useState("—");

  const showDe = languageMode !== "en";
  const showEn = languageMode !== "de";

  // Intersection observer refs map: id → DOM element
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load all concepts and flatten
  const allFlat = useMemo(() => {
    const concepts = getAllConcepts();
    return flattenAndSort(concepts);
  }, []);

  // Derived available sets
  const availableLevels = useMemo(
    () => new Set(allFlat.map((e) => e.block.level)),
    [allFlat]
  );
  const availableCategories = useMemo(
    () =>
      new Set(
        allFlat
          .map((e) => e.block.category)
          .filter(Boolean) as BlockCategory[]
      ),
    [allFlat]
  );

  // Filtered entries
  const visibleEntries = useMemo(() => {
    return allFlat.filter((entry) => {
      const lvlMatch =
        activeLevels.length === 0 || activeLevels.includes(entry.block.level);
      const catMatch =
        activeCategories.length === 0 ||
        (entry.block.category && activeCategories.includes(entry.block.category));
      return lvlMatch && catMatch;
    });
  }, [allFlat, activeLevels, activeCategories]);

  // Level dividers — detect when level changes between entries
  const levelsInView = useMemo(
    () => [...new Set(visibleEntries.map((e) => e.block.level))],
    [visibleEntries]
  );

  // Toggle handlers
  const toggleLevel = useCallback(
    (lvl: CEFRLevel) => {
      setActiveLevels((prev) =>
        prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
      );
    },
    []
  );

  const clearLevels = useCallback(() => setActiveLevels([]), []);

  const toggleCategory = useCallback((cat: BlockCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const clearCategories = useCallback(() => setActiveCategories([]), []);

  // Intersection Observer for reading-position anchor
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first entry in viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const el = visible[0].target as HTMLElement;
          const lvl = el.dataset.level as CEFRLevel;
          const concept = el.dataset.concept ?? "";
          const blockTitle = el.dataset.blockTitle ?? "";
          if (lvl) setCurrentLevel(lvl);
          if (concept) {
            const found = allFlat.find((e) => e.concept.slug === concept);
            if (found) setCurrentConceptTitle(found.concept.title);
          }
          if (blockTitle) setCurrentBlockTitle(blockTitle);
        }
      },
      { threshold: 0.2, rootMargin: "-10% 0px -60% 0px" }
    );

    const obs = observerRef.current;
    cardRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [visibleEntries, allFlat]);

  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(id, el);
        observerRef.current?.observe(el);
      } else {
        cardRefs.current.delete(id);
      }
    },
    []
  );

  // Scroll to top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Build render list: inject level dividers
  const renderList = useMemo(() => {
    type RenderItem =
      | { type: "divider"; level: CEFRLevel; key: string }
      | { type: "block"; entry: FlatBlock; key: string };

    const items: RenderItem[] = [];
    let lastLevel: CEFRLevel | null = null;

    for (const entry of visibleEntries) {
      if (entry.block.level !== lastLevel) {
        items.push({
          type: "divider",
          level: entry.block.level,
          key: `divider-${entry.block.level}`,
        });
        lastLevel = entry.block.level;
      }
      items.push({ type: "block", entry, key: entry.id });
    }

    return items;
  }, [visibleEntries]);

  return (
    <>
      {/* ── Page meta title (SEO) ── */}
      <title>Timeline — GermanHub</title>

      {/* ── Filter Bar (sticky) ── */}
      <FilterBar
        activeLevels={activeLevels}
        activeCategories={activeCategories}
        languageMode={languageMode}
        availableLevels={availableLevels}
        availableCategories={availableCategories}
        onToggleLevel={(lvl) => {
          // The "All" button in FilterBar uses data-all-levels hack — handle normally
          toggleLevel(lvl);
        }}
        onToggleCategory={toggleCategory}
        onSetLanguage={setLanguageMode}
      />

      {/* ── Main Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-32">
        {/* Hero header */}
        <div className="pt-10 pb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Timeline
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                The entire German language as one continuous book
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-4 text-xs text-[var(--color-text-dim)]">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>
                <strong className="text-[var(--color-text-secondary)]">
                  {visibleEntries.length}
                </strong>{" "}
                blocks
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" />
              <span>
                <strong className="text-[var(--color-text-secondary)]">
                  {levelsInView.length}
                </strong>{" "}
                CEFR levels
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>
                <strong className="text-[var(--color-text-secondary)]">
                  {new Set(visibleEntries.map((e) => e.concept.slug)).size}
                </strong>{" "}
                concepts
              </span>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {renderList.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-[var(--color-text-muted)]"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No blocks match your filters.</p>
                <p className="text-sm mt-1">Try selecting different levels or categories.</p>
              </motion.div>
            ) : (
              renderList.map((item) =>
                item.type === "divider" ? (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <LevelDivider level={item.level} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    layout
                  >
                    <TimelineBlockCard
                      entry={item.entry}
                      showDe={showDe}
                      showEn={showEn}
                      cardRef={setCardRef(item.entry.id)}
                    />
                  </motion.div>
                )
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky Anchor Sidebar ── */}
      <AnchorSidebar
        currentLevel={currentLevel}
        currentConceptTitle={currentConceptTitle}
        currentBlockTitle={currentBlockTitle}
        totalVisible={visibleEntries.length}
        allLevels={levelsInView}
      />

      {/* ── Scroll to Top ── */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-4 z-40 glass border border-[var(--color-border)] p-2.5 rounded-full shadow-elevated hover:border-[var(--color-accent)]/40 transition-colors"
        title="Back to top"
      >
        <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
      </button>

      {/* ── Filter "All" click handlers via parent ── */}
      {/* Note: FilterBar "All" buttons use data attrs — we wire them below with native event delegation */}
      <FilterAllWirer
        onClearLevels={clearLevels}
        onClearCategories={clearCategories}
      />
    </>
  );
}

/** Tiny helper that wires the data-attr "All" buttons in the FilterBar to the parent clear handlers */
function FilterAllWirer({
  onClearLevels,
  onClearCategories,
}: {
  onClearLevels: () => void;
  onClearCategories: () => void;
}) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("button");
      if (!btn) return;
      if (btn.dataset.allLevels !== undefined) onClearLevels();
      if (btn.dataset.allCategories !== undefined) onClearCategories();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [onClearLevels, onClearCategories]);

  return null;
}
