# ADR-002: Why JSON-First Data Layer

## Status

**Accepted** — 2026-07-07

## Context

GermanHub needs a data layer to store and serve knowledge graph content — nodes (concepts, words, themes), edges (relationships), and associated metadata (examples, grammar notes, translations).

This is a vertical slice, not a production application. The goal is to validate the user experience, not build infrastructure. However, the data model must be designed with scale in mind — the full vision includes tens of thousands of nodes covering the entire German language.

Options considered:

1. **Static JSON files** — Data stored as `.json` files in the repository, imported directly by Next.js.
2. **SQLite / local database** — Embedded database for structured queries.
3. **Headless CMS** — External content management (e.g., Sanity, Contentful).
4. **API backend** — Server with REST/GraphQL endpoints.

## Decision

Use **static JSON files** as the single source of truth for all content. All pages, components, and the graph visualization read from these files.

## Rationale

### No Backend Needed for the Slice

The vertical slice has ~17 nodes. A database, CMS, or API server would add complexity without adding value at this scale. JSON files are read directly at build time or runtime with zero infrastructure.

### Schema Designed for Scale

The JSON schema is designed as if it were a database schema — typed, normalized, with explicit IDs and relationships. Moving to a database later means writing an import script, not redesigning the data model. The shape of the data stays the same; only the storage layer changes.

### Every Page Generated from Data

Because JSON is the source of truth, there are no handcrafted pages. A concept page renders whatever the JSON says about that concept. A word page renders whatever the JSON says about that word. This means:

- Adding new content = adding JSON, not writing new React components
- "Coming Soon" pages work automatically — if a node exists in JSON but has minimal data, it renders with a coming-soon indicator
- Consistency is guaranteed — all concept pages look and behave the same way

### Transparency and Version Control

JSON files live in the repository. Every change to content is a git commit. Content can be reviewed in pull requests. There is no hidden state in an external service.

### Developer Experience

No environment variables, no API keys, no database migrations, no connection strings. Clone the repo, run `npm install`, run `npm run dev`. The data is right there in `/src/data/`.

## Consequences

### Positive

- Zero infrastructure — no servers, databases, or external services
- Instant setup — clone and run
- Full version control of all content
- Data model is designed for future database migration
- Pages are generated from data, ensuring consistency
- Schema serves as living documentation of the data model

### Negative

- No runtime queries — filtering and search must be implemented client-side or at build time
- Large JSON files could impact bundle size at extreme scale
- No concurrent editing — content changes require git workflow
- No real-time updates — content changes require rebuild or page refresh

### Mitigations

- Implement client-side search with lightweight indexing (e.g., fuse.js)
- Split JSON into smaller, per-concept files to control bundle size
- When the data outgrows JSON files, migrate to a database using the same schema shape
