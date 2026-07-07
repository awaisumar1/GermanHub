# ADR-003: Why Pages Are Graph Renderers

## Status

**Accepted** — 2026-07-07

## Context

GermanHub has multiple page types — concept pages, word pages, theme pages — each displaying different aspects of knowledge graph nodes. The question is how to architect these pages:

1. **Handcrafted pages** — Each page is a custom React component with its own layout, data fetching, and rendering logic.
2. **Pages as graph renderers** — Each page type is a generic renderer that takes a graph node and displays it according to its type. The graph data is the source of truth; pages are views.

## Decision

**Pages are graph renderers.** Each page type (`/concept/[id]`, `/word/[id]`, `/theme/[id]`) is a generic renderer that:

1. Looks up the node by ID from the graph data
2. Renders the node according to its type
3. Shows connected nodes from the graph edges
4. Provides navigation to related nodes

No page contains hardcoded content. All content comes from the graph data.

## Rationale

### The Graph Is the Source of Truth

The knowledge graph defines what exists, how things relate, and what content belongs where. Pages should reflect this truth, not duplicate or override it. If a node changes in the graph data, every view of that node updates automatically.

### Consistent Rendering

All concept pages look and behave the same way. All word pages look and behave the same way. There are no one-off layouts or special cases. Users build expectations about page behavior that are always met.

### "Coming Soon" Pages for Free

When a node exists in the graph but hasn't been fully developed, the same renderer displays it with a "Coming Soon" indicator. No special routing, no placeholder components, no 404 pages. Every node in the graph is a valid destination. This makes the graph feel complete and alive even during early development.

### Scales Naturally

Adding a new concept to GermanHub means:

1. Add node(s) to the JSON data
2. Add edge(s) to connect them

That's it. No new React components. No new routes (dynamic routes handle it). No new layouts. The page renderer picks up the new data and renders it. This scales from 17 nodes to 17,000 nodes with zero additional page code.

### Separation of Concerns

- **Data team** (or future contributors) works on JSON content
- **Design/engineering team** works on renderers
- Neither blocks the other
- Content and presentation evolve independently

## Consequences

### Positive

- Adding content requires zero code changes — just data
- All pages of the same type are visually and behaviorally consistent
- Unimplemented nodes are valid destinations (Coming Soon), not broken links
- Dynamic routes (`/concept/[id]`, `/word/[id]`) handle unlimited nodes
- Clear separation between content (JSON) and presentation (renderers)
- The graph can be visualized, queried, and navigated as a unified data structure

### Negative

- Individual pages cannot have unique layouts without extending the type system
- Complex pages may require richer data schemas to capture all needed information
- Debugging requires tracing from rendered UI → renderer component → JSON data

### Mitigations

- Extend the node type system for special cases (e.g., a "featured" flag that triggers enhanced layout)
- Keep the JSON schema well-documented and typed with TypeScript interfaces
- Use React DevTools and JSON viewers to trace data flow during development
