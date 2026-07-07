// =============================================================================
// GermanHub Type System
// =============================================================================
// Designed to support tens of thousands of nodes.
// Every entity in the system is a "GraphNode" — pages are just renderers.
// =============================================================================

// ---------------------------------------------------------------------------
// Core Node Types — the graph's vocabulary
// ---------------------------------------------------------------------------

/** Every entity in the knowledge graph is one of these types */
export type NodeType =
  | "concept"
  | "word"
  | "theme"
  | "grammar"
  | "level"
  | "skill"
  | "mistake";

/** CEFR proficiency levels */
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Parts of speech */
export type PartOfSpeech =
  | "conjunction"
  | "adverb"
  | "preposition"
  | "verb"
  | "noun"
  | "adjective"
  | "particle";

/** The status of a node's content — allows graceful "Coming Soon" */
export type ContentStatus = "complete" | "partial" | "stub";

// ---------------------------------------------------------------------------
// Graph Primitives — nodes and edges
// ---------------------------------------------------------------------------

/** Base interface for all nodes in the knowledge graph */
export interface GraphNodeBase {
  /** URL-friendly identifier, unique within type */
  slug: string;
  /** Display title in English */
  title: string;
  /** Display title in German (optional) */
  titleDe?: string;
  /** The type of this node — determines which renderer is used */
  type: NodeType;
  /** How much content is available */
  status: ContentStatus;
  /** Short description for search results and tooltips */
  summary: string;
  /** CEFR level(s) this node is relevant to */
  levels?: CEFRLevel[];
  /** Tags for filtering and search */
  tags?: string[];
  /** Connections to other nodes */
  related?: RelatedNode[];
}

/** A reference to another node */
export interface RelatedNode {
  /** Slug of the related node */
  slug: string;
  /** Type of the related node */
  type: NodeType;
  /** Nature of the relationship */
  relation: string;
}

// ---------------------------------------------------------------------------
// Concept — a grammatical or linguistic idea
// ---------------------------------------------------------------------------

export interface Concept extends GraphNodeBase {
  type: "concept";
  /** Detailed overview text (supports markdown) */
  overview: string;
  /** Words that belong to this concept */
  words: string[];
  /** Unified Concept blocks containing level-specific content */
  blocks?: ConceptBlock[];
  /** Side-by-side comparisons between words */
  comparisons: Comparison[];
  /** Common mistakes learners make */
  commonMistakes: Mistake[];
  /** Suggested learning progression */
  learningPath: LearningStep[];
}

export type BlockCategory = "Wortschatz" | "Grammatik" | "Sätze" | "Praxis";

export interface GrammarTable {
  title?: string;
  headers: string[];
  rows: {
    label: string;
    values: string[];
  }[];
}

export interface SyntaxToken {
  word: string;
  role?: string;
  isClickable?: boolean;
}

export interface SyntaxPlayground {
  tokens: SyntaxToken[];
  translation: string;
}

export interface PracticeQuiz {
  type: "gap-fill";
  prompt: string;
  answer: string;
  explanation?: string;
}

export interface ConceptBlock {
  /** The CEFR level this block is meant for */
  level: CEFRLevel;
  /** Broad category classification */
  category?: BlockCategory;
  /** Short block title */
  title: string;
  /** Detailed markdown content */
  content: string;
  /** Structural grammar tables */
  tables?: GrammarTable[];
  /** Interactive syntax playground */
  syntaxPlaygrounds?: SyntaxPlayground[];
  /** Interactive practice exercises */
  practices?: PracticeQuiz[];
  /** Interactive or highlighted examples */
  examples?: {
    de: string;
    en: string;
    highlight?: string[];
  }[];
}

export interface Comparison {
  /** Items being compared (word slugs) */
  items: string[];
  /** What dimension is being compared */
  dimension: string;
  /** Rows of the comparison table */
  rows: ComparisonRow[];
}

export interface ComparisonRow {
  /** The attribute being compared */
  attribute: string;
  /** Values for each item in the comparison */
  values: string[];
}

export interface Mistake {
  /** The incorrect usage */
  incorrect: string;
  /** The correct usage */
  correct: string;
  /** Why it's wrong */
  explanation: string;
  /** Which CEFR level typically makes this mistake */
  level?: CEFRLevel;
}

export interface LearningStep {
  /** Step order */
  order: number;
  /** Step title */
  title: string;
  /** What to learn in this step */
  description: string;
  /** Related word or concept slug */
  nodeSlug?: string;
  /** Type of the referenced node */
  nodeType?: NodeType;
}

