import { useEffect } from "react";
import BossTextPhase from "./components/BossTextPhase";
import EndScreen from "./components/EndScreen";
import GameScreen from "./components/GameScreen";
import HelpModal from "./components/HelpModal";
import LexiconReview from "./components/LexiconReview";
import StartMenu from "./components/StartMenu";
import { initialStats } from "./engine/scoring";
import { safeDispatchCompletion } from "./engine/integrationContract";
import type { SessionStats } from "./engine/types";
import { useGameSession } from "./hooks/useGameSession";
import { saveOptions, saveResult } from "./utils/storage";

export default function App() {
  const { screen, setScreen, config, setConfig, result, setResult } = useGameSession();
  const baseStats = (window as Window & { __mnStats?: SessionStats }).__mnStats ?? initialStats();

  useEffect(() => {
    document.body.classList.toggle("embedded", Boolean(config.embedded));
    return () => document.body.classList.remove("embedded");
  }, [config.embedded]);

  const start = (nextConfig = config) => {
    if (nextConfig !== config) setConfig(nextConfig);
    saveOptions(nextConfig.options);
    (window as Window & { __mnStats?: SessionStats }).__mnStats = initialStats();
    setScreen(nextConfig.mode === "boss" ? "boss" : "game");
  };
  const complete = (nextResult: NonNullable<typeof result>) => {
    setResult(nextResult);
    saveResult(nextResult);
    safeDispatchCompletion(nextResult);
    setScreen("end");
  };
  const goBoss = (stats: SessionStats) => {
    (window as Window & { __mnStats?: SessionStats }).__mnStats = { ...stats, review: stats.review.slice(0, 12) };
    setScreen("boss");
  };

  if (screen === "help") return <HelpModal onBack={() => setScreen("menu")} />;
  if (screen === "lexicon") return <LexiconReview onBack={() => setScreen(result ? "end" : "menu")} />;
  if (screen === "game") return <GameScreen config={config} onBoss={goBoss} onMenu={() => setScreen("menu")} onGameOver={complete} />;
  if (screen === "boss") return <BossTextPhase config={config} baseStats={baseStats} onComplete={complete} />;
  if (screen === "end" && result) {
    return (
      <EndScreen
        result={result}
        onReplay={start}
        onMenu={() => setScreen("menu")}
        onLexicon={() => setScreen("lexicon")}
        onBossOnly={() => {
          setConfig({ ...config, mode: "boss" });
          (window as Window & { __mnStats?: SessionStats }).__mnStats = initialStats();
          setScreen("boss");
        }}
      />
    );
  }
  return <StartMenu config={config} setConfig={setConfig} onPlay={start} onLexicon={() => setScreen("lexicon")} onHelp={() => setScreen("help")} />;
}
