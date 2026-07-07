import type { GrammarTable } from "@/types";

interface PremiumGrammarTableProps {
  table: GrammarTable;
}

export function PremiumGrammarTable({ table }: PremiumGrammarTableProps) {
  return (
    <div className="my-6">
      {table.title && (
        <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">
          {table.title}
        </h4>
      )}
      <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--color-accent)]/10">
                {table.headers.map((header, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 font-semibold text-[var(--color-accent)] whitespace-nowrap ${
                      i === 0 ? "border-r border-[var(--color-border)]/50" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {table.rows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-[var(--color-surface)] transition-colors group"
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-text-secondary)] whitespace-nowrap border-r border-[var(--color-border)]/50 group-hover:text-[var(--color-text)] transition-colors">
                    {row.label}
                  </td>
                  {row.values.map((val, j) => (
                    <td
                      key={j}
                      className="px-5 py-3 font-mono text-[var(--color-text-muted)] whitespace-nowrap group-hover:text-[var(--color-word)] transition-colors"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
