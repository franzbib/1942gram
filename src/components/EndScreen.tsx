import { levelObjectives } from "../data/levels";
import type { GameResult } from "../engine/types";
import { pct } from "../utils/text";

export default function EndScreen({
  result,
  onReplay,
  onMenu,
  onLexicon,
  onBossOnly,
}: {
  result: GameResult;
  onReplay: () => void;
  onMenu: () => void;
  onLexicon: () => void;
  onBossOnly: () => void;
}) {
  const exportText = [
    `Mission Nuance - ${result.success ? "réussite" : "à renforcer"}`,
    `Niveau: ${result.level} | Mode: ${result.mode} | Thème: ${result.theme}`,
    `Objectif CECRL: ${levelObjectives[result.level]}`,
    `Score: ${result.score} | Réussite: ${result.scorePercent}%`,
    `Précision: ${pct(result.precision)} | Discernement: ${pct(result.discernment)}`,
    `Mots péjoratifs neutralisés: ${result.pejorativesDestroyed}`,
    `Mots mélioratifs protégés: ${result.meliorativesProtected}`,
    `À revoir: ${result.review.slice(0, 5).map((r) => r.item.text).join(", ") || "aucun mot prioritaire"}`,
  ].join("\n");
  return (
    <main className="end-screen">
      <section className="result-panel">
        <div className="kicker">Bilan pédagogique</div>
        <h1>{result.success ? "Mission accomplie" : "Nuance à consolider"}</h1>
        <p>{result.success ? "Vous avez reconnu les jugements forts et conservé la critique formulée." : "La partie est terminée, mais certaines connotations demandent encore de l'attention."}</p>
        <p className="cefr-note"><strong>Objectif {result.level} :</strong> {levelObjectives[result.level]}</p>
        <div className="metrics">
          <div><span>Score</span><strong>{result.score}</strong></div>
          <div><span>Réussite</span><strong>{result.scorePercent} %</strong></div>
          <div><span>Précision</span><strong>{pct(result.precision)}</strong></div>
          <div><span>Discernement</span><strong>{pct(result.discernment)}</strong></div>
          <div><span>Puissance argumentative</span><strong>{pct(result.argumentPower)}</strong></div>
          <div><span>Combo max</span><strong>x{Math.max(1, result.comboMax)}</strong></div>
        </div>
        <div className="review-grid">
          <div>
            <h2>Actions clés</h2>
            <p>Péjoratifs neutralisés : {result.pejorativesDestroyed}</p>
            <p>Mélioratifs protégés : {result.meliorativesProtected}</p>
            <p>Bonus absorbés : {result.bonusAbsorbed}</p>
            <p>Boss terminé : {result.bossCompleted ? "oui" : "non"}</p>
          </div>
          <div>
            <h2>5 mots à revoir</h2>
            {result.review.slice(0, 5).map((entry) => (
              <p key={`${entry.item.id}-${entry.reason}`}><strong>{entry.item.text}</strong> - {entry.reason}</p>
            ))}
            {!result.review.length && <p>Aucune erreur lexicale majeure dans cette partie.</p>}
          </div>
        </div>
        <textarea readOnly value={exportText} aria-label="Bilan exportable" />
        <div className="row wrap">
          <button className="primary" onClick={onReplay}>Rejouer</button>
          <button onClick={onMenu}>Changer de niveau</button>
          <button onClick={onLexicon}>Voir le lexique</button>
          <button onClick={onBossOnly}>Boss seulement</button>
          <button className="secondary" onClick={onMenu}>Retour menu</button>
        </div>
      </section>
    </main>
  );
}
