import { GAME_VERSION, SUCCESS_THRESHOLDS } from "./constants";
import type { GameResult } from "./types";

declare global {
  interface Window {
    MissionNuance?: {
      CONTRACT: {
        gameId: "mission-nuance";
        version: string;
        completeEventName: "missionNuance:complete";
        completeMessageType: "mission-nuance:complete";
        minScorePercent: number;
        requiredLevel: "B2";
      };
    };
  }
}

export const CONTRACT = {
  gameId: "mission-nuance",
  version: GAME_VERSION,
  completeEventName: "missionNuance:complete",
  completeMessageType: "mission-nuance:complete",
  minScorePercent: SUCCESS_THRESHOLDS.minScorePercent,
  requiredLevel: "B2",
} as const;

window.MissionNuance = { CONTRACT };

const dispatchedSessions = new Set<string>();

export function safeDispatchCompletion(result: GameResult) {
  const sessionKey = `${result.timestamp}:${result.score}:${result.level}:${result.mode}`;
  const basePayload = {
    gameId: CONTRACT.gameId,
    version: CONTRACT.version,
    success: result.success,
    level: result.level,
    mode: result.mode,
    theme: result.theme,
    score: result.score,
    scorePercent: result.scorePercent,
    precision: result.precision,
    discernment: result.discernment,
    bossCompleted: result.bossCompleted,
    timestamp: result.timestamp,
  };

  if (result.success && !dispatchedSessions.has(sessionKey)) {
    dispatchedSessions.add(sessionKey);
    window.dispatchEvent(new CustomEvent(CONTRACT.completeEventName, { detail: basePayload }));
    window.parent?.postMessage({ type: CONTRACT.completeMessageType, payload: basePayload }, "*");
  } else if (!result.success) {
    window.dispatchEvent(new CustomEvent("missionNuance:game-over", { detail: basePayload }));
    window.parent?.postMessage({ type: "mission-nuance:game-over", payload: basePayload }, "*");
  }
}
