import { useMemo, useState } from "react";
import { getBosses } from "../data/bossTexts";
import { SCORING } from "../engine/constants";
import { buildResult } from "../engine/scoring";
import type { GameConfig, GameResult, SessionStats } from "../engine/types";
import { choice } from "../utils/random";

export default function BossTextPhase({
  config,
  baseStats,
  onComplete,
}: {
  config: GameConfig;
  baseStats: SessionStats;
  onComplete: (result: GameResult) => void;
}) {
  const boss = useMemo(() => choice(getBosses(config.level, config.theme)), [config.level, config.theme]);
  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const targetWords = boss.targets.filter((t) => t.category === "pejorative").map((t) => t.word.toLocaleLowerCase("fr"));
  const tokens = boss.text.split(/(\s+|[,.!?;:])/).filter(Boolean);
  const toggle = (token: string) => {
    const clean = token.toLocaleLowerCase("fr").replace(/[^\p{L}'-]/gu, "");
    if (!clean) return;
    setSelected((items) => items.includes(clean) ? items.filter((i) => i !== clean) : [...items, clean]);
  };
  const finish = () => {
    const stats = { ...baseStats, review: [...baseStats.review] };
    const good = targetWords.filter((word) => selected.includes(word)).length;
    const extra = selected.filter((word) => !targetWords.includes(word)).length;
    stats.correct += good;
    stats.mistakes += extra;
    stats.score += good * SCORING.destroyPejorative - extra * 80;
    const reformOk = !boss.reformulationQuestion || choiceIndex === boss.reformulationQuestion.correctIndex;
    if (boss.reformulationQuestion && !reformOk) {
      stats.mistakes += 1;
      stats.review.unshift({ item: { id: "boss-reformulation", text: "reformulation", category: "neutral", level: config.level, themes: [config.theme], explanation: boss.reformulationQuestion.explanation }, reason: "La reformulation choisie ne gardait pas assez la nuance universitaire." });
    }
    stats.bossCompleted = good === targetWords.length && extra === 0 && reformOk;
    onComplete(buildResult(stats, config));
  };

  return (
    <main className="boss-screen">
      <section className="boss-panel">
        <div className="kicker">Boss textuel</div>
        <h1>{boss.title}</h1>
        {phase === 1 ? (
          <>
            <p className="boss-instruction">Repérez les mots qui orientent fortement le jugement négatif.</p>
            <div className="boss-text">
              {tokens.map((token, index) => {
                const clean = token.toLocaleLowerCase("fr").replace(/[^\p{L}'-]/gu, "");
                const active = selected.includes(clean);
                return /\s+/.test(token) ? token : <button key={`${token}-${index}`} className={active ? "token selected" : "token"} onClick={() => toggle(token)}>{token}</button>;
              })}
            </div>
            <div className="boss-targets">
              {boss.targets.map((target) => <span key={target.word}>{target.word}: {target.explanation}</span>)}
            </div>
            <button className="primary" onClick={() => setPhase(2)}>Valider le repérage</button>
          </>
        ) : (
          <>
            <p className="boss-instruction">{boss.reformulationQuestion?.prompt ?? "Confirmez la neutralisation du texte."}</p>
            {boss.reformulationQuestion ? (
              <div className="choices">
                {boss.reformulationQuestion.choices.map((text, index) => (
                  <button key={text} className={choiceIndex === index ? "selected" : ""} onClick={() => setChoiceIndex(index)}>{text}</button>
                ))}
              </div>
            ) : null}
            <button className="primary" disabled={boss.reformulationQuestion ? choiceIndex === null : false} onClick={finish}>Terminer la mission</button>
          </>
        )}
      </section>
    </main>
  );
}
