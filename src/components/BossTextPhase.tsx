import { useMemo, useState } from "react";
import { getBosses } from "../data/bossTexts";
import { SCORING } from "../engine/constants";
import { buildResult } from "../engine/scoring";
import type { GameConfig, GameResult, SessionStats } from "../engine/types";
import { choice } from "../utils/random";

type BossPick = { correct: boolean; explanation: string };

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
  const [selected, setSelected] = useState<Record<string, BossPick>>({});
  const [phase, setPhase] = useState<1 | 2>(1);
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const targetMap = new Map(
    boss.targets
      .filter((target) => target.category === "pejorative")
      .map((target) => [target.word.toLocaleLowerCase("fr"), target.explanation]),
  );
  const targetWords = [...targetMap.keys()];
  const tokens = boss.text.split(/(\s+|[,.!?;:])/).filter(Boolean);

  const toggle = (token: string) => {
    const clean = token.toLocaleLowerCase("fr").replace(/[^\p{L}'-]/gu, "");
    if (!clean || selected[clean]) return;
    const explanation = targetMap.get(clean);
    setSelected((items) => ({
      ...items,
      [clean]: {
        correct: Boolean(explanation),
        explanation: explanation ?? `« ${clean} » n'est pas la cible principale ici : il faut repérer les mots qui orientent fortement le jugement.`,
      },
    }));
  };

  const finish = () => {
    const stats = { ...baseStats, review: [...baseStats.review] };
    const picked = Object.entries(selected);
    const good = picked.filter(([, pick]) => pick.correct).length;
    const extra = picked.filter(([, pick]) => !pick.correct).length;
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
            <p className="boss-instruction">Repérez les mots qui orientent fortement le jugement négatif. Les mots ne sont pas pré-colorés : cliquez après lecture.</p>
            <div className="boss-text">
              {tokens.map((token, index) => {
                const clean = token.toLocaleLowerCase("fr").replace(/[^\p{L}'-]/gu, "");
                const pick = selected[clean];
                const className = pick ? `token revealed ${pick.correct ? "correct" : "incorrect"}` : "token";
                return /\s+/.test(token) ? token : <button key={`${token}-${index}`} className={className} onClick={() => toggle(token)}>{token}</button>;
              })}
            </div>
            <div className="boss-targets">
              {Object.entries(selected).length === 0 && <span>Feedback après clic : la couleur n'apparaît qu'une fois votre décision prise.</span>}
              {Object.entries(selected).map(([word, pick]) => <span key={word}>{word}: {pick.explanation}</span>)}
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
