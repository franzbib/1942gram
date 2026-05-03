import { discernment, precision } from "../engine/scoring";
import type { SessionStats } from "../engine/types";
import { pct } from "../utils/text";

export default function Hud({
  stats,
  combo,
  activeBonus,
  fireLockedMs,
}: {
  stats: SessionStats;
  combo: number;
  activeBonus?: string;
  fireLockedMs?: number;
}) {
  const baseTone = stats.baseHealth < 15 ? "critical" : stats.baseHealth < 40 ? "warning" : "";
  return (
    <aside className="hud" aria-label="Indicateurs de partie">
      <div><span>Score</span><strong>{stats.score}</strong></div>
      <div className={`base-meter ${baseTone}`}>
        <span>Base</span>
        <strong>{Math.max(0, Math.round(stats.baseHealth))} %</strong>
        <i><b style={{ width: `${Math.max(0, stats.baseHealth)}%` }} /></i>
      </div>
      <div><span>Précision</span><strong>{pct(precision(stats))}</strong></div>
      <div><span>Discernement</span><strong>{pct(discernment(stats))}</strong></div>
      <div><span>Puissance argumentative</span><strong>{Math.min(100, stats.bonusAbsorbed * 12 + stats.ambivalentResolved * 16)} %</strong></div>
      <div><span>Combo</span><strong>x{Math.max(1, combo)}</strong></div>
      <div><span>Erreurs restantes</span><strong>{Math.max(0, 6 - stats.mistakes)}</strong></div>
      {fireLockedMs ? <div className="weapon-lock"><span>Tir bloqué</span><strong>{Math.ceil(fireLockedMs / 100) / 10}s</strong></div> : null}
      {activeBonus && <div className="active-bonus"><span>Bonus</span><strong>{activeBonus}</strong></div>}
    </aside>
  );
}
