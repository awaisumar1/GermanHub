# ADR-001: Why React Flow (@xyflow/react) for the Knowledge Graph

## Status

**Accepted** — 2026-07-07

## Context

GermanHub needs an interactive knowledge graph to visualize relationships between German language concepts, words, and themes. The first vertical slice contains 17+ nodes and their connections around the concept of "Expressing Reasons."

We evaluated two primary options:

1. **@xyflow/react (React Flow)** — A library for building node-based UIs with deterministic, manual or algorithmic layout.
2. **react-force-graph-2d** — A physics-based force-directed graph visualization library.

The graph is not a decoration — it *is* the product. Users navigate through it, click nodes to visit pages, and build mental models from its structure. The graph must be readable, predictable, and clear.

## Decision

Use **@xyflow/react (React Flow)** for all knowledge graph rendering.

## Rationale

### Deterministic Layout

React Flow uses explicit coordinates or layout algorithms (e.g., dagre, elkjs) to position nodes. The graph looks the same every time. Users build spatial memory — "weil is on the left, denn is next to it" — which reinforces learning. Force-directed graphs settle into different positions on each render, destroying spatial memory.

### Readability Over Visual Effects

Force-directed graphs look impressive in demos but become hard to read as node count grows. Nodes overlap, labels collide, and the constant jiggling is distracting. React Flow produces clean, readable layouts where every label is visible and every edge is traceable.

### Exploration Clarity

The purpose of the graph is to help users understand structure — how concepts, words, and themes relate. A deterministic layout makes this structure immediately apparent. A physics simulation makes structure emergent (you have to wait for it to settle) and unstable (it shifts when you interact).

### Better for Structured Educational Content

Language knowledge has inherent hierarchy (themes → concepts → words). React Flow handles hierarchical layout naturally. Force-directed graphs treat all relationships equally, losing this structural information.

### React Integration

React Flow is built for React. Custom nodes are React components. Event handling is standard React. This integrates cleanly with Next.js App Router, shadcn/ui, and the rest of the stack.

## Consequences

### Positive

- Graph layout is predictable and reproducible
- Users develop spatial memory of the knowledge graph
- Labels and edges are always readable
- Hierarchical structure of language knowledge is visually clear
- Custom node components integrate naturally with the design system
- Performance is excellent for the expected node count

### Negative

- Layout must be defined explicitly or via algorithms (more upfront work than "throw nodes at a physics engine")
- Less visually "dramatic" than a force-directed simulation — no organic movement or clustering animations
- Layout algorithm choice becomes an important decision as the graph scales

### Mitigations

- Use layout algorithms (dagre/elkjs) to compute positions automatically from graph data
- Add subtle hover and selection animations to maintain visual engagement
- Revisit layout strategy when node count exceeds current algorithm limits
