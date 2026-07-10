import Link from "next/link";
import { Construction, ArrowRight, Network, BookOpen } from "lucide-react";
import { getNodeBySlug } from "@/lib/data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContinueExploring } from "@/components/layout/continue-exploring";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Follow a Curated Route — GermanHub",
  description:
    "A thoughtfully selected journey through German — connecting concepts, grammar, and themes in a coherent sequence.",
};

// Curated entry points for the guided route — only real vertical-slice nodes
const GUIDED_ENTRY_SLUGS = [
  { slug: "expressing-reasons", type: "concept" as const },
  { slug: "weil",               type: "word"    as const },
  { slug: "denn",               type: "word"    as const },
  { slug: "deshalb",            type: "word"    as const },
  { slug: "travel",             type: "theme"   as const },
  { slug: "daily-life",         type: "theme"   as const },
];

export default function GuidedExplorePage() {
  const relatedItems = GUIDED_ENTRY_SLUGS
    .map(({ slug, type }) => {
      const node = getNodeBySlug(slug, type);
      if (!node) return null;
      return { slug: node.slug, type: node.type, title: node.title, summary: node.summary };
    })
    .filter((n) => n !== null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Explore" },
          { label: "Follow a Curated Route" },
        ]}
      />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[var(--color-skill)]" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            Exploration Mode
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3">
          Follow a Curated Route
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
          A connected, thoughtfully selected journey through German — weaving concepts,
          grammar rules, and real-life themes into a coherent sequence.
        </p>
      </header>

      {/* Coming Soon card */}
      <section className="mb-14">
        <div className="card-base p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center mx-auto mb-5">
            <Construction className="w-7 h-7 text-[var(--color-accent)]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            Curated Routes Coming Soon
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto mb-6 leading-relaxed">
            We&apos;re designing a guided experience that lets you follow a connected path
            through the knowledge graph — from your first concept to advanced grammar, with
            context and connections preserved at every step.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto mb-8 leading-relaxed">
            In the meantime, the best place to begin is the{" "}
            <Link
              href="/concept/expressing-reasons"
              className="text-[var(--color-accent)] hover:underline"
            >
              Expressing Reasons
            </Link>{" "}
            concept — our most complete vertical slice, covering weil, denn, deshalb,
            deswegen, and daher across A2 and B1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/concept/expressing-reasons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors duration-200"
            >
              Start with Expressing Reasons
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-accent-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
            >
              <Network className="w-3.5 h-3.5" aria-hidden="true" />
              Explore the Graph
            </Link>
          </div>
        </div>
      </section>

      {/* Active exploration links — no dead end */}
      <ContinueExploring
        items={relatedItems}
        title="Explore the Vertical Slice"
      />
    </div>
  );
}
