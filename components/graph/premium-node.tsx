import { Handle, Position } from "@xyflow/react";
import type { NodeType } from "@/types";

export type PremiumNodeData = {
  label: string;
  slug: string;
  type: NodeType;
  status: string;
  levels?: string[];
  isHovered: boolean;
  isDimmed: boolean;
};

export function PremiumNode({ data }: { data: PremiumNodeData }) {
  const { label, type, levels, isHovered, isDimmed } = data;

  const typeColors: Record<string, string> = {
    concept: "var(--color-concept)",
    word: "var(--color-word)",
    theme: "var(--color-theme)",
    grammar: "var(--color-grammar)",
    level: "var(--color-level)",
    skill: "var(--color-skill)",
    mistake: "var(--color-mistake)",
  };

  const color = typeColors[type] || "var(--color-accent)";

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-300 ease-in-out shadow-sm
        ${isHovered ? "z-50 shadow-xl scale-105" : "z-10"}
        ${isDimmed ? "opacity-20 scale-95" : "opacity-100"}
      `}
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: isHovered ? color : "var(--color-border)",
        boxShadow: isHovered ? `0 8px 30px ${color}33` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <div className="px-4 py-2 flex flex-col gap-1 items-center justify-center min-w-[120px]">
        {/* Node Type Dot & Levels */}
        <div className="flex items-center gap-1.5 w-full justify-center">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {levels?.map((lvl) => (
            <span
              key={lvl}
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[var(--color-surface)] text-[var(--color-text-muted)]`}
              style={{ color: color }}
            >
              {lvl}
            </span>
          ))}
        </div>

        {/* Node Label */}
        <span
          className="text-sm font-semibold text-[var(--color-text)] whitespace-nowrap"
          style={{ fontFamily: type === "word" ? "monospace" : "inherit" }}
        >
          {label}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}
