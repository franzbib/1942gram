import type { CefrLevel, GameMode } from "./types";
import { getDifficulty } from "./difficulty";

export function nextSpawnDelay(level: CefrLevel, mode: GameMode, processed: number) {
  const base = getDifficulty(level, mode).spawnMs;
  const pressure = Math.max(0.72, 1 - processed * 0.006);
  return base * pressure;
}
