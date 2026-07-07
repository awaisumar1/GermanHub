"use client";

import { useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { Volume2, ArrowRight, BookOpen, Lightbulb, Layers, AlertTriangle, CheckCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContinueExploring } from "@/components/layout/continue-exploring";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import wordsData from "@/data/words.json";
import graphData from "@/data/graph.json";
import conceptsData from "@/data/concepts.json";
import type { Word, NodeType, Mistake, Concept } from "@/types";

function getWord(slug: string): Word | undefined {
  return wordsData.find((w) => w.slug === slug) as Word | undefined;
}

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

/** Highlight specific words in a German sentence */
function highlightSentence(text: string, highlights: string[] = []) {
  if (highlights.length === 0) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    let earliestIndex = remaining.length;
    let matchedHighlight = "";

    for (const h of highlights) {
      const idx = remaining.toLowerCase().indexOf(h.toLowerCase());
      if (idx !== -1 && idx < earliestIndex) {
        earliestIndex = idx;
        matchedHighlight = h;
      }
    }

    if (matchedHighlight && earliestIndex < remaining.length) {
      if (earliestIndex > 0) {
        parts.push(<span key={keyIndex++}>{remaining.slice(0, earliestIndex)}</span>);
      }
      parts.push(
        <span key={keyIndex++} className="highlight-word">
          {remaining.slice(earliestIndex, earliestIndex + matchedHighlight.length)}
        </span>
      );
      remaining = remaining.slice(earliestIndex + matchedHighlight.length);
    } else {
      parts.push(<span key={keyIndex++}>{remaining}</span>);
      break;
    }
  }

  return <>{parts}</>;
}

export default function WordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const word = getWord(slug);
  const { addExploration } = useRecentExplorations();

  useEffect(() => {
    if (word) {
      addExploration({ slug: word.slug, type: "word", title: word.word });
    }
  }, [word?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!word) return notFound();

  // Gather related items for ContinueExploring
  const relatedItems = (word.related || []).map((r) => {
    const node = graphData.nodes.find((n) => n.slug === r.slug && n.type === r.type);
    return {
      slug: r.slug,
      type: r.type as NodeType,
      title: node?.title || r.slug,
      summary: node?.summary,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Expressing Reasons", href: "/concept/expressing-reasons" },
          { label: word.word },
        ]}
      />

      {/* Word Header */}
      <header className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="node-dot node-dot-word" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            Word
          </span>
          <span className={`cefr-badge cefr-${word.level.toLowerCase()}`}>{word.level}</span>
          <span className="text-xs text-[var(--color-text-dim)] px-2 py-0.5 rounded bg-[var(--color-surface)]">
            {word.partOfSpeech}
          </span>
        </div>

        <div className="flex items-end gap-4 mb-2">
          <h1 className="text-5xl sm:text-6xl font-bold font-mono text-[var(--color-word)]">
            {word.word}
          </h1>
          <button
            aria-label="Listen to pronunciation"
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors mb-2 cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <p className="text-xl text-[var(--color-text-secondary)] mb-1">{word.meaning}</p>
        <p className="text-sm text-[var(--color-text-muted)] font-mono">{word.pronunciation}</p>
      </header>

      {/* Sentence Structure */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Sentence Structure</h2>
        </div>
        <div className="card-base p-6 sm:p-8">
          <p className="text-sm font-mono text-[var(--color-accent)] mb-6">
            {word.sentenceStructure.pattern}
          </p>

          {/* Structure visualization */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {word.sentenceStructure.parts.map((part, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`px-3 py-2 rounded-lg text-sm font-mono border ${
                    part.highlight
                      ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {part.content}
                </span>
                <span className="text-[10px] text-[var(--color-text-dim)] max-w-[80px] text-center leading-tight">
                  {part.label}
                </span>
              </div>
            ))}
          </div>

          {word.sentenceStructure.notes && (
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-border-subtle)] pt-4">
              {word.sentenceStructure.notes}
            </p>
          )}
        </div>
      </section>

      {/* Examples */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Examples</h2>
        </div>
        <div className="space-y-3 stagger-children">
          {word.examples.map((example, i) => (
            <div key={i} className="card-base p-5">
              <div className="flex items-start gap-3">
                <span className="text-sm font-mono text-[var(--color-text-dim)] mt-0.5 flex-shrink-0">
                  {i + 1}.
                </span>
                <div className="space-y-1.5">
                  <p className="text-[15px] font-medium text-[var(--color-text)]">
                    {highlightSentence(example.de, example.highlight)}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] italic">
                    {example.en}
                  </p>
                  {example.context && (
                    <span className="inline-block text-[10px] uppercase tracking-wider text-[var(--color-text-dim)] bg-[var(--color-surface)] px-2 py-0.5 rounded mt-1">
                      {example.context}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Tips */}
      {word.usageTips && word.usageTips.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-[var(--color-theme)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Usage Tips</h2>
          </div>
          <div className="card-base p-6">
            <ul className="space-y-3">
              {word.usageTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-theme)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[var(--color-theme)] text-xs font-bold">{i + 1}</span>
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Common Mistakes (Inherited from Concepts) */}
      {(() => {
        const relatedConcepts = (word.related || [])
          .filter((r) => r.type === "concept" && r.relation === "belongs-to")
          .map((r) => conceptsData.find((c) => c.slug === r.slug))
          .filter(Boolean) as Concept[];
        
        // Find common mistakes from these concepts
        const allMistakes: Mistake[] = [];
        relatedConcepts.forEach((c) => {
          if (c.commonMistakes) {
            allMistakes.push(...c.commonMistakes);
          }
        });
        
        if (allMistakes.length === 0) return null;

        return (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-4 h-4 text-[var(--color-mistake)]" />
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Common Mistakes</h2>
            </div>
            <div className="space-y-4 stagger-children">
              {allMistakes.map((mistake, i) => (
                <div key={i} className="card-base p-6 border-l-4 border-l-[var(--color-mistake)]">
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
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Compare With — other words */}
      {(word.related || []).filter((r) => r.type === "word").length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Compare With</h2>
          <div className="flex flex-wrap gap-3">
            {(word.related || [])
              .filter((r) => r.type === "word")
              .map((r) => {
                const w = getWord(r.slug);
                return (
                  <Link
                    key={r.slug}
                    href={`/word/${r.slug}`}
                    className="card-base card-interactive p-4 flex items-center gap-3 group"
                  >
                    <span className="text-lg font-mono font-bold text-[var(--color-word)] group-hover:text-[var(--color-accent)] transition-colors">
                      {w?.word || r.slug}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {w?.meaning || ""}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Related */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Related</h2>
        <div className="flex flex-wrap gap-2">
          {(word.related || [])
            .filter((r) => r.type !== "word")
            .map((r) => {
              const node = graphData.nodes.find((n) => n.slug === r.slug);
              return (
                <Link
                  key={`${r.type}-${r.slug}`}
                  href={getNodeHref(r.slug, r.type as NodeType)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-accent-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
                >
                  <span className="node-dot" style={{ backgroundColor: getNodeColor(r.type as NodeType) }} />
                  {node?.title || r.slug}
                </Link>
              );
            })}
        </div>
      </section>

      {/* Continue Exploring */}
      <ContinueExploring items={relatedItems} />
    </div>
  );
}
