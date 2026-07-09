"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { X, BookOpen, Layers, AlertTriangle, ArrowRight, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getConcept } from "@/lib/data";
import { PremiumGrammarTable } from "@/components/ui/premium-grammar-table";
import { InteractiveSyntax } from "@/components/ui/interactive-syntax";
import { InteractivePractice } from "@/components/ui/interactive-practice";
import type { CEFRLevel, ConceptBlock, BlockCategory } from "@/types";

interface UnifiedConceptViewProps {
  slug: string;
  mode?: "drawer" | "page";
  onClose?: () => void;
}

const ALL_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const ALL_CATEGORIES: BlockCategory[] = ["Wortschatz", "Grammatik", "Sätze", "Praxis"];
const LEVEL_ORDER: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

type LanguageMode = "both" | "de" | "en";

export function UnifiedConceptView({
  slug,
  mode = "drawer",
  onClose,
}: UnifiedConceptViewProps) {
  const [activeLevels, setActiveLevels] = useState<CEFRLevel[]>([]);
  const [activeCategories, setActiveCategories] = useState<BlockCategory[]>([]);
  const [languageMode, setLanguageMode] = useState<LanguageMode>("both");
  
  const concept = getConcept(slug);

  if (!concept) {
    return (
      <div className="p-8 text-[var(--color-text-muted)]">
        Concept not found.
      </div>
    );
  }

  // Determine which levels and categories exist in the current concept
  const availableLevels = new Set(concept.blocks?.map((b) => b.level) || []);
  if (concept.levels) {
    concept.levels.forEach((l) => availableLevels.add(l));
  }
  if (concept.commonMistakes) {
    concept.commonMistakes.forEach((m) => {
      if (m.level) availableLevels.add(m.level as CEFRLevel);
    });
  }

  const availableCategories = new Set(
    concept.blocks?.map((b) => b.category).filter(Boolean) as BlockCategory[]
  );

  // Toggle Handlers
  const toggleLevel = (lvl: CEFRLevel) => {
    setActiveLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleCategory = (cat: BlockCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // ─── STRICT SEQUENTIAL ORDERING INVARIANT ───
  // Sort blocks by CEFR difficulty: A1 → A2 → B1 → B2 → C1 → C2
  const sortedBlocks = useMemo(() => {
    if (!concept.blocks) return [];
    return [...concept.blocks].sort(
      (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
    );
  }, [concept.blocks]);

  // ─── DYNAMIC OVERVIEW ───
  // If exactly one level is selected and the concept has a levelOverview for it, use that.
  // Otherwise fall back to the universal overview.
  const activeOverview = useMemo(() => {
    if (
      activeLevels.length === 1 &&
      concept.levelOverviews &&
      concept.levelOverviews[activeLevels[0]]
    ) {
      return concept.levelOverviews[activeLevels[0]]!;
    }
    return concept.overview;
  }, [activeLevels, concept.overview, concept.levelOverviews]);

  // Helper: Render markdown-bold text
  const renderMarkdownBold = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-[var(--color-accent)] font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });

  // Language Mode helpers
  const showDe = languageMode === "both" || languageMode === "de";
  const showEn = languageMode === "both" || languageMode === "en";

  const content = (
    <div className={`flex flex-col ${mode === "drawer" ? "h-full" : "min-h-[calc(100vh-56px)]"} w-full bg-[var(--color-bg)]`}>
      {/* Header & Filter */}
      <div className={`${mode === "drawer" ? "sticky top-0 z-40 bg-[var(--color-bg)]/90 backdrop-blur-md" : "bg-[var(--color-bg)]"} border-b border-[var(--color-border)] px-6 py-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="node-dot node-dot-concept" />
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
              Unified Concept
            </span>
          </div>
          {mode === "drawer" && onClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-1">
          {concept.title}
        </h1>
        {concept.titleDe && (
          <p className="text-lg text-[var(--color-text-muted)] italic mb-6">
            {concept.titleDe}
          </p>
        )}

        {/* Multi-Select Filter Container - Inlined for better UX */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Levels & Categories */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
            {/* Level Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)] flex-shrink-0">
                Levels:
              </span>
              <button
                onClick={() => setActiveLevels([])}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 cursor-pointer ${
                  activeLevels.length === 0
                    ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                All
              </button>
              {ALL_LEVELS.map((lvl) => {
                const isActive = activeLevels.includes(lvl);
                const isAvailable = availableLevels.has(lvl);
                return (
                  <button
                    key={lvl}
                    disabled={!isAvailable}
                    onClick={() => toggleLevel(lvl)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all flex-shrink-0 ${
                      !isAvailable
                        ? "opacity-30 cursor-not-allowed bg-[var(--color-surface)] text-[var(--color-text-dim)]"
                        : isActive
                        ? `text-white shadow-md`
                        : `bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] cursor-pointer`
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: `var(--color-cefr-${lvl.toLowerCase()})` }
                        : {}
                    }
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)] flex-shrink-0">
                Category:
              </span>
              <button
                onClick={() => setActiveCategories([])}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 cursor-pointer ${
                  activeCategories.length === 0
                    ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                All
              </button>
              {ALL_CATEGORIES.map((cat) => {
                const isActive = activeCategories.includes(cat);
                const isAvailable = availableCategories.has(cat);
                return (
                  <button
                    key={cat}
                    disabled={!isAvailable}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
                      !isAvailable
                        ? "opacity-30 cursor-not-allowed bg-[var(--color-surface)] text-[var(--color-text-dim)] pointer-events-none"
                        : isActive
                        ? `bg-[var(--color-accent)] text-white shadow-md`
                        : `bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] cursor-pointer`
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Language / Immersion Mode */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Globe className="w-3.5 h-3.5 text-[var(--color-text-dim)] flex-shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)] flex-shrink-0">
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
                onClick={() => setLanguageMode(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
                  languageMode === key
                    ? "bg-[var(--color-theme)] text-white shadow-md"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className={`${mode === "drawer" ? "flex-1 overflow-y-auto" : "flex-1"} px-6 py-8`}>
        {/* Dynamic Overview */}
        {(activeCategories.length === 0 || activeCategories.includes("Wortschatz") || activeCategories.includes("Praxis")) && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Overview</h2>
              {activeLevels.length === 1 && concept.levelOverviews?.[activeLevels[0]] && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: `var(--color-cefr-${activeLevels[0].toLowerCase()})` }}>
                  {activeLevels[0]} Focus
                </span>
              )}
            </div>
            <div className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line text-[15px]">
              {renderMarkdownBold(activeOverview)}
            </div>
          </div>
        )}

        {/* Hierarchical Blocks — Strictly ordered A1 → C2 */}
        {sortedBlocks.length > 0 && (
          <div className="space-y-8 mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[var(--color-concept)]" />
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Mastery Progression
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {sortedBlocks.map((block: ConceptBlock) => {
                // Multi-Select Intersection Engine
                const isLevelMatch = activeLevels.length === 0 || activeLevels.includes(block.level);
                const isCategoryMatch = activeCategories.length === 0 || (block.category && activeCategories.includes(block.category));
                
                if (!isLevelMatch || !isCategoryMatch) return null;

                return (
                  <motion.div
                    key={block.level + block.title}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="card-base p-6 sm:p-8 relative overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{
                        backgroundColor: `var(--color-cefr-${block.level.toLowerCase()})`,
                      }}
                    />

                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold text-white"
                        style={{
                          backgroundColor: `var(--color-cefr-${block.level.toLowerCase()})`,
                        }}
                      >
                        {block.level}
                      </span>
                      {block.category && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                          {block.category}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-[var(--color-text)]">
                        {block.title}
                      </h3>
                    </div>

                    <div className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed mb-6 whitespace-pre-line">
                      {renderMarkdownBold(block.content)}
                    </div>

                    {/* Grammar Tables */}
                    {block.tables && block.tables.map((table, i) => (
                      <PremiumGrammarTable key={i} table={table} />
                    ))}

                    {/* Syntax Playgrounds */}
                    {block.syntaxPlaygrounds && block.syntaxPlaygrounds.map((pg, i) => (
                      <InteractiveSyntax key={`syntax-${i}`} playground={pg} />
                    ))}

                    {/* Practice Quizzes */}
                    {block.practices && block.practices.map((quiz, i) => (
                      <InteractivePractice key={`quiz-${i}`} quiz={quiz} />
                    ))}

                    {/* Bilingual Examples with Language Mode */}
                    {block.examples && block.examples.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
                          Examples
                        </h4>
                        {block.examples.map((ex, i) => (
                          <div
                            key={i}
                            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-subtle)]"
                          >
                            {showDe && (
                              <p className="font-medium text-[15px] text-[var(--color-text)] mb-2 leading-loose">
                                {ex.highlight ? (
                                  <span>
                                    {ex.de.split(new RegExp(`(${ex.highlight.join('|')})`, 'gi')).map((part, j) => 
                                      ex.highlight?.some(h => h.toLowerCase() === part.toLowerCase()) ? 
                                        <span key={j} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold border border-[var(--color-accent)]/30 shadow-sm">{part}</span> : 
                                        <span key={j}>{part}</span>
                                    )}
                                  </span>
                                ) : (
                                  ex.de
                                )}
                              </p>
                            )}
                            {showEn && (
                              <p className={`text-sm text-[var(--color-text-muted)] italic ${showDe ? '' : 'text-base not-italic text-[var(--color-text)]'}`}>
                                {ex.en}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Existing Words linkage */}
        {activeCategories.length === 0 || activeCategories.includes("Wortschatz") ? (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Words in this Concept
            </h2>
            <div className="flex flex-wrap gap-2">
              {concept.words.map((wSlug) => (
                <Link
                  key={wSlug}
                  href={`/word/${wSlug}`}
                  className="px-4 py-2 rounded-lg font-mono text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-word)] hover:border-[var(--color-word)] transition-all"
                >
                  {wSlug}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Common Mistakes */}
        {concept.commonMistakes && concept.commonMistakes.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-4 h-4 text-[var(--color-mistake)]" />
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Common Mistakes
              </h2>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {concept.commonMistakes.map((mistake, i) => {
                  const isLevelMatch = activeLevels.length === 0 || (mistake.level && activeLevels.includes(mistake.level as CEFRLevel));
                  const isCategoryMatch = activeCategories.length === 0 || activeCategories.includes("Praxis");
                  
                  if (!isLevelMatch || !isCategoryMatch) return null;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="card-base p-6 border-l-4 border-l-[var(--color-mistake)]"
                    >
                      {mistake.level && (
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`cefr-badge cefr-${mistake.level.toLowerCase()}`}>
                            {mistake.level}
                          </span>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2">
                            Incorrect
                          </p>
                          <p className="text-[var(--color-text)]">{mistake.incorrect}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                          <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-2">
                            Correct
                          </p>
                          <p className="text-[var(--color-text)]">{mistake.correct}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {mistake.explanation}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        )}

      </div>
    </div>
  );

  if (mode === "page") {
    return (
      <div className="w-full h-full animate-fade-in border-x border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
        {content}
      </div>
    );
  }

  // Drawer Mode
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.5)" }}
        exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] md:w-[600px] lg:w-[700px] bg-[var(--color-bg)] z-50 border-l border-[var(--color-border)] shadow-2xl"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
