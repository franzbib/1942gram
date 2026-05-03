import type { GameConfig, GameResult, SessionStats } from "../engine/types";
import GameCanvas from "./GameCanvas";

export default function GameScreen({
  config,
  onBoss,
  onMenu,
  onGameOver,
}: {
  config: GameConfig;
  onBoss: (stats: SessionStats) => void;
  onMenu: () => void;
  onGameOver: (result: GameResult) => void;
}) {
  return (
    <main className="screen">
      <GameCanvas config={config} onBoss={onBoss} onMenu={onMenu} onGameOver={onGameOver} />
    </main>
  );
}
