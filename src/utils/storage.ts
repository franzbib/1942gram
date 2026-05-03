import type { CefrLevel, GameOptions, GameResult } from "../engine/types";

const key = "mission-nuance:v0.9";

type Stored = {
  best: Partial<Record<CefrLevel, number>>;
  options?: Partial<GameOptions>;
  last?: Partial<Pick<GameResult, "level" | "mode" | "theme">>;
};

function read(): Stored {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Stored;
  } catch {
    return { best: {} };
  }
}

function write(data: Stored) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // LocalStorage is optional for embedded/offline contexts.
  }
}

export function loadStored() {
  return read();
}

export function saveOptions(options: Partial<GameOptions>) {
  const data = read();
  write({ ...data, options: { ...data.options, ...options } });
}

export function saveResult(result: GameResult) {
  const data = read();
  const best = Math.max(data.best?.[result.level] ?? 0, result.score);
  write({ ...data, best: { ...data.best, [result.level]: best }, last: result });
}
