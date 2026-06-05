import { Level, LEVEL_COLORS } from "@/types";

export function LevelBadge({ level }: { level: Level }) {
  const { bg, text, label } = LEVEL_COLORS[level];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}