// ---------------------------------------------------------------------------
// Word — an individual German word
// ---------------------------------------------------------------------------

export interface Word extends GraphNodeBase {
  type: "word";
  /** The German word */
  word: string;
  /** English meaning */
  meaning: string;
  /** IPA pronunciation */
  pronunciation: string;
  /** Part of speech */
  partOfSpeech: PartOfSpeech;
  /** CEFR level for this word */
  level: CEFRLevel;
  /** Example sentences */
  examples: Example[];
  /** How this word affects sentence structure */
  sentenceStructure: SentenceStructure;
  /** Tips for using this word correctly */
  usageTips?: string[];
}

export interface Example {
  /** German sentence */
  de: string;
  /** English translation */
  en: string;
  /** Key parts to highlight (indices or substrings) */
  highlight?: string[];
  /** Context: formal, informal, written, spoken */
  context?: string;
}

export interface SentenceStructure {
  /** Pattern description (e.g., "Subject + weil + ... + Verb") */
  pattern: string;
  /** Visual breakdown of the sentence parts */
  parts: SentencePart[];
  /** Additional notes about word order */
  notes?: string;
}

export interface SentencePart {
  /** Label for this part (e.g., "Main clause", "Subordinate clause") */
  label: string;
  /** The content or pattern */
  content: string;
  /** Whether this part is the focus */
  highlight?: boolean;
}

// ---------------------------------------------------------------------------
// Theme — a contextual grouping (Travel, Daily Life, etc.)
// ---------------------------------------------------------------------------

export interface Theme extends GraphNodeBase {
  type: "theme";
  /** Theme description */
  description: string;
  /** Conversational scenarios using words from this theme */
  conversations: Conversation[];
  /** Words commonly used in this theme */
  words: string[];
}

export interface Conversation {
  /** Title of the scenario */
  title: string;
  /** Context (e.g., "At the airport") */
  context: string;
  /** Dialog lines */
  lines: DialogLine[];
}

export interface DialogLine {
  /** Speaker identifier */
  speaker: string;
  /** German text */
  de: string;
  /** English translation */
  en: string;
  /** Words to highlight */
  highlight?: string[];
}

// ---------------------------------------------------------------------------
// Grammar Node — a grammar concept (stub-capable)
// ---------------------------------------------------------------------------

export interface GrammarNode extends GraphNodeBase {
  type: "grammar";
  /** Brief explanation */
  explanation?: string;
  /** Examples if available */
  examples?: Example[];
}

// ---------------------------------------------------------------------------
// Level Node — CEFR level node (stub-capable)
// ---------------------------------------------------------------------------

export interface LevelNode extends GraphNodeBase {
  type: "level";
  /** The CEFR level this represents */
  level: CEFRLevel;
  /** Description of this level */
  description?: string;
}

// ---------------------------------------------------------------------------
// Skill Node — a language skill (stub-capable)
// ---------------------------------------------------------------------------

export interface SkillNode extends GraphNodeBase {
  type: "skill";
  /** Description of the skill */
  description?: string;
}

// ---------------------------------------------------------------------------
// Mistake Node — a common mistake pattern (stub-capable)
// ---------------------------------------------------------------------------

export interface MistakeNode extends GraphNodeBase {
  type: "mistake";
  /** The mistakes */
  mistakes?: Mistake[];
}

// ---------------------------------------------------------------------------
// Union type for all nodes
// ---------------------------------------------------------------------------

export type GraphNode =
  | Concept
  | Word
  | Theme
  | GrammarNode
  | LevelNode
  | SkillNode
  | MistakeNode;

// ---------------------------------------------------------------------------
// Graph visualization types
// ---------------------------------------------------------------------------

export interface GraphEdge {
  /** Source node slug */
  source: string;
  /** Source node type */
  sourceType: NodeType;
  /** Target node slug */
  target: string;
  /** Target node type */
  targetType: NodeType;
  /** Relationship label */
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ---------------------------------------------------------------------------
// Search types
// ---------------------------------------------------------------------------

export interface SearchResult {
  slug: string;
  title: string;
  type: NodeType;
  summary: string;
  /** Relevance score (higher = better match) */
  score: number;
}

// ---------------------------------------------------------------------------
// Recent exploration (localStorage)
// ---------------------------------------------------------------------------

export interface RecentExploration {
  slug: string;
  type: NodeType;
  title: string;
  visitedAt: string; // ISO date string
}

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
