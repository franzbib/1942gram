import { useEffect, useRef } from "react";

export function useTouchControls() {
  const target = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const prevent = (event: TouchEvent) => {
      if ((event.target as HTMLElement)?.closest?.("[data-gameplay]")) event.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, []);

  return target;
}
