export const GAME_VERSION = "0.9.0";

export const SCORING = {
  destroyPejorative: 100,
  protectMeliorative: 75,
  absorbBonus: 150,
  correctAmbivalent: 200,
  shootMeliorative: -250,
  missPejorative: -100,
  shootNeutral: -50,
  shootBonus: -50,
  wrongAmbivalent: -150,
} as const;

export const SUCCESS_THRESHOLDS = {
  minScorePercent: 70,
  maxMeliorativesDestroyed: 3,
  minPrecision: 0.6,
} as const;

export const GAME_SIZE = {
  width: 960,
  height: 620,
  playerY: 540,
  maxObjects: 18,
  bossAfterSeconds: 90,
  bossAfterProcessed: 42,
} as const;
