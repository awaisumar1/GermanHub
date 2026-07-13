import Link from "next/link";
import { Construction, ArrowRight, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import type { GraphNode, NodeType } from "@/types";

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

export function GenericNodeRenderer({ node }: { node: GraphNode }) {
  const isStub = node.status === "stub" || !("content" in node);

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="node-dot"
            style={{ backgroundColor: getNodeColor(node.type) }}
          />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            {getTypeLabel(node.type)}
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

      {/* Deep Content */}
      {!isStub && node.content && Array.isArray(node.content) && (
        <div className="space-y-12 mb-14">
          {/* We assume the new JSON files will provide an array of content blocks */}
          {node.content.map((block, i) => (
            <section key={i}>
              {block.title && (
                <div className="flex items-center gap-2 mb-4">
                  {node.type === "grammar" && <Layers className="w-5 h-5 text-[var(--color-grammar)]" />}
                  {node.type === "skill" && <CheckCircle className="w-5 h-5 text-[var(--color-skill)]" />}
                  {node.type === "mistake" && <AlertTriangle className="w-5 h-5 text-[var(--color-mistake)]" />}
                  <h2 className="text-2xl font-semibold text-[var(--color-text)]">{block.title}</h2>
                </div>
              )}
              {block.explanation && (
                <div className="card-base p-6 mb-4">
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">{block.explanation}</p>
                </div>
              )}
              {block.examples && block.examples.length > 0 && (
                <div className="space-y-3 stagger-children mt-4">
                  {block.examples.map((ex, j) => (
                    <div key={j} className="card-base p-5 border-l-4 border-[var(--color-border)] hover:border-l-[var(--color-accent)] transition-colors">
                      <p className="text-[15px] font-medium text-[var(--color-text)] mb-1">{ex.de}</p>
                      <p className="text-sm text-[var(--color-text-muted)] italic">{ex.en}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Coming Soon notice */}
      {isStub && (
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
      )}
    </div>
  );
}
