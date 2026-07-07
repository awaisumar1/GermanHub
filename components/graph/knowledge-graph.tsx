"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  useReactFlow,
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
import { GroupNode } from "./group-node";
import { UnifiedConceptView } from "./unified-concept-view";

const nodeTypes = {
  premium: PremiumNode,
  group: GroupNode,
};

type ZoomLevel = "macro" | "medium" | "micro";

function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom < 0.65) return "macro";
  if (zoom < 1.0) return "medium";
  return "micro";
}

function getNodeHref(slug: string, type: NodeType): string {
  switch (type) {
    case "concept": return `/concept/${slug}`;
    case "word": return `/word/${slug}`;
    case "theme": return `/theme/${slug}`;
    default: return `/node/${type}/${slug}`;
  }
}

// -------------------------------------------------------------------------
// Layout Engine
// -------------------------------------------------------------------------

// Maps data nodes to synthetic parent IDs
const GROUP_MAPPING: Record<string, string> = {
  // Vocabulary
  weil: "group-vocab",
  denn: "group-vocab",
  deshalb: "group-vocab",
  deswegen: "group-vocab",
  daher: "group-vocab",
  // Grammar & Concepts
  "expressing-reasons": "group-grammar",
  "subordinate-clause": "group-grammar",
  "sentence-order": "group-grammar",
  "conjunction": "group-grammar",
  // Application
  travel: "group-app",
  "daily-life": "group-app",
  "formal-language": "group-app",
  speaking: "group-app",
  writing: "group-app",
  // Progression
  a2: "group-prog",
  b1: "group-prog",
  "common-mistakes": "group-prog",
};

// Hardcoded positions for children within their 420x340 parent boxes
const CHILD_POSITIONS: Record<string, { x: number; y: number }> = {
  // Vocab
  weil: { x: 30, y: 70 },
  denn: { x: 230, y: 70 },
  deshalb: { x: 30, y: 160 },
  deswegen: { x: 230, y: 160 },
  daher: { x: 130, y: 250 },
  // Grammar
  "expressing-reasons": { x: 100, y: 60 }, // slightly wider pill
  "subordinate-clause": { x: 30, y: 160 },
  "sentence-order": { x: 240, y: 160 },
  "conjunction": { x: 130, y: 260 },
  // App
  travel: { x: 40, y: 70 },
  "daily-life": { x: 220, y: 70 },
  "formal-language": { x: 120, y: 160 },
  speaking: { x: 40, y: 250 },
  writing: { x: 220, y: 250 },
  // Prog
  a2: { x: 160, y: 70 },
  b1: { x: 160, y: 160 },
  "common-mistakes": { x: 110, y: 250 },
};

function generateInitialNodes(): Node[] {
  const nodes: Node[] = [];

  // 1. Synthetic Parent Nodes (2x2 grid spacing)
  const parents = [
    { id: "group-vocab", label: "Vocabulary", color: "#22d3ee", x: 0, y: 0 },
    { id: "group-grammar", label: "Grammar", color: "#8b5cf6", x: 500, y: 0 },
    { id: "group-app", label: "Application", color: "#f59e0b", x: 0, y: 400 },
    { id: "group-prog", label: "Progression", color: "#10b981", x: 500, y: 400 },
  ];

  for (const p of parents) {
    nodes.push({
      id: p.id,
      type: "group",
      position: { x: p.x, y: p.y },
      style: { width: 420, height: 340 },
      data: {
        label: p.label,
        color: p.color,
        isHovered: false,
        isDimmed: false,
        zoomLevel: "macro",
      },
    });
  }

  // 2. Child Nodes
  for (const n of graphData.nodes) {
    const parentId = GROUP_MAPPING[n.slug];
    const pos = CHILD_POSITIONS[n.slug] || { x: 50, y: 50 };

    nodes.push({
      id: `premium:${n.slug}`,
      type: "premium",
      parentId: parentId,
      position: pos,
      // extent: "parent", // Keeps them strictly bounded
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

function generateInitialEdges(): Edge[] {
  return graphData.edges.map((e, i) => {
    // Determine edge color based on source node type
    const sourceNode = graphData.nodes.find(n => n.slug === e.source);
    const color = sourceNode?.type === "word" ? "#22d3ee" :
                  sourceNode?.type === "concept" ? "#8b5cf6" :
                  sourceNode?.type === "theme" ? "#f59e0b" : "#a1a1aa";

    return {
      id: `e-${i}`,
      source: `premium:${e.source}`,
      target: `premium:${e.target}`,
      label: e.label,
      type: "smoothstep",
      animated: true,
      hidden: true, // Hidden by default
      style: {
        stroke: color,
        strokeWidth: 2,
        opacity: 0.8,
      },
      labelStyle: { fill: "#fafafa", fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: "#18181b", fillOpacity: 0.9, rx: 4 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: color,
        width: 15,
        height: 15,
      },
    };
  });
}

// -------------------------------------------------------------------------
// Inner Flow Component (Has access to useReactFlow context)
// -------------------------------------------------------------------------

function InnerGraph() {
  const router = useRouter();
  const { getZoom } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>(generateInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(generateInitialEdges);
  
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("macro");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeConceptSlug, setActiveConceptSlug] = useState<string | null>(null);

  // Handle Zoom / LoD Updates
  useOnViewportChange({
    onChange: (viewport) => {
      const newZoom = getZoomLevel(viewport.zoom);
      if (newZoom !== zoomLevel) {
        setZoomLevel(newZoom);
      }
    },
  });

  // Sync state into node/edge data
  useEffect(() => {
    // Find Hop 1 neighbors
    const activeEdges = edges.filter(e => 
      e.source === activeNodeId || e.target === activeNodeId
    );
    
    const neighborIds = new Set<string>();
    if (activeNodeId) {
      neighborIds.add(activeNodeId);
      activeEdges.forEach(e => {
        neighborIds.add(e.source);
        neighborIds.add(e.target);
      });
    }

    setNodes((nds) =>
      nds.map((n) => {
        let isHovered = false;
        let isDimmed = false;

        if (n.type === "premium") {
          isHovered = n.id === activeNodeId;
          isDimmed = activeNodeId !== null && !neighborIds.has(n.id);
        }

        // For groups, update zoom level
        if (n.type === "group") {
          isDimmed = activeNodeId !== null; // Dim groups when a specific node is active
          return {
            ...n,
            data: { ...n.data, zoomLevel, isDimmed, isHovered },
          };
        }

        return {
          ...n,
          hidden: zoomLevel === "macro", // Hide micro nodes at macro zoom
          data: { ...n.data, isHovered, isDimmed },
        };
      })
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        hidden: !activeNodeId || (e.source !== activeNodeId && e.target !== activeNodeId),
      }))
    );
  }, [zoomLevel, activeNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    if (node.type === "premium") {
      setActiveNodeId(node.id);
    }
  }, []);

  const onNodeMouseLeave: NodeMouseHandler = useCallback((_, node) => {
    if (node.type === "premium") {
      setActiveNodeId(null);
    }
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === "premium") {
        const { slug, type } = node.data as { slug: string; type: NodeType };
        if (type === "concept") {
          setActiveConceptSlug(slug);
        } else {
          router.push(getNodeHref(slug, type));
        }
      }
    },
    [router]
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeClick={onNodeClick}
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
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />
      </ReactFlow>

      {/* Unified Concept Slide-out Drawer */}
      {activeConceptSlug && (
        <UnifiedConceptView
          slug={activeConceptSlug}
          mode="drawer"
          onClose={() => setActiveConceptSlug(null)}
        />
      )}
    </>
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
