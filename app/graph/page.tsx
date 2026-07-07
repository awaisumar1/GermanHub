"use client";

import dynamic from "next/dynamic";

// Dynamic import — React Flow uses canvas and needs to run client-side only
const KnowledgeGraph = dynamic(
  () => import("@/components/graph/knowledge-graph"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full flex items-center justify-center"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <div className="text-sm text-[var(--color-text-muted)] animate-pulse">
          Loading knowledge graph...
        </div>
      </div>
    ),
  }
);

export default function GraphPage() {
  return <KnowledgeGraph />;
}
