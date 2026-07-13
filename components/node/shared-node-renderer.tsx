import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContinueExploring } from "@/components/layout/continue-exploring";
import { UnifiedConceptView } from "@/components/graph/unified-concept-view";
import { WordRenderer } from "./word-renderer";
import { ThemeRenderer } from "./theme-renderer";
import { GenericNodeRenderer } from "./generic-node-renderer";
import { RecentExplorationTracker } from "./recent-exploration-tracker";
import type { NodePageModel } from "@/lib/resolver";
import type { NodeType, Word, Theme } from "@/types";
import { getNodeHref } from "@/lib/routes";

function getTypeLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    concept: "Concept", word: "Word", theme: "Theme", grammar: "Grammar",
    level: "Level", skill: "Skill", mistake: "Mistakes",
  };
  return labels[type] || type;
}

export function SharedNodeRenderer({ model }: { model: NodePageModel }) {
  const { node, relatedNodes, referencedBy } = model;
  const { type, slug, title } = node;
  const isConceptPage = type === "concept";

  const allRelated = [
    ...relatedNodes,
    ...referencedBy.filter(
      (rb) => !relatedNodes.some((ri) => ri.slug === rb.slug && ri.type === rb.type)
    ),
  ].filter((item) => item.type !== "level" && item.slug !== slug);

  return (
    <div className="w-full pb-12 animate-fade-in">
      <RecentExplorationTracker slug={slug} type={type} title={title} />

        <div className={`max-w-4xl mx-auto px-6 ${isConceptPage ? "pt-5 pb-2 sm:pt-6" : "pt-12 pb-8"}`}>
          <Breadcrumbs
            compact={isConceptPage}
            items={[
              { label: "Home", href: "/" },
              { label: getTypeLabel(type) },
              { label: title },
            ]}
          />
        </div>

      <div className="w-full">
        {type === "concept" && node.status !== "stub" && <UnifiedConceptView slug={slug} mode="page" />}
        {type === "word" && node.status !== "stub" && <WordRenderer node={node as Word} />}
        {type === "theme" && node.status !== "stub" && <ThemeRenderer node={node as Theme} />}
        {(node.status === "stub" || !["concept", "word", "theme"].includes(type)) && <GenericNodeRenderer node={node} />}
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        {referencedBy.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Referenced By
            </h2>
            <div className="flex flex-wrap gap-2">
              {referencedBy.map((item) => {
                const itemColor = "var(--color-" + item.type + ")";
                return (
                  <a
                    key={`${item.type}-${item.slug}`}
                    href={getNodeHref(item.slug, item.type)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-accent-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent-muted)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
                  >
                    <span className="node-dot" style={{ backgroundColor: itemColor }} />
                    {item.title}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <ContinueExploring items={allRelated} />
      </div>
    </div>
  );
}
