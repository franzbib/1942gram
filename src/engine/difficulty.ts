import type { CefrLevel, GameMode } from "./types";

export const levelSettings = {
  A2: { speed: 0.78, spawnMs: 1400, neutralRate: 0.03, ambivalentRate: 0, help: 1 },
  B1: { speed: 1, spawnMs: 1150, neutralRate: 0.16, ambivalentRate: 0.05, help: 0.65 },
  B2: { speed: 1.22, spawnMs: 920, neutralRate: 0.19, ambivalentRate: 0.12, help: 0.35 },
} as const satisfies Record<CefrLevel, { speed: number; spawnMs: number; neutralRate: number; ambivalentRate: number; help: number }>;

export const modeSettings = {
  arcade: { speed: 1, spawn: 1, explanationMs: 1700, readableScale: 1 },
  training: { speed: 0.76, spawn: 1.25, explanationMs: 3600, readableScale: 1.06 },
  boss: { speed: 0.8, spawn: 1.2, explanationMs: 2600, readableScale: 1.05 },
  class: { speed: 0.62, spawn: 1.45, explanationMs: 4200, readableScale: 1.24 },
} as const satisfies Record<GameMode, { speed: number; spawn: number; explanationMs: number; readableScale: number }>;

export function getDifficulty(level: CefrLevel, mode: GameMode) {
  const l = levelSettings[level];
  const m = modeSettings[mode];
  return {
    speed: l.speed * m.speed,
    spawnMs: l.spawnMs * m.spawn,
    help: Math.max(l.help, mode === "training" || mode === "class" ? 0.8 : 0),
    explanationMs: m.explanationMs,
    readableScale: m.readableScale,
  };
}
