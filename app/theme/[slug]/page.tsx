"use client";

import { useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContinueExploring } from "@/components/layout/continue-exploring";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import themesData from "@/data/themes.json";
import graphData from "@/data/graph.json";
import type { Theme, NodeType } from "@/types";

function getTheme(slug: string): Theme | undefined {
  return themesData.find((t) => t.slug === slug) as Theme | undefined;
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

/** Highlight specific words in a line */
function highlightLine(text: string, highlights: string[] = []) {
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

export default function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const theme = getTheme(slug);
  const { addExploration } = useRecentExplorations();

  useEffect(() => {
    if (theme) {
      addExploration({ slug: theme.slug, type: "theme", title: theme.title });
    }
  }, [theme?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!theme) return notFound();

  // For stub themes with no conversations, show a coming-soon style
  const isStub = theme.status === "stub" || theme.conversations.length === 0;

  const relatedItems = (theme.related || []).map((r) => {
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
          { label: "Themes" },
          { label: theme.title },
        ]}
      />

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="node-dot node-dot-theme" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            Theme
          </span>
          {theme.levels?.map((level) => (
            <span key={level} className={`cefr-badge cefr-${level.toLowerCase()}`}>{level}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-1">
          <MapPin className="w-6 h-6 text-[var(--color-theme)]" />
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
            {theme.title}
          </h1>
        </div>
        {theme.titleDe && (
          <p className="text-lg text-[var(--color-text-muted)] italic ml-9">{theme.titleDe}</p>
        )}
      </header>

      {/* Description */}
      <section className="mb-12">
        <div className="card-base p-6 sm:p-8">
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {theme.description}
          </p>
        </div>
      </section>

      {/* Words in this theme */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          Words Used in {theme.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          {theme.words.map((wordSlug) => (
            <Link
              key={wordSlug}
              href={`/word/${wordSlug}`}
              className="px-4 py-2 rounded-lg font-mono text-sm bg-[var(--color-accent-glow)] border border-[var(--color-accent-muted)] text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] transition-all"
            >
              {wordSlug}
            </Link>
          ))}
        </div>
      </section>

      {/* Stub notice */}
      {isStub && (
        <section className="mb-12">
          <div className="card-base p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-theme)]/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-[var(--color-theme)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Conversations Coming Soon
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              We&apos;re building real-world conversations for the {theme.title} theme.
              Check back soon or explore the words used in this context.
            </p>
          </div>
        </section>
      )}

      {/* Conversations */}
      {!isStub && theme.conversations.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-4 h-4 text-[var(--color-theme)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Conversations</h2>
          </div>
          <div className="space-y-8 stagger-children">
            {theme.conversations.map((conv, ci) => (
              <div key={ci} className="card-base overflow-hidden">
                {/* Conversation header */}
                <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-hover)]">
                  <h3 className="font-semibold text-[var(--color-text)]">{conv.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{conv.context}</p>
                </div>
                {/* Dialog */}
                <div className="p-6 space-y-4">
                  {conv.lines.map((line, li) => (
                    <div key={li} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                          {line.speaker.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-[var(--color-text-dim)] block mb-1">
                          {line.speaker}
                        </span>
                        <p className="text-[15px] text-[var(--color-text)]">
                          {highlightLine(line.de, line.highlight)}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)] italic mt-0.5">
                          {line.en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {(theme.related || []).length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Related</h2>
          <div className="flex flex-wrap gap-2">
            {(theme.related || []).map((r) => {
              const node = graphData.nodes.find((n) => n.slug === r.slug);
              return (
                <Link
                  key={`${r.type}-${r.slug}`}
                  href={getNodeHref(r.slug, r.type as NodeType)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-accent-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
                >
                  <span className="node-dot" style={{ backgroundColor: getNodeColor(r.type as NodeType) }} />
                  {node?.title || r.slug}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Continue Exploring */}
      <ContinueExploring items={relatedItems} />
    </div>
  );
}
