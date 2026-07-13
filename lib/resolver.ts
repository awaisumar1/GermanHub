import { getNodeBySlug, getGraphData } from "./data";
import type { GraphNode } from "@/types";

export type NodePageModel = {
  node: GraphNode;
  relatedNodes: GraphNode[];
  referencedBy: GraphNode[];
};

export function getNodePageModel(slug: string): NodePageModel | null {
  const node = getNodeBySlug(slug);
  if (!node) {
    return null;
  }

  const { nodes } = getGraphData();

  const relatedNodes = (node.related || [])
    .map((r) => nodes.find((n) => n.slug === r.slug && n.type === r.type))
    .filter((n): n is GraphNode => n !== undefined);

  const referencedBy = nodes.filter((n) =>
    (n.related || []).some((r) => r.slug === node.slug && r.type === node.type)
  );

  return {
    node,
    relatedNodes,
    referencedBy,
  };
}
