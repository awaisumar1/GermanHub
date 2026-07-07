# Changelog

All notable changes to GermanHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] — 2026-07-07

### First Vertical Slice — "Expressing Reasons"

One concept fully built to discover whether the exploration-based UX feels magical.

#### Added

- **Home page** — Entry point for exploration with featured concept and recent explorations
- **Concept page** (`/concept/[id]`) — Deep view of "Expressing Reasons" concept with related words and graph context
- **Word pages** (`/word/[id]`) — Detail pages for `weil`, `denn`, `deshalb`, `deswegen`, `daher` with examples, grammar notes, and graph connections
- **Theme page** (`/theme/[id]`) — Thematic grouping view
- **Graph page** (`/graph`) — Full interactive knowledge graph using @xyflow/react with deterministic layout
- **Search page** (`/search`) — Search across all nodes in the knowledge graph
- **Knowledge graph visualization** — Interactive graph with 17+ real nodes, powered by @xyflow/react (React Flow)
- **JSON data layer** — All content stored in static JSON files, schema designed for tens of thousands of nodes
- **Breadcrumb navigation** — Contextual breadcrumbs on every page showing graph path
- **"Continue Exploring" sections** — Every page offers next steps to keep exploration going
- **Recent explorations** — localStorage-based history of visited nodes
- **"Coming Soon" pages** — Unimplemented nodes render a real page from graph data with a coming-soon indicator
- **Responsive design** — Tailwind CSS with shadcn/ui components

#### Technical

- Next.js (latest) with App Router and TypeScript
- @xyflow/react for knowledge graph rendering (deterministic layout, no physics simulation)
- Static JSON as single source of truth (no backend, no API)
- Pages generated from graph data (pages are graph renderers, not handcrafted)
- localStorage for persisting recent exploration history
