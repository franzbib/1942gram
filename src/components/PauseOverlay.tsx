export default function PauseOverlay({ onResume, onMenu }: { onResume: () => void; onMenu: () => void }) {
  return (
    <div className="overlay-panel">
      <h2>Pause</h2>
      <p>La lecture est suspendue. Reprenez quand vous êtes prêt.</p>
      <div className="row">
        <button onClick={onResume}>Reprendre</button>
        <button className="secondary" onClick={onMenu}>Retour menu</button>
      </div>
    </div>
  );
}
