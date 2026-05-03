# Visual TODO - Mission Nuance

Ce fichier liste les tâches graphiques restantes ou les améliorations visuelles potentielles à implémenter pour les prochaines itérations. À confier à Codex ou à un autre agent.

## Tâches restantes & Améliorations futures
- [ ] **Animations de transition** : Ajouter un effet de fondu au noir ou de zoom typographique lors du passage au boss textuel pour éviter une coupure trop nette.
- [ ] **Bouton Pause** : Refondre l'icône du bouton pause pour qu'elle s'intègre mieux à l'esthétique du HUD (actuellement texte).
- [ ] **Feedback de Tir Bloqué** : Ajouter un léger effet visuel (screen shake très subtil ou bordure clignotante en rouge doux) quand le joueur essaie de tirer mais que le tir est bloqué.
- [ ] **Optimisation Canvas** : Si le jeu rame sur des mobiles très anciens, regrouper les appels de dessin de la base (`ctx.fillRect`) en un seul chemin `Path2D` ou désactiver certaines particules de poussière.
- [ ] **Texte de Victoire/Défaite** : Créer une animation d'apparition lettre par lettre pour le texte de fin de partie.

## Bugs visuels connus
- Sur les écrans ultra-larges (ultrawide), le dégradé du ciel peut paraître un peu étiré.
- Lors de collisions multiples simultanées, les fragments/particules peuvent temporairement surcharger le bas de l'écran.
