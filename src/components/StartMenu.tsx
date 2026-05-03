import { BookOpen, HelpCircle, Play, Shuffle } from "lucide-react";
import { levels, modes } from "../data/levels";
import { themes } from "../data/themes";
import type { GameConfig, GameMode } from "../engine/types";
import { choice } from "../utils/random";
import DifficultyBadge from "./DifficultyBadge";

function recommendedHints(level: GameConfig["level"], mode: GameConfig["mode"]) {
  if (level === "A2" && (mode === "training" || mode === "arcade")) return "training";
  return "off";
}

export default function StartMenu({
  config,
  setConfig,
  onPlay,
  onLexicon,
  onHelp,
}: {
  config: GameConfig;
  setConfig: (config: GameConfig) => void;
  onPlay: () => void;
  onLexicon: () => void;
  onHelp: () => void;
}) {
  const update = (patch: Partial<GameConfig>) => setConfig({ ...config, ...patch });
  const updateOptions = (patch: Partial<GameConfig["options"]>) => setConfig({ ...config, options: { ...config.options, ...patch } });
  const randomGame = () => {
    setConfig({ ...config, level: choice(levels).id, mode: choice(modes).id, theme: choice(themes).id });
    onPlay();
  };
  return (
    <main className="menu-shell">
      <section className="title-zone">
        <div className="kicker">Mini-jeu FLE/FOU</div>
        <h1>Mission Nuance</h1>
        <p>Neutralisez les mots péjoratifs, protégez les mots mélioratifs, absorbez les verbes de l'analyse.</p>
      </section>
      <section className="menu-grid">
        <div className="panel">
          <h2>Niveau CECR</h2>
          <div className="segmented">
            {levels.map((level) => (
              <button
                key={level.id}
                className={config.level === level.id ? "selected" : ""}
                onClick={() => setConfig({ ...config, level: level.id, options: { ...config.options, visualHints: recommendedHints(level.id, config.mode) } })}
              >
                <DifficultyBadge level={level.id} />
                <span><strong>{level.description}</strong>{level.objective}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Mode</h2>
          <div className="segmented">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className={config.mode === mode.id ? "selected" : ""}
                onClick={() => setConfig({ ...config, mode: mode.id as GameMode, options: { ...config.options, visualHints: recommendedHints(config.level, mode.id) } })}
              >
                <strong>{mode.label}</strong><span>{mode.description}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel wide">
          <h2>Thème</h2>
          <select value={config.theme} onChange={(event) => update({ theme: event.target.value as GameConfig["theme"] })}>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label} - {theme.description}</option>)}
          </select>
          <div className="checks">
            <label><input type="checkbox" checked={config.options.autoFire} onChange={(e) => updateOptions({ autoFire: e.target.checked })} /> Tir automatique</label>
            <label><input type="checkbox" checked={config.options.readable} onChange={(e) => updateOptions({ readable: e.target.checked })} /> Lisibilité renforcée</label>
            <label><input type="checkbox" checked={config.options.reducedMotion} onChange={(e) => updateOptions({ reducedMotion: e.target.checked })} /> Réduire les animations</label>
            <label><input type="checkbox" checked={config.options.muted} onChange={(e) => updateOptions({ muted: e.target.checked })} /> Muet</label>
          </div>
          <label className="hint-select">
            Indices visuels
            <select value={config.options.visualHints} onChange={(e) => updateOptions({ visualHints: e.target.value as GameConfig["options"]["visualHints"] })}>
              <option value="off">off - aucune réponse avant action</option>
              <option value="training">training - feedback après décision</option>
              <option value="full">full - guidage explicite</option>
            </select>
          </label>
        </div>
      </section>
      <nav className="main-actions">
        <button className="primary" onClick={onPlay}><Play size={18} /> Jouer</button>
        <button onClick={randomGame}><Shuffle size={18} /> Partie aléatoire</button>
        <button onClick={onLexicon}><BookOpen size={18} /> Lexique</button>
        <button onClick={onHelp}><HelpCircle size={18} /> Aide</button>
      </nav>
    </main>
  );
}
