import type { SessionStats } from "../engine/types";
import { pct } from "../utils/text";
import { discernment, precision } from "../engine/scoring";

export default function Hud({ stats, combo, activeBonus }: { stats: SessionStats; combo: number; activeBonus?: string }) {
  return (
    <aside className="hud" aria-label="Indicateurs de partie">
      <div><span>Score</span><strong>{stats.score}</strong></div>
      <div><span>Précision</span><strong>{pct(precision(stats))}</strong></div>
      <div><span>Discernement</span><strong>{pct(discernment(stats))}</strong></div>
      <div><span>Puissance argumentative</span><strong>{Math.min(100, stats.bonusAbsorbed * 12 + stats.ambivalentResolved * 16)} %</strong></div>
      <div><span>Combo</span><strong>x{Math.max(1, combo)}</strong></div>
      <div><span>Erreurs restantes</span><strong>{Math.max(0, 6 - stats.mistakes)}</strong></div>
      {activeBonus && <div className="active-bonus"><span>Bonus</span><strong>{activeBonus}</strong></div>}
    </aside>
  );
}
