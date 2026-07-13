import Link from "next/link";
import type { BreadcrumbItem } from "@/types";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  compact?: boolean;
}

export function Breadcrumbs({ items, compact = false }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 ${compact ? "mb-3 text-xs" : "mb-8 text-sm"}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-dim)]" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
