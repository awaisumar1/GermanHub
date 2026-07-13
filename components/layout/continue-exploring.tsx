import Link from "next/link";
import type { NodeType } from "@/types";
import { ArrowRight, Sparkles } from "lucide-react";

interface ExplorationItem {
  slug: string;
  type: NodeType;
  title: string;
  summary?: string;
}

interface ContinueExploringProps {
  items: ExplorationItem[];
  title?: string;
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

export function ContinueExploring({ items, title = "Continue Exploring" }: ContinueExploringProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
        <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={getNodeHref(item.slug, item.type)}
            className="card-base card-interactive p-5 group flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="node-dot"
                style={{ backgroundColor: getNodeColor(item.type) }}
              />
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
                {getTypeLabel(item.type)}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
              {item.title}
            </h3>
            {item.summary && (
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                {item.summary}
              </p>
            )}
            <div className="flex items-center gap-1 mt-auto text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
