import { BASE_INITIAL_HEALTH, SCORING, SUCCESS_THRESHOLDS } from "./constants";
import type { GameConfig, GameResult, SessionStats } from "./types";

export const initialStats = (): SessionStats => ({
  score: 0,
  correct: 0,
  mistakes: 0,
  shots: 0,
  hits: 0,
  pejorativesDestroyed: 0,
  meliorativesProtected: 0,
  meliorativesDestroyed: 0,
  pejorativesMissed: 0,
  pejorativesHitBase: 0,
  neutralShot: 0,
  bonusAbsorbed: 0,
  ambivalentResolved: 0,
  baseHealth: BASE_INITIAL_HEALTH,
  weaponLocks: 0,
  comboMax: 0,
  wordsProcessed: 0,
  review: [],
  bossCompleted: false,
});

export function scorePercent(stats: SessionStats) {
  const raw = 55 + stats.correct * 4 - stats.mistakes * 7 + Math.min(25, stats.score / 450);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function precision(stats: SessionStats) {
  return stats.shots === 0 ? 1 : Math.max(0, Math.min(1, stats.hits / stats.shots));
}

export function discernment(stats: SessionStats) {
  const total = stats.correct + stats.mistakes;
  return total === 0 ? 1 : Math.max(0, stats.correct / total);
}

export function argumentPower(stats: SessionStats) {
  return Math.max(0, Math.min(1, (stats.bonusAbsorbed * 0.12 + stats.ambivalentResolved * 0.16 + stats.comboMax * 0.04)));
}

export function buildResult(stats: SessionStats, config: GameConfig): GameResult {
  const pct = scorePercent(stats);
  const prec = precision(stats);
  const disc = discernment(stats);
  const success =
    pct >= SUCCESS_THRESHOLDS.minScorePercent &&
    stats.bossCompleted &&
    stats.baseHealth > 0 &&
    stats.meliorativesDestroyed <= SUCCESS_THRESHOLDS.maxMeliorativesDestroyed &&
    prec >= SUCCESS_THRESHOLDS.minPrecision;
  return {
    ...stats,
    level: config.level,
    mode: config.mode,
    theme: config.theme,
    scorePercent: pct,
    precision: prec,
    discernment: disc,
    argumentPower: argumentPower(stats),
    success,
    timestamp: new Date().toISOString(),
  };
}

export { SCORING };
