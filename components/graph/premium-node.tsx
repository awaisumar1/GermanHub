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
  const { label, slug, type, levels, isHovered, isDimmed } = data;

  const typeColors: Record<string, string> = {
    concept: "var(--color-concept)",
    word: "var(--color-word)",
    theme: "var(--color-theme)",
    grammar: "var(--color-grammar)",
    level: "var(--color-level)",
    skill: "var(--color-skill)",
    mistake: "var(--color-mistake)",
  };

  const typeColor = typeColors[type] || "var(--color-accent)";
  const highlightColor = "var(--color-accent)";

  const isFocal = slug === "expressing-reasons";
  // Secondary nodes are usually those expanded later or explicitly farther like modal-verbs
  const isSecondary = slug === "modal-verbs" || !["weil", "denn", "deshalb", "deswegen", "daher", "sentence-order", "subordinate-clause", "conjunction", "travel", "expressing-reasons"].includes(slug);

  // Sizing tiers
  const paddingClass = isFocal ? "px-6 py-4" : isSecondary ? "px-3 py-1.5" : "px-4 py-2";
  const textClass = isFocal ? "text-base font-bold" : isSecondary ? "text-xs font-medium" : "text-sm font-semibold";
  const minWidth = isFocal ? "min-w-[160px]" : isSecondary ? "min-w-[100px]" : "min-w-[120px]";
  const maxWidth = isFocal ? "max-w-[200px]" : isSecondary ? "max-w-[140px]" : "max-w-[160px]";

  return (
    <div
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      className={`relative rounded-xl border-2 transition-all duration-300 ease-in-out outline-none
        ${isHovered || isFocal ? "z-50" : "z-10"}
        ${isHovered ? "scale-105" : "scale-100"}
        ${isDimmed ? "opacity-20 scale-95" : "opacity-100"}
        ${isFocal ? "shadow-md" : "shadow-sm"}
      `}
      style={{
        backgroundColor: isFocal ? "color-mix(in srgb, var(--color-surface) 95%, var(--color-accent) 5%)" : "var(--color-surface)",
        borderColor: isHovered || isFocal ? highlightColor : "var(--color-border)",
        boxShadow: isHovered ? `0 8px 30px ${highlightColor}33` : isFocal ? `0 4px 15px ${highlightColor}22` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <div className={`flex flex-col gap-1 items-center justify-center ${paddingClass} ${minWidth} ${maxWidth}`}>
        {isFocal && (
          <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--color-accent)] mb-0.5">
            Core Concept
          </span>
        )}
        
        {/* Node Type Dot & Inline Levels */}
        <div className="flex items-center gap-1.5 w-full justify-center">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: typeColor }}
          />
          {levels && levels.length > 0 && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-dim)]"
            >
              {levels.join(", ")}
            </span>
          )}
        </div>

        {/* Node Label */}
        <span
          className={`${textClass} text-[var(--color-text)] text-center break-words leading-tight`}
          style={{ fontFamily: type === "word" ? "monospace" : "inherit" }}
        >
          {label}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}
