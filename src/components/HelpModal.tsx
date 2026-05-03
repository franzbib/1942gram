export default function HelpModal({ onBack }: { onBack: () => void }) {
  return (
    <main className="help-screen">
      <section className="help-panel">
        <div className="kicker">Aide</div>
        <h1>Comment jouer</h1>
        <div className="help-list">
          <p><strong>Détruire les péjoratifs.</strong> Ils donnent une image négative et doivent être neutralisés.</p>
          <p><strong>Protéger les mélioratifs.</strong> Ils valorisent une idée, une personne ou une œuvre.</p>
          <p><strong>Ignorer les neutres.</strong> Ils décrivent sans juger.</p>
          <p><strong>Absorber les verbes-bonus.</strong> Ils renforcent votre analyse : nuancer, reformuler, contextualiser.</p>
          <p><strong>Lire le contexte.</strong> Certains mots changent de valeur selon la phrase.</p>
          <p><strong>Boss final.</strong> Repérez les jugements négatifs puis choisissez une reformulation plus neutre.</p>
        </div>
        <p className="controls">Ordinateur : flèches ou ZQSD/WASD, espace pour tirer, P ou Échap pour la pause. Mobile : glissement au doigt et tir automatique conseillé.</p>
        <button className="primary" onClick={onBack}>Retour</button>
      </section>
    </main>
  );
}
