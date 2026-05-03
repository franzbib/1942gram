import { useMemo, useState } from "react";
import type { GameConfig, GameResult } from "../engine/types";
import { loadStored } from "../utils/storage";

const stored = loadStored();

function defaultVisualHints(level: GameConfig["level"], mode: GameConfig["mode"]) {
  if (level === "A2" && mode === "training") return "training";
  if (level === "A2" && mode === "arcade") return "training";
  return "off";
}

export function useGameSession() {
  const [screen, setScreen] = useState<"menu" | "game" | "boss" | "end" | "lexicon" | "help">("menu");
  const [config, setConfig] = useState<GameConfig>({
    level: stored.last?.level ?? "B1",
    mode: stored.last?.mode ?? "arcade",
    theme: stored.last?.theme ?? "argumentation",
    options: {
      autoFire: stored.options?.autoFire ?? false,
      readable: stored.options?.readable ?? false,
      reducedMotion: stored.options?.reducedMotion ?? false,
      muted: stored.options?.muted ?? true,
      visualHints: stored.options?.visualHints ?? defaultVisualHints(stored.last?.level ?? "B1", stored.last?.mode ?? "arcade"),
    },
  });
  const [result, setResult] = useState<GameResult | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID?.() ?? String(Date.now()), [screen === "game"]);
  return { screen, setScreen, config, setConfig, result, setResult, sessionId };
}
