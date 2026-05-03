import type { GameConfig, SessionStats } from "../engine/types";
import GameCanvas from "./GameCanvas";

export default function GameScreen({ config, onBoss, onMenu }: { config: GameConfig; onBoss: (stats: SessionStats) => void; onMenu: () => void }) {
  return (
    <main className="screen">
      <GameCanvas config={config} onBoss={onBoss} onMenu={onMenu} />
    </main>
  );
}
