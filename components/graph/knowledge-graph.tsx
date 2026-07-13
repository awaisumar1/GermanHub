"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  useOnViewportChange,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import graphData from "@/data/graph.json";
import type { NodeType } from "@/types";
import { PremiumNode } from "./premium-node";

const nodeTypes = {
  premium: PremiumNode,
};

type ZoomLevel = "macro" | "medium" | "micro";

function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom < 0.65) return "macro";
  if (zoom < 1.0) return "medium";
  return "micro";
}

import { getNodeHref } from "@/lib/routes";

// -------------------------------------------------------------------------
// Layout Engine
// -------------------------------------------------------------------------

// Curated subset for initial focused neighborhood
const INITIAL_FOCUSED_NODES = new Set([
  "expressing-reasons",
  "weil", "denn", "deshalb", "deswegen", "daher",
  "sentence-order", "subordinate-clause", "conjunction",
  "travel",
  "modal-verbs"
]);

// Curated positions for the vertical slice layout - compacted layout
const CURATED_POSITIONS: Record<string, { x: number; y: number }> = {
  // Centre
  "expressing-reasons": { x: 0, y: 0 },
  // Expressions (left/top-left, closer to centre)
  "weil": { x: -140, y: -100 },
  "denn": { x: -60, y: -130 },
  "deshalb": { x: -160, y: -30 },
  "deswegen": { x: -180, y: 40 },
  "daher": { x: -120, y: 100 },
  // Grammar (right/upper-right, medium distance)
  "sentence-order": { x: 180, y: -70 },
  "subordinate-clause": { x: 100, y: -130 },
  "conjunction": { x: 200, y: 0 },
  // Context (bottom)
  "travel": { x: 0, y: 140 },
  // Secondary (farther away)
  "modal-verbs": { x: 240, y: 130 },
};

function generateNodes(visibleSlugs: Set<string>, placedPositions: Record<string, {x: number, y: number}>): Node[] {
  const nodes: Node[] = [];

  for (const n of graphData.nodes) {
    if (!visibleSlugs.has(n.slug)) continue;

    const pos = placedPositions[n.slug];
    
    nodes.push({
      id: `premium:${n.slug}`,
      type: "premium",
      position: pos || { x: 0, y: 0 },
      data: {
        label: n.title,
        slug: n.slug,
        type: n.type,
        status: n.status,
        levels: n.levels,
        isHovered: false,
        isDimmed: false,
      },
    });
  }

  return nodes;
}

function formatLearnerEdgeLabel(rawLabel: string): string | null {
  const mapping: Record<string, string> = {
    "belongs to": "expressed with",
    "requires": "affects",
    "used in": "practised in",
    "used-with": "used with",
  };
  return mapping[rawLabel] || null; // hide low-value/unknown edges
}

function generateEdges(visibleSlugs: Set<string>): Edge[] {
  return graphData.edges
    .filter(e => visibleSlugs.has(e.source) && visibleSlugs.has(e.target))
    .map((e, i) => {
      const learnerLabel = formatLearnerEdgeLabel(e.label);
      const color = "var(--color-text-dim)"; // Neutral default

      return {
        id: `e-${i}`,
        source: `premium:${e.source}`,
        target: `premium:${e.target}`,
        label: learnerLabel || undefined,
        type: "smoothstep",
        animated: false, // Remove animation for calmer default
        hidden: false,
        data: { originalLabel: learnerLabel },
        style: {
          stroke: color,
          strokeWidth: 1.5,
          opacity: 0.5,
        },
        labelStyle: { fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: "var(--color-bg)", fillOpacity: 0.8, rx: 4, stroke: "transparent" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
          width: 12,
          height: 12,
        },
      };
    });
}

// -------------------------------------------------------------------------
// Inner Flow Component (Has access to useReactFlow context)
// -------------------------------------------------------------------------

