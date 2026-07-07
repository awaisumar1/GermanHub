# Tasks

## Current: Vertical Slice v0.1.0 — "Expressing Reasons"

**Goal:** Build one concept end-to-end to validate the exploration UX.

**Concept:** Expressing Reasons (`weil`, `denn`, `deshalb`, `deswegen`, `daher`)

### Pages

- [ ] **Home** — Entry point with featured concept, recent explorations, and graph teaser
- [ ] **Concept** (`/concept/[id]`) — Concept detail page showing related words, grammar overview, and graph context
- [ ] **Word** (`/word/[id]`) — Word detail page with translation, examples, grammar notes, and connections
- [ ] **Theme** (`/theme/[id]`) — Theme grouping page showing related concepts and words
- [ ] **Graph** (`/graph`) — Full interactive knowledge graph with all nodes and edges
- [ ] **Search** (`/search`) — Search across all graph nodes with filtering

### Data Layer

- [ ] Define JSON schema for nodes (concepts, words, themes)
- [ ] Define JSON schema for edges (relationships between nodes)
- [ ] Create data files for "Expressing Reasons" concept and its 5 words
- [ ] TypeScript types matching JSON schema

### Graph Visualization

- [ ] React Flow setup with @xyflow/react
- [ ] Custom node components (concept, word, theme)
- [ ] Deterministic layout algorithm (no physics simulation)
- [ ] Click-to-navigate from graph nodes to pages

### Navigation & UX

- [ ] Breadcrumb component showing graph path
- [ ] "Continue Exploring" section on every page
- [ ] Recent explorations (localStorage)
- [ ] "Coming Soon" page for unimplemented nodes

### Design & Polish

- [ ] Consistent design system with Tailwind + shadcn/ui
- [ ] Responsive layout (mobile + desktop)
- [ ] Smooth transitions between pages
- [ ] Premium, exploration-focused aesthetic

---

## Backlog

*Items for after the vertical slice is validated.*

- [ ] Additional concepts (e.g., Modal Verbs, Cases, Word Order)
- [ ] User preferences (dark mode toggle, font size)
- [ ] Progressive disclosure (difficulty levels per node)
- [ ] Audio pronunciation on word pages
- [ ] Spaced repetition integration (optional layer)
- [ ] Backend migration (JSON → database)
- [ ] Authentication and user profiles
- [ ] Community contributions
