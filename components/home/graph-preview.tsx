"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
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
  label?: string;
}

// ---------------------------------------------------------------------------
// Fixed layout coordinates for the Expressing Reasons vertical slice.
// Coordinates are stable for visual clarity. Data (slugs, types, labels)
// is resolved exclusively from graph.json via getNodeBySlug — nothing is
// duplicated here.
// ---------------------------------------------------------------------------

const NODE_LAYOUTS: NodeLayout[] = [
  { slug: "expressing-reasons", type: "concept",  x: 250, y: 140 },
  { slug: "weil",               type: "word",      x: 100, y:  80 },
  { slug: "denn",               type: "word",      x: 400, y:  80 },
  { slug: "deshalb",            type: "word",      x:  80, y: 200 },
  { slug: "deswegen",           type: "word",      x: 170, y: 230 },
  { slug: "daher",              type: "word",      x: 330, y: 230 },
  { slug: "sentence-order",     type: "grammar",   x: 420, y: 200 },
  { slug: "travel",             type: "theme",     x: 170, y:  50 },
  { slug: "daily-life",         type: "theme",     x: 330, y:  50 },
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

import { getNodeHref } from "@/lib/routes";

function getReadableEdgeLabel(label?: string): string | undefined {
  if (!label) return undefined;

  const labels: Record<string, string> = {
    "belongs to": "belongs to",
    "requires": "requires",
    "used in": "used in",
    "used-with": "used with",
  };

  return labels[label] ?? label.replaceAll("-", " ");
}

// ---------------------------------------------------------------------------
// Build the validated edge set from graph.json
// ---------------------------------------------------------------------------

type RawEdge = { source: string; target: string; label?: string };

function buildValidatedEdges(
  candidates: EdgeLayout[],
  resolvedSlugs: Set<string>
): EdgeLayout[] {
  const edgesInGraph = new Map<string, RawEdge>(
    (graphJson.edges as RawEdge[]).flatMap((e) => [
      [`${e.source}|${e.target}`, e],
      [`${e.target}|${e.source}`, e],
    ])
  );

  return candidates.flatMap((e) => {
    // Both nodes must be in our layout
    if (!resolvedSlugs.has(e.sourceSlug) || !resolvedSlugs.has(e.targetSlug)) {
      return [];
    }
    // Edge must exist in graph.json (forward or reverse direction)
    const edge = edgesInGraph.get(`${e.sourceSlug}|${e.targetSlug}`);
    if (!edge) return [];

    return [{ ...e, label: getReadableEdgeLabel(edge.label) }];
  });
}

// ---------------------------------------------------------------------------
// GraphPreview component
// ---------------------------------------------------------------------------

const VIEWBOX = { width: 500, height: 280 };
const NODE_R = 20;

export function GraphPreview() {
  const titleId = useId();
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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
  const activeConnectedSlugs = new Set<string>();
  if (activeSlug) {
    activeConnectedSlugs.add(activeSlug);
    for (const edge of validEdges) {
      if (edge.sourceSlug === activeSlug || edge.targetSlug === activeSlug) {
        activeConnectedSlugs.add(edge.sourceSlug);
        activeConnectedSlugs.add(edge.targetSlug);
      }
    }
  }

  // Build coord lookup for edges
  const coordMap = new Map<string, { x: number; y: number }>(
    resolvedNodes.map((rn) => [rn.layout.slug, { x: rn.layout.x, y: rn.layout.y }])
  );

  return (
    <div
      className="card-base overflow-hidden px-2 py-4 sm:px-4"
      style={{ background: "var(--color-bg-card)" }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        className="w-full h-auto"
        style={{ maxHeight: 360 }}
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
            const isActive = activeSlug === e.sourceSlug || activeSlug === e.targetSlug;
            const isDimmed = activeSlug !== null && !isActive;
            return (
              <g key={`${e.sourceSlug}|${e.targetSlug}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isActive ? "var(--color-accent)" : "var(--color-border)"}
                  strokeWidth={isActive ? 3 : 2}
                  strokeOpacity={isActive ? 0.95 : isDimmed ? 0.24 : 0.72}
                  strokeLinecap="round"
                  style={{ transition: "stroke 180ms ease, stroke-width 180ms ease, stroke-opacity 180ms ease" }}
                />
                {isActive && e.label && (
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="var(--color-accent)"
                    paintOrder="stroke"
                    stroke="var(--color-bg-card)"
                    strokeWidth={5}
                    strokeLinejoin="round"
                    fontFamily="var(--font-sans)"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes — each is a fully accessible link */}
        {resolvedNodes.map((rn) => {
          const { layout, node, href } = rn;
          const color = getNodeColor(layout.type);
          const isCenter = layout.slug === "expressing-reasons";
          const isActive = activeSlug === layout.slug;
          const isConnected = activeConnectedSlugs.has(layout.slug);
          const isDimmed = activeSlug !== null && !isConnected;
          const r = isCenter ? NODE_R + 6 : NODE_R;
          // Label below node, pushed outward for the center node
          const labelY = layout.y + r + 16;
          const labelLines = node.title.split(" ");

          return (
            <g
              key={layout.slug}
              className="group"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                transform: isActive ? "scale(1.06)" : "scale(1)",
                opacity: isDimmed ? 0.58 : 1,
                transition: "transform 180ms ease, opacity 180ms ease",
              }}
            >
              <Link
                href={href}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setActiveSlug(layout.slug)}
                onMouseLeave={() => setActiveSlug(null)}
                onFocus={() => setActiveSlug(layout.slug)}
                onBlur={() => setActiveSlug(null)}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                    router.push(href);
                  }
                }}
                aria-label={`Explore ${node.title} ${node.type}`}
              >
                <title>{node.title}</title>
                {/* Hit area larger than visual circle for touch */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={r + 10}
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
                  strokeOpacity={isActive ? 0.75 : 0}
                  className="group-focus-within:stroke-opacity-90"
                  style={{ transition: "stroke-opacity 180ms ease" }}
                />
                {/* Main node circle */}
                <circle
                  cx={layout.x}
                  cy={layout.y}
                  r={r}
                  fill={color}
                  fillOpacity={isCenter ? 0.3 : isActive ? 0.32 : 0.2}
                  stroke={color}
                  strokeWidth={isCenter || isActive ? 3 : 2}
                  style={{ transition: "fill-opacity 180ms ease, stroke-width 180ms ease" }}
                />
                {/* Node label — always visible */}
                <text
                  x={layout.x}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={isCenter ? 13 : 11}
                  fontWeight={isCenter || isActive ? "800" : "600"}
                  fill="var(--color-text)"
                  fontFamily="var(--font-sans)"
                  paintOrder="stroke"
                  stroke="var(--color-bg-card)"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  style={{ transition: "font-weight 180ms ease" }}
                >
                  {labelLines.map((line, index) => (
                    <tspan
                      key={`${layout.slug}-${line}-${index}`}
                      x={layout.x}
                      dy={index === 0 ? 0 : 13}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </Link>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs font-medium text-[var(--color-text-dim)]">
        Hover or focus a node • Click to explore
      </p>
    </div>
  );
}
