"use client";

import Link from "next/link";
import { useId } from "react";
import { getNodeBySlug } from "@/lib/data";
import graphJson from "@/data/graph.json";
import type { NodeType, GraphNode } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NodeLayout {
  slug: string;
  type: NodeType;
  /** SVG coordinate — x in viewBox units */
  x: number;
  /** SVG coordinate — y in viewBox units */
  y: number;
}

interface ResolvedLayoutNode {
  layout: NodeLayout;
  node: GraphNode;
  href: string;
}

interface EdgeLayout {
  sourceSlug: string;
  targetSlug: string;
}

// ---------------------------------------------------------------------------
// Fixed layout coordinates for the Expressing Reasons vertical slice.
// Coordinates are stable for visual clarity. Data (slugs, types, labels)
// is resolved exclusively from graph.json via getNodeBySlug — nothing is
// duplicated here.
// ---------------------------------------------------------------------------

const NODE_LAYOUTS: NodeLayout[] = [
  { slug: "expressing-reasons", type: "concept",  x: 250, y: 120 },
  { slug: "weil",               type: "word",      x:  70, y:  55 },
  { slug: "denn",               type: "word",      x: 430, y:  55 },
  { slug: "deshalb",            type: "word",      x:  50, y: 205 },
  { slug: "deswegen",           type: "word",      x: 155, y: 250 },
  { slug: "daher",              type: "word",      x: 345, y: 250 },
  { slug: "sentence-order",     type: "grammar",   x: 435, y: 205 },
  { slug: "travel",             type: "theme",     x: 155, y:  20 },
  { slug: "daily-life",         type: "theme",     x: 345, y:  20 },
];

// Only edges that exist in graph.json are listed here.
// The component validates each against the live edge list before rendering.
const CANDIDATE_EDGES: EdgeLayout[] = [
  { sourceSlug: "weil",              targetSlug: "expressing-reasons" },
  { sourceSlug: "denn",              targetSlug: "expressing-reasons" },
  { sourceSlug: "deshalb",          targetSlug: "expressing-reasons" },
  { sourceSlug: "deswegen",         targetSlug: "expressing-reasons" },
  { sourceSlug: "daher",            targetSlug: "expressing-reasons" },
  { sourceSlug: "expressing-reasons", targetSlug: "sentence-order"   },
  { sourceSlug: "expressing-reasons", targetSlug: "travel"           },
  { sourceSlug: "expressing-reasons", targetSlug: "daily-life"       },
];

// ---------------------------------------------------------------------------
// Node color by type
// ---------------------------------------------------------------------------

function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    concept: "#8b5cf6",
    word:    "#22d3ee",
    theme:   "#f59e0b",
    grammar: "#ec4899",
    level:   "#10b981",
    skill:   "#3b82f6",
    mistake: "#ef4444",
  };
  return colors[type];
}

function getNodeHref(slug: string, type: NodeType): string {
  switch (type) {
    case "concept": return `/concept/${slug}`;
    case "word":    return `/word/${slug}`;
    case "theme":   return `/theme/${slug}`;
    default:        return `/node/${type}/${slug}`;
  }
}

// ---------------------------------------------------------------------------
// Build the validated edge set from graph.json
// ---------------------------------------------------------------------------

type RawEdge = { source: string; target: string };

function buildValidatedEdges(
  candidates: EdgeLayout[],
  resolvedSlugs: Set<string>
): EdgeLayout[] {
  const edgesInGraph = new Set<string>(
    (graphJson.edges as RawEdge[]).map((e) => `${e.source}|${e.target}`)
  );

  return candidates.filter((e) => {
    // Both nodes must be in our layout
    if (!resolvedSlugs.has(e.sourceSlug) || !resolvedSlugs.has(e.targetSlug)) {
      return false;
    }
    // Edge must exist in graph.json (forward or reverse direction)
    const fwd = `${e.sourceSlug}|${e.targetSlug}`;
    const rev = `${e.targetSlug}|${e.sourceSlug}`;
    return edgesInGraph.has(fwd) || edgesInGraph.has(rev);
  });
}

// ---------------------------------------------------------------------------
// GraphPreview component
// ---------------------------------------------------------------------------

const VIEWBOX = { width: 500, height: 280 };
const NODE_R = 16;

export function GraphPreview() {
  const titleId = useId();

  // Resolve all nodes via the generic resolver (no type-branching in the component)
  const resolvedNodes: ResolvedLayoutNode[] = [];
  for (const layout of NODE_LAYOUTS) {
    const node = getNodeBySlug(layout.slug, layout.type);
    if (!node) continue; // skip if not in graph
    resolvedNodes.push({
      layout,
      node,
      href: getNodeHref(layout.slug, layout.type),
    });
  }

  const resolvedSlugs = new Set(resolvedNodes.map((rn) => rn.layout.slug));
  const validEdges = buildValidatedEdges(CANDIDATE_EDGES, resolvedSlugs);

  // Build coord lookup for edges
  const coordMap = new Map<string, { x: number; y: number }>(
    resolvedNodes.map((rn) => [rn.layout.slug, { x: rn.layout.x, y: rn.layout.y }])
  );

  return (
    <div
      className="card-base overflow-hidden"
      style={{ background: "var(--color-bg-card)" }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        className="w-full"
        style={{ height: "auto", maxHeight: 320 }}
        aria-labelledby={titleId}
        role="img"
      >
        <title id={titleId}>
          Interactive knowledge graph showing the Expressing Reasons concept and its connections to weil, denn, deshalb, deswegen, daher, travel, daily-life, and sentence-order.
        </title>

        {/* Edge lines — rendered before nodes so nodes appear on top */}
        <g aria-hidden="true">
          {validEdges.map((e) => {
            const src = coordMap.get(e.sourceSlug);
            const tgt = coordMap.get(e.targetSlug);
            if (!src || !tgt) return null;
            return (
              <line
                key={`${e.sourceSlug}|${e.targetSlug}`}
                x1={src.x} y1={src.y}
                x2={tgt.x} y2={tgt.y}
                stroke="var(--color-border)"
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
            );
          })}
        </g>

        {/* Nodes — each is a fully accessible link */}
        {resolvedNodes.map((rn) => {
          const { layout, node, href } = rn;
          const color = getNodeColor(layout.type);
          const isCenter = layout.slug === "expressing-reasons";
          const r = isCenter ? NODE_R + 5 : NODE_R;
          // Label below node, pushed outward for the center node
          const labelY = layout.y + r + 13;

          return (
            <g key={layout.slug} className="group">
              <Link href={href}>
                <title>{node.title}</title>
                {/* Hit area larger than visual circle for touch */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={r + 8}
                  fill="transparent"
                />
                {/* Glow ring on focus/hover */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={r + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0}
                  className="group-focus-within:stroke-opacity-60 group-hover:stroke-opacity-40"
                  style={{ transition: "stroke-opacity 0.2s" }}
                />
                {/* Main node circle */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={r}
                  fill={color}
                  fillOpacity={isCenter ? 0.25 : 0.15}
                  stroke={color}
                  strokeWidth={isCenter ? 2 : 1.5}
                />
                {/* Node label — always visible */}
                <text
                  x={layout.x}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={isCenter ? 11 : 9.5}
                  fontWeight={isCenter ? "700" : "500"}
                  fill={isCenter ? "var(--color-text)" : "var(--color-text-secondary)"}
                  fontFamily="var(--font-sans)"
                >
                  {node.title}
                </text>
              </Link>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
