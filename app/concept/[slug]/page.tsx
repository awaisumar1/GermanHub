"use client";

import { useEffect, use } from "react";
import { notFound } from "next/navigation";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import { UnifiedConceptView } from "@/components/graph/unified-concept-view";
import conceptsData from "@/data/concepts.json";
import type { Concept } from "@/types";

function getConcept(slug: string): Concept | undefined {
  return conceptsData.find((c) => c.slug === slug) as Concept | undefined;
}

export default function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const concept = getConcept(slug);
  const { addExploration } = useRecentExplorations();

  useEffect(() => {
    if (concept) {
      addExploration({ slug: concept.slug, type: "concept", title: concept.title });
    }
  }, [concept?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!concept) return notFound();

  return (
    <div className="w-full">
      <UnifiedConceptView slug={slug} mode="page" />
    </div>
  );
}
