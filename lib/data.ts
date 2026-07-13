import type {
  GraphData,
  GraphNode,
  GraphNodeBase,
  Concept,
  Word,
  Theme,
  SearchResult,
  NodeType,
} from "@/types";

import graphJson from "@/data/graph.json";
import conceptsJson from "@/data/concepts.json";
import wordsJson from "@/data/words.json";
import themesJson from "@/data/themes.json";
import grammarJson from "@/data/grammar.json";
import skillsJson from "@/data/skills.json";
import mistakesJson from "@/data/mistakes.json";

// ---------------------------------------------------------------------------
// Internal: merge detailed data into graph nodes
// ---------------------------------------------------------------------------

/** Detailed concepts keyed by slug for O(1) lookup */
const conceptsBySlug = new Map((conceptsJson as Concept[]).map((c) => [c.slug, c]));

/** Detailed words keyed by slug for O(1) lookup */
const wordsBySlug = new Map((wordsJson as Word[]).map((w) => [w.slug, w]));

/** Detailed themes keyed by slug for O(1) lookup */
const themesBySlug = new Map((themesJson as Theme[]).map((t) => [t.slug, t]));

/** Detailed grammar keyed by slug for O(1) lookup */
const grammarBySlug = new Map((grammarJson as GraphNodeBase[]).map((g) => [g.slug, g]));

/** Detailed skills keyed by slug for O(1) lookup */
const skillsBySlug = new Map((skillsJson as GraphNodeBase[]).map((s) => [s.slug, s]));

/** Detailed mistakes keyed by slug for O(1) lookup */
const mistakesBySlug = new Map((mistakesJson as GraphNodeBase[]).map((m) => [m.slug, m]));

/**
 * Resolve a graph node to its full type-specific shape.
 * For nodes with detailed JSON files, merge the full data.
 * For stubs, return the graph node as-is.
 */
function resolveNode(node: GraphNode): GraphNode {
  switch (node.type) {
    case "concept":
      return (conceptsBySlug.get(node.slug) as GraphNode) ?? node;
    case "word":
      return (wordsBySlug.get(node.slug) as GraphNode) ?? node;
    case "theme":
      return (themesBySlug.get(node.slug) as GraphNode) ?? node;
    case "grammar":
      return (grammarBySlug.get(node.slug) as GraphNode) ?? node;
    case "skill":
      return (skillsBySlug.get(node.slug) as GraphNode) ?? node;
    case "mistake":
      return (mistakesBySlug.get(node.slug) as GraphNode) ?? node;
    default:
      return node;
  }
}

// ---------------------------------------------------------------------------
// Pre-computed resolved nodes (lazy singleton)
// ---------------------------------------------------------------------------

let _resolvedNodes: GraphNode[] | null = null;

function getResolvedNodes(): GraphNode[] {
  if (!_resolvedNodes) {
    _resolvedNodes = (graphJson.nodes as GraphNode[]).map(resolveNode);
  }
  return _resolvedNodes;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return the full graph data (all nodes resolved + edges). */
export function getGraphData(): GraphData {
  return {
    nodes: getResolvedNodes(),
    edges: graphJson.edges as GraphData["edges"],
  };
}

/** Return every node in the graph, fully resolved. */
export function getAllNodes(): GraphNode[] {
  return getResolvedNodes();
}

/**
 * Find a single node by slug. Optionally restrict to a specific type.
 * Returns `undefined` if not found.
 */
export function getNodeBySlug(
  slug: string,
  type?: NodeType
): GraphNode | undefined {
  return getResolvedNodes().find(
    (n) => n.slug === slug && (type === undefined || n.type === type)
  );
}

/** Get a fully-resolved Concept by slug. */
export function getConcept(slug: string): Concept | undefined {
  return conceptsBySlug.get(slug);
}

/** Get a fully-resolved Word by slug. */
export function getWord(slug: string): Word | undefined {
  return wordsBySlug.get(slug);
}

/** Get a fully-resolved Theme by slug. */
export function getTheme(slug: string): Theme | undefined {
  return themesBySlug.get(slug);
}

/** Return all Concept nodes. */
export function getAllConcepts(): Concept[] {
  return Array.from(conceptsBySlug.values());
}

/** Return all Word nodes. */
export function getAllWords(): Word[] {
  return Array.from(wordsBySlug.values());
}

/** Return all Theme nodes. */
export function getAllThemes(): Theme[] {
  return Array.from(themesBySlug.values());
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Case-insensitive search across title, summary, and tags of every node.
 * Returns results sorted by relevance score (higher = better match).
 */
export function searchNodes(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const results: SearchResult[] = [];

  for (const node of getResolvedNodes()) {
    let score = 0;

    // Title match — highest weight
    const titleLower = node.title.toLowerCase();
    if (titleLower === q) {
      score += 100;
    } else if (titleLower.startsWith(q)) {
      score += 75;
    } else if (titleLower.includes(q)) {
      score += 50;
    }

    // German title match
    if (node.titleDe) {
      const titleDeLower = node.titleDe.toLowerCase();
      if (titleDeLower === q) {
        score += 90;
      } else if (titleDeLower.startsWith(q)) {
        score += 65;
      } else if (titleDeLower.includes(q)) {
        score += 40;
      }
    }

    // Summary match
    if (node.summary.toLowerCase().includes(q)) {
      score += 30;
    }

    // Tag match
    if (node.tags?.some((tag) => tag.toLowerCase().includes(q))) {
      score += 20;
    }

    if (score > 0) {
      results.push({
        slug: node.slug,
        title: node.title,
        type: node.type,
        summary: node.summary,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Related nodes
// ---------------------------------------------------------------------------

/**
 * Return nodes related to the node identified by `slug` + `type`.
 * Looks at the `related` array on the source node and resolves each entry.
 */
export function getRelatedNodes(slug: string, type: NodeType): GraphNode[] {
  const node = getNodeBySlug(slug, type);
  if (!node?.related) return [];

  const related: GraphNode[] = [];
  for (const ref of node.related) {
    const resolved = getNodeBySlug(ref.slug, ref.type);
    if (resolved) {
      related.push(resolved);
    }
  }
  return related;
}
