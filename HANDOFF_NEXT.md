# Handoff Next - Mission Nuance / 1942gram

## 1. État actuel du projet

Le projet est une application React + Vite + TypeScript jouable dans le navigateur. Le gameplay Canvas principal est fonctionnel : vaisseau lexical, mots descendants, tir, protection/absorption, boss textuel, bilan pédagogique, base terrestre destructible, désarmement temporaire et neutralisation visuelle des catégories en mode normal.

Des améliorations graphiques locales sont présentes : `GRAPHIC_NOTES.md`, `VISUAL_TODO.md`, refonte de la palette sombre/ivoire, base typographique en Canvas, HUD glassmorphism, mots plus compacts, avion de papier et projectiles typographiques.

## 2. Fichiers principaux

- `src/components/GameCanvas.tsx` : boucle de jeu, rendu Canvas, mots, base, collisions, désarmement.
- `src/components/BossTextPhase.tsx` : boss textuel, repérage et reformulation.
- `src/components/Hud.tsx` : score, base, précision, combo, tir bloqué.
- `src/components/EndScreen.tsx` : bilan pédagogique et cause d'échec.
- `src/engine/constants.ts` : scoring, seuils, base, weapon lock, tailles.
- `src/engine/scoring.ts` : calculs de réussite et résultat.
- `src/engine/integrationContract.ts` : `window.MissionNuance`, CustomEvent et postMessage.
- `src/hooks/useGameSession.ts` : état de session, localStorage et paramètres URL.
- `src/data/lexicalItems.ts` / `src/data/bossTexts.ts` : données pédagogiques locales.

## 3. Mécaniques confirmées

- Les catégories ordinaires ne sont pas révélées par couleur avant action en mode normal.
- Les verbes-bonus restent visuellement distincts.
- Les ambivalents indiquent seulement qu'un contexte peut être nécessaire.
- Les péjoratifs laissés passer endommagent la base.
- La base a cinq états visuels : intacte, premiers dégâts, dégâts moyens, critique, détruite.
- Détruire un mélioratif applique une pénalité et bloque temporairement le tir.
- Le déplacement reste indépendant du blocage de tir.
- Le boss ne pré-colore pas les cibles avant clic.
- Le bilan affiche base, péjoratifs arrivés à la base, désarmements et boss.

## 4. Mécaniques corrigées pendant la reprise

- Payload d'intégration enrichi avec `baseHealth`, `pejorativesMissed`, `pejorativesHitBase`, `meliorativesDestroyed`, `weaponLocks`.
- Prise en charge légère des paramètres URL : `level`, `mode`, `theme`, `requiredScore`, `embedded`.
- `requiredScore` peut ajuster le seuil de réussite de la session.
- `embedded=true` active une interface plus compacte sans supprimer le `postMessage`.
- Correction de `Partie aléatoire`, qui pouvait lancer l'ancienne configuration.

## 5. Bugs ou risques restants

- Les fichiers affichent parfois des caractères accentués mal rendus dans PowerShell, mais le build Vite compile. Vérifier visuellement dans le navigateur si un encodage paraît incorrect.
- Les tests clavier/mobile complets restent à faire manuellement.
- Les effets sonores sont documentés comme limite V0.9 et ne sont pas encore branchés.
- Les transitions vers le boss restent abruptes, noté dans `VISUAL_TODO.md`.

## 6. Choix techniques importants

- Le gameplay reste en Canvas pour limiter les re-renders React.
- Les données lexicales sont locales, sans API.
- La neutralisation visuelle est volontaire : seuls `visualHints="full"` ou certains bonus affichent explicitement les catégories avant décision.
- La base est dessinée directement dans `GameCanvas.tsx` pour garder les animations synchronisées avec la boucle.
- Les événements d'intégration ne partent qu'après `buildResult` et `safeDispatchCompletion`.

## 7. Commandes à lancer

```bash
npm install
npm run dev
npm run build
npm run preview
```

Sous PowerShell si nécessaire :

```bash
npm.cmd run build
```

## 8. Checklist de test prioritaire

- Lancer A2, B1, B2 depuis le menu.
- Vérifier déplacement, tir, protection, pause.
- Vérifier que les mots ordinaires ne révèlent pas leur catégorie avant action.
- Laisser passer des péjoratifs et observer la base.
- Détruire un mélioratif et vérifier le blocage du tir.
- Vérifier que mélioratifs/neutres laissés passer n'endommagent pas la base.
- Atteindre le boss et valider la reformulation.
- Vérifier le bilan pédagogique.
- Tester `?level=B2&mode=arcade&theme=argumentation&requiredScore=70&embedded=true`.
- Exécuter `npm.cmd run build`.

## 9. Recommandations pour la prochaine itération

- Ajouter un test automatisé minimal avec Playwright pour vérifier menu, lancement et absence d'écran blanc.
- Ajouter une transition visuelle vers le boss.
- Ajouter un feedback visuel quand le joueur tente de tirer pendant le blocage.
- Auditer le lexique avec un enseignant FLE/FOU pour éliminer les doublons ou formulations discutables.
- Brancher des sons Web Audio discrets, désactivés par défaut.
