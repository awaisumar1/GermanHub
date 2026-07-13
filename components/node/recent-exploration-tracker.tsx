"use client";

import { useEffect } from "react";
import { useRecentExplorations } from "@/hooks/use-recent-explorations";
import type { NodeType } from "@/types";

export function RecentExplorationTracker({
  slug,
  type,
  title,
}: {
  slug: string;
  type: NodeType;
  title: string;
}) {
  const { addExploration } = useRecentExplorations();

  useEffect(() => {
    addExploration({ slug, type, title });
  }, [slug, type, title, addExploration]);

  return null;
}