function InnerGraph() {
  const router = useRouter();

  const [visibleSlugs, setVisibleSlugs] = useState<Set<string>>(INITIAL_FOCUSED_NODES);
  
  // Track layout coordinates to avoid recalculating on every render
  const [placedPositions, setPlacedPositions] = useState<Record<string, {x: number, y: number}>>(CURATED_POSITIONS);

  const [nodes, setNodes] = useState<Node[]>(() => generateNodes(visibleSlugs, placedPositions));
  const [edges, setEdges] = useState<Edge[]>(() => generateEdges(visibleSlugs));
  
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("macro");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [lockedNodeId, setLockedNodeId] = useState<string | null>(null);

  const activeNodeId = lockedNodeId || hoveredNodeId;

  // Handle Zoom / LoD Updates
  useOnViewportChange({
    onChange: (viewport) => {
      const newZoom = getZoomLevel(viewport.zoom);
      if (newZoom !== zoomLevel) {
        setZoomLevel(newZoom);
      }
    },
  });

  // Re-generate nodes/edges when visibility changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- React Flow requires syncing external props into its internal interactive state via effects
    setNodes(generateNodes(visibleSlugs, placedPositions));
     
    setEdges(generateEdges(visibleSlugs));
  }, [visibleSlugs, placedPositions, setNodes, setEdges]);

  // Sync state into node/edge data
  useEffect(() => {
    // Determine active neighborhood (if any node is active)
    const activeNeighborIds = new Set<string>();
    if (activeNodeId) {
      activeNeighborIds.add(activeNodeId);
      graphData.edges.forEach((e) => {
        if (!visibleSlugs.has(e.source) || !visibleSlugs.has(e.target)) return;

        const sourceId = `premium:${e.source}`;
        const targetId = `premium:${e.target}`;

        if (sourceId === activeNodeId || targetId === activeNodeId) {
          activeNeighborIds.add(sourceId);
          activeNeighborIds.add(targetId);
        }
      });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- React Flow requires syncing external props into its internal interactive state via effects
    setNodes((nds) =>
      nds.map((n) => {
        const isHovered = n.id === activeNodeId;
        const isDimmed = activeNodeId !== null && !activeNeighborIds.has(n.id);
        
        return {
          ...n,
          hidden: zoomLevel === "macro" && n.data.type !== "concept" && n.data.type !== "word" && n.data.type !== "theme" && n.data.type !== "grammar", 
          data: { ...n.data, isHovered, isDimmed },
        };
      })
    );

     
    setEdges((eds) =>
      eds.map((e) => {
        const isConnectedToActive = e.source === activeNodeId || e.target === activeNodeId;
        const isConnectedToCenter = e.source === "premium:expressing-reasons" || e.target === "premium:expressing-reasons";
        const isVisibleInitially = isConnectedToCenter;

        const isHidden = activeNodeId 
          ? !isConnectedToActive // Hide if not connected to active node
          : !isVisibleInitially; // Default filtering

        const isPrimary = isConnectedToCenter || isConnectedToActive;
        const isActive = activeNodeId !== null && isConnectedToActive;
        
        const strokeColor = isActive ? "var(--color-accent)" : "var(--color-text-dim)";
        const opacity = activeNodeId !== null ? (isActive ? 1 : 0) : 0.4;
        
        // Only show individual "expressed with" labels on hover/focus to reduce noise
        const shouldShowLabel = isActive || (e.data?.originalLabel !== "expressed with");

        return {
          ...e,
          hidden: isHidden,
          label: shouldShowLabel ? (e.data?.originalLabel as string | undefined) : undefined,
          style: {
            ...e.style,
            stroke: strokeColor,
            opacity: opacity,
            strokeWidth: isActive ? 2 : 1.5,
            strokeDasharray: isPrimary ? "none" : "4 4",
            transition: "all 0.3s ease",
          },
          labelStyle: {
            ...e.labelStyle,
            fill: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
            opacity: opacity, // ensures label hides with edge path
          },
          labelBgStyle: {
            ...e.labelBgStyle,
            opacity: opacity,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 12,
            height: 12,
          }
        };
      })
    );
  }, [zoomLevel, activeNodeId, visibleSlugs, setNodes, setEdges]);

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    if (node.type === "premium" && !lockedNodeId) {
      setHoveredNodeId(node.id);
    }
  }, [lockedNodeId]);

  const onNodeMouseLeave: NodeMouseHandler = useCallback((_, node) => {
    if (node.type === "premium") {
      setHoveredNodeId(null);
    }
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === "premium") {
        setLockedNodeId(prev => prev === node.id ? null : node.id);
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setLockedNodeId(null);
  }, []);

  const lockedNodeData = useMemo(() => {
    if (!lockedNodeId) return null;
    return nodes.find(n => n.id === lockedNodeId)?.data as { label: string; slug: string; type: NodeType } | undefined;
  }, [lockedNodeId, nodes]);

  const handleExpand = useCallback(() => {
    if (!lockedNodeData) return;
    
    // Find missing neighbors up to max 4-6
    const neighbors = graphData.edges
      .filter(e => e.source === lockedNodeData.slug || e.target === lockedNodeData.slug)
      .map(e => e.source === lockedNodeData.slug ? e.target : e.source)
      // Exclude CEFR taxonomy unless selected
      .filter(slug => {
        const type = graphData.nodes.find(n => n.slug === slug)?.type;
        return type !== "level"; 
      });

    const newSlugs = new Set(visibleSlugs);
    let addedCount = 0;
    
    // Deterministic position layout for newly expanded nodes
    const anchorPos = placedPositions[lockedNodeData.slug] || {x: 0, y: 0};
    const newPositions = { ...placedPositions };
    let gridOffset = 0;

    for (const n of neighbors) {
      if (!newSlugs.has(n) && addedCount < 5) {
        newSlugs.add(n);
        addedCount++;
        
        // Simple angular placement around the anchor
        const angle = (gridOffset * 72) * (Math.PI / 180);
        newPositions[n] = {
          x: anchorPos.x + Math.cos(angle) * 160,
          y: anchorPos.y + Math.sin(angle) * 160,
        };
        gridOffset++;
      }
    }
    
    if (addedCount > 0) {
      setPlacedPositions(newPositions);
      setVisibleSlugs(newSlugs);
    }
  }, [lockedNodeData, visibleSlugs, placedPositions]);

  const handleReset = useCallback(() => {
    setVisibleSlugs(INITIAL_FOCUSED_NODES);
    setPlacedPositions(CURATED_POSITIONS);
    setLockedNodeId(null);
  }, []);

  return (
    <div className="relative w-full h-full group/graph">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--color-bg)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full px-4 py-1.5 z-10 opacity-0 group-hover/graph:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-xs text-[var(--color-text-dim)] font-medium">
          Select a node to inspect its connections
        </span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--color-bg)]"
      >
        <Controls
          showInteractive={false}
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />
      </ReactFlow>

      {/* Selected Node Action Panel */}
      {lockedNodeData && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-50 animate-in slide-in-from-bottom-4 w-[90%] sm:w-auto max-w-md">
          <div className="flex flex-col text-center sm:text-left w-full sm:w-auto">
            <span className="text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wider">{lockedNodeData.type}</span>
            <span className="text-base font-bold text-[var(--color-text)] truncate">{lockedNodeData.label}</span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-[var(--color-border)] mx-1"></div>
          <div className="flex w-full sm:w-auto gap-2">
            <button
              onClick={() => router.push(getNodeHref(lockedNodeData.slug, lockedNodeData.type))}
              className="flex-1 whitespace-nowrap px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] focus:outline-none"
            >
              Explore Node
            </button>
            <button
              onClick={handleExpand}
              className="flex-1 whitespace-nowrap px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] focus:outline-none"
            >
              Show related
            </button>
          </div>
        </div>
      )}

      {/* Reset View Button */}
      {visibleSlugs.size > INITIAL_FOCUSED_NODES.size && (
        <button
          onClick={handleReset}
          className="absolute top-6 right-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors z-50 focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] focus:outline-none"
        >
          Reset view
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Wrapper (Provides Context)
// -------------------------------------------------------------------------

export default function KnowledgeGraph() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 56px)" }}>
      <ReactFlowProvider>
        <InnerGraph />
      </ReactFlowProvider>
    </div>
  );
}
