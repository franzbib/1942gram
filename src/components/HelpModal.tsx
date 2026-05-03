export default function HelpModal({ onBack }: { onBack: () => void }) {
  return (
    <main className="help-screen">
      <section className="help-panel">
        <div className="kicker">Aide</div>
        <h1>Comment jouer</h1>
        <div className="help-list">
          <p><strong>Neutraliser les péjoratifs.</strong> Tirez avec Espace : ces mots donnent une image négative et doivent être maîtrisés.</p>
          <p><strong>Protéger les mélioratifs.</strong> Appuyez sur E près du mot : il valorise une idée, une personne ou une œuvre.</p>
          <p><strong>Ignorer les neutres.</strong> Ils décrivent sans juger ; tirer ou protéger n'est pas nécessaire.</p>
          <p><strong>Absorber les verbes-bonus.</strong> E près d'un verbe active une stratégie : nuancer, reformuler, contextualiser.</p>
          <p><strong>Lire le contexte.</strong> Certains mots changent de valeur selon la phrase, surtout en B2.</p>
          <p><strong>Boss final.</strong> Repérez les jugements négatifs puis choisissez une reformulation plus neutre.</p>
        </div>
        <p className="controls">Ordinateur : flèches ou ZQSD/WASD, Espace pour neutraliser, E ou Entrée pour protéger/absorber, P ou Échap pour la pause. Mobile : glissement au doigt, tir automatique conseillé, bouton Protéger.</p>
        <button className="primary" onClick={onBack}>Retour</button>
      </section>
    </main>
  );
}
