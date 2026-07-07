"use client";

import { useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { Construction, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContinueExploring } from "@/components/layout/continue-exploring";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import graphData from "@/data/graph.json";
import type { NodeType } from "@/types";

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
    concept: "Concept", word: "Word", theme: "Theme", grammar: "Grammar",
    level: "Level", skill: "Skill", mistake: "Mistakes",
  };
  return labels[type];
}

function getNodeHref(slug: string, type: NodeType): string {
  switch (type) {
    case "concept": return `/concept/${slug}`;
    case "word": return `/word/${slug}`;
    case "theme": return `/theme/${slug}`;
    default: return `/node/${type}/${slug}`;
  }
}

export default function NodePage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = use(params);
  const nodeType = type as NodeType;
  const node = graphData.nodes.find((n) => n.slug === slug && n.type === nodeType);
  const { addExploration } = useRecentExplorations();

  useEffect(() => {
    if (node) {
      addExploration({ slug: node.slug, type: nodeType, title: node.title });
    }
  }, [node?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return notFound();

  // Find related items
  const relatedItems = (node.related || []).map((r) => {
    const related = graphData.nodes.find((n) => n.slug === r.slug && n.type === r.type);
    return {
      slug: r.slug,
      type: r.type as NodeType,
      title: related?.title || r.slug,
      summary: related?.summary,
    };
  });

  // Also find nodes that reference this node
  const referencedBy = graphData.nodes
    .filter((n) =>
      (n.related || []).some((r) => r.slug === slug && r.type === nodeType)
    )
    .map((n) => ({
      slug: n.slug,
      type: n.type as NodeType,
      title: n.title,
      summary: n.summary,
    }));

  const allRelated = [
    ...relatedItems,
    ...referencedBy.filter(
      (rb) => !relatedItems.some((ri) => ri.slug === rb.slug && ri.type === rb.type)
    ),
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: getTypeLabel(nodeType) },
          { label: node.title },
        ]}
      />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="node-dot"
            style={{ backgroundColor: getNodeColor(nodeType) }}
          />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            {getTypeLabel(nodeType)}
          </span>
          {node.levels?.map((level) => (
            <span key={level} className={`cefr-badge cefr-${level.toLowerCase()}`}>
              {level}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-1">
          {node.title}
        </h1>
        {node.titleDe && (
          <p className="text-lg text-[var(--color-text-muted)] italic">{node.titleDe}</p>
        )}
      </header>

      {/* Summary */}
      <section className="mb-10">
        <div className="card-base p-6 sm:p-8">
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {node.summary}
          </p>
        </div>
      </section>

      {/* Coming Soon notice */}
      <section className="mb-14">
        <div className="card-base p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mx-auto mb-5">
            <Construction className="w-7 h-7 text-[var(--color-accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            Full Content Coming Soon
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto mb-6">
            This node is part of the GermanHub knowledge graph. Full interactive content
            is being developed. In the meantime, explore the connections below.
          </p>
          <Link
            href="/graph"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors"
          >
            View in Graph
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Referenced by */}
      {referencedBy.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
            Referenced By
          </h2>
          <div className="flex flex-wrap gap-2">
            {referencedBy.map((item) => (
              <Link
                key={`${item.type}-${item.slug}`}
                href={getNodeHref(item.slug, item.type)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-accent-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
              >
                <span className="node-dot" style={{ backgroundColor: getNodeColor(item.type) }} />
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Continue Exploring */}
      <ContinueExploring items={allRelated} />
    </div>
  );
}
