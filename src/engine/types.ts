export type WordCategory = "pejorative" | "meliorative" | "neutral" | "bonus" | "ambivalent";
export type CefrLevel = "A2" | "B1" | "B2";
export type GameMode = "arcade" | "training" | "boss" | "class";
export type ThemeId =
  | "vie-etudiante"
  | "vie-quotidienne"
  | "critique-culturelle"
  | "argumentation"
  | "presse-debat"
  | "commentaire-litteraire"
  | "relations-sociales"
  | "travail-universitaire";

export type BonusEffect =
  | "slowMotion"
  | "wideShot"
  | "shield"
  | "revealCategories"
  | "contextReveal"
  | "scoreMultiplier"
  | "neutralizeOneError"
  | "precisionBeam"
  | "freezePejoratives"
  | "convertPejorativeToNeutral";

export type LexicalItem = {
  id: string;
  text: string;
  category: WordCategory;
  level: CefrLevel;
  themes: ThemeId[];
  example?: string;
  explanation: string;
  neutralEquivalent?: string;
  opposite?: string;
  bonusEffect?: BonusEffect;
  contextExamples?: {
    sentence: string;
    value: "pejorative" | "meliorative" | "neutral";
    explanation: string;
  }[];
};

export type BossText = {
  id: string;
  level: CefrLevel;
  theme: ThemeId;
  title: string;
  text: string;
  targets: {
    word: string;
    category: "pejorative" | "meliorative" | "neutral";
    explanation: string;
  }[];
  reformulationQuestion?: {
    original: string;
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
};

export type GameOptions = {
  autoFire: boolean;
  readable: boolean;
  reducedMotion: boolean;
  muted: boolean;
  visualHints: "off" | "training" | "full";
};

export type GameConfig = {
  level: CefrLevel;
  mode: GameMode;
  theme: ThemeId;
  options: GameOptions;
};

export type ReviewEntry = {
  item: LexicalItem;
  reason: string;
};

export type SessionStats = {
  score: number;
  correct: number;
  mistakes: number;
  shots: number;
  hits: number;
  pejorativesDestroyed: number;
  meliorativesProtected: number;
  meliorativesDestroyed: number;
  pejorativesMissed: number;
  neutralShot: number;
  bonusAbsorbed: number;
  ambivalentResolved: number;
  comboMax: number;
  wordsProcessed: number;
  review: ReviewEntry[];
  bossCompleted: boolean;
};

export type GameResult = SessionStats & {
  level: CefrLevel;
  mode: GameMode;
  theme: ThemeId;
  scorePercent: number;
  precision: number;
  discernment: number;
  argumentPower: number;
  success: boolean;
  timestamp: string;
};
