import type { CefrLevel } from "../engine/types";

export default function DifficultyBadge({ level }: { level: CefrLevel }) {
  return <span className={`badge level-${level.toLowerCase()}`}>{level}</span>;
}
