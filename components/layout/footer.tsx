import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-word)] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">G</span>
          </div>
          <span className="text-sm text-[var(--color-text-muted)]">
            GermanHub — Explore the language
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-[var(--color-text-dim)]">
          <Link href="/" className="hover:text-[var(--color-text-secondary)] transition-colors">
            Home
          </Link>
          <Link href="/graph" className="hover:text-[var(--color-text-secondary)] transition-colors">
            Graph
          </Link>
          <Link href="/concept/expressing-reasons" className="hover:text-[var(--color-text-secondary)] transition-colors">
            Concepts
          </Link>
        </nav>
      </div>
    </footer>
  );
}
