import { useEffect, useRef } from "react";

export type ControlState = { left: boolean; right: boolean; up: boolean; down: boolean; fire: boolean; protect: boolean; pause: boolean };

export function useKeyboardControls(onPause?: () => void, onRestart?: () => void) {
  const keys = useRef<ControlState>({ left: false, right: false, up: false, down: false, fire: false, protect: false, pause: false });

  useEffect(() => {
    const set = (event: KeyboardEvent, value: boolean) => {
      const k = event.key.toLowerCase();
      if (["arrowleft", "q", "a"].includes(k)) keys.current.left = value;
      if (["arrowright", "d"].includes(k)) keys.current.right = value;
      if (["arrowup", "z", "w"].includes(k)) keys.current.up = value;
      if (["arrowdown", "s"].includes(k)) keys.current.down = value;
      if (k === " ") keys.current.fire = value;
      if (["e", "enter", "shift"].includes(k)) keys.current.protect = value;
      if (value && (k === "p" || k === "escape")) onPause?.();
      if (value && k === "r") onRestart?.();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "enter"].includes(k)) event.preventDefault();
    };
    const down = (event: KeyboardEvent) => set(event, true);
    const up = (event: KeyboardEvent) => set(event, false);
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onPause, onRestart]);

  return keys;
}
