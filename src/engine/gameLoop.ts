export type LoopHandle = { stop: () => void };

export function startGameLoop(tick: (now: number) => void): LoopHandle {
  let raf = 0;
  const frame = (now: number) => {
    tick(now);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { stop: () => cancelAnimationFrame(raf) };
}
