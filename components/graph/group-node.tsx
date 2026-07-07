import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
  color?: string;
  isHovered: boolean;
  isDimmed: boolean;
  zoomLevel: "macro" | "medium" | "micro";
};

export const GroupNode = memo(function GroupNode({
  data,
  selected,
}: {
  data: GroupNodeData;
  selected?: boolean;
}) {
  const { label, color = "var(--color-accent)", isHovered, isDimmed, zoomLevel } = data;

  const isActive = isHovered || selected;

  // At macro zoom, the group node looks like a solid anchor.
  // At medium/micro, it becomes a translucent bounding box container.
  const isMacro = zoomLevel === "macro";

  return (
    <div
      className={`relative rounded-2xl transition-all duration-500 ease-in-out border-2
        ${isActive ? "z-0" : "-z-10"}
        ${isDimmed ? "opacity-10" : "opacity-100"}
        ${isMacro ? "flex items-center justify-center shadow-lg" : "pt-4 px-4 pb-4 shadow-sm"}
      `}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: isMacro ? `color-mix(in srgb, ${color} 90%, black)` : `${color}11`,
        borderColor: isActive ? color : isMacro ? color : `${color}44`,
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />

      {/* Label rendering varies by zoom level */}
      {isMacro ? (
        <div className="text-center px-6 py-4">
          <span className="text-2xl font-bold text-white tracking-wide">
            {label}
          </span>
        </div>
      ) : (
        <div
          className="absolute top-0 left-6 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
          style={{
            backgroundColor: "var(--color-bg)",
            color: color,
            borderColor: color,
          }}
        >
          {label}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});
