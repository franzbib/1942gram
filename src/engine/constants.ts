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

export const BASE_INITIAL_HEALTH = 100;

export const BASE_DAMAGE_BY_LEVEL = {
  A2: 12,
  B1: 15,
  B2: 18,
} as const;

export const WEAPON_LOCK_BY_LEVEL = {
  A2: 900,
  B1: 1200,
  B2: 1500,
} as const;

export const MAX_WEAPON_LOCK_MS = 2500;

export const WORD_VISUAL_SCALE = {
  normal: 0.78,
  readable: 0.88,
} as const;

export const GAME_SIZE = {
  width: 960,
  height: 620,
  playerY: 540,
  baseY: 574,
  maxObjects: 18,
  bossAfterSeconds: 90,
  bossAfterProcessed: 42,
} as const;
