import type { GraphNodeBase, NodeType } from "@/types";

export function getNodeHref(node: GraphNodeBase): string;
export function getNodeHref(slug: string, type: NodeType): string;
export function getNodeHref(
  nodeOrSlug: GraphNodeBase | string,
  typeOrUndefined?: NodeType
): string {
  let type: NodeType;
  let slug: string;

  if (typeof nodeOrSlug === "string") {
    slug = nodeOrSlug;
    type = typeOrUndefined!;
  } else {
    type = nodeOrSlug.type;
    slug = nodeOrSlug.slug;
  }

  switch (type) {
    case "concept":
      return `/concept/${slug}`;
    case "word":
      return `/word/${slug}`;
    case "theme":
      return `/theme/${slug}`;
    case "grammar":
    case "skill":
    case "mistake":
    case "level":
      return `/node/${type}/${slug}`;
    default:
      // Fallback for completely unknown types, though shouldn't happen with strict types
      return `/node/${type}/${slug}`;
  }
}
