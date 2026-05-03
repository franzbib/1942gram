import { useMemo, useState } from "react";
import type { GameConfig, GameResult } from "../engine/types";
import { loadStored } from "../utils/storage";

const stored = loadStored();
const levels = ["A2", "B1", "B2"] as const;
const modes = ["arcade", "training", "boss", "class"] as const;
const themes = [
  "vie-etudiante",
  "vie-quotidienne",
  "critique-culturelle",
  "argumentation",
  "presse-debat",
  "commentaire-litteraire",
  "relations-sociales",
  "travail-universitaire",
] as const;

function defaultVisualHints(level: GameConfig["level"], mode: GameConfig["mode"]) {
  if (level === "A2" && mode === "training") return "training";
  if (level === "A2" && mode === "arcade") return "training";
  return "off";
}

function readUrlConfig() {
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level")?.toUpperCase();
  const mode = params.get("mode");
  const theme = params.get("theme");
  const requiredScore = Number(params.get("requiredScore"));
  return {
    level: levels.includes(level as GameConfig["level"]) ? level as GameConfig["level"] : undefined,
    mode: modes.includes(mode as GameConfig["mode"]) ? mode as GameConfig["mode"] : undefined,
    theme: themes.includes(theme as GameConfig["theme"]) ? theme as GameConfig["theme"] : undefined,
    requiredScorePercent: Number.isFinite(requiredScore) ? Math.max(0, Math.min(100, requiredScore)) : undefined,
    embedded: params.get("embedded") === "true",
  };
}

export function useGameSession() {
  const urlConfig = readUrlConfig();
  const initialLevel = urlConfig.level ?? stored.last?.level ?? "B1";
  const initialMode = urlConfig.mode ?? stored.last?.mode ?? "arcade";
  const [screen, setScreen] = useState<"menu" | "game" | "boss" | "end" | "lexicon" | "help">("menu");
  const [config, setConfig] = useState<GameConfig>({
    level: initialLevel,
    mode: initialMode,
    theme: urlConfig.theme ?? stored.last?.theme ?? "argumentation",
    requiredScorePercent: urlConfig.requiredScorePercent,
    embedded: urlConfig.embedded,
    options: {
      autoFire: stored.options?.autoFire ?? false,
      readable: stored.options?.readable ?? false,
      reducedMotion: stored.options?.reducedMotion ?? false,
      muted: stored.options?.muted ?? true,
      visualHints: stored.options?.visualHints ?? defaultVisualHints(initialLevel, initialMode),
    },
  });
  const [result, setResult] = useState<GameResult | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID?.() ?? String(Date.now()), [screen === "game"]);
  return { screen, setScreen, config, setConfig, result, setResult, sessionId };
}
