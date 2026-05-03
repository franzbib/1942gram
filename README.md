# Mission Nuance

Mini-jeu pédagogique FLE/FOU de type shoot'em up lexical inspiré de 1942. Le joueur pilote un vaisseau lexical et apprend à distinguer les mots péjoratifs, mélioratifs, neutres, ambivalents et les verbes-bonus de l'analyse.

## Objectif pédagogique

Le jeu entraîne la reconnaissance des connotations, la lecture rapide sous contrainte, la distinction entre jugement et information, et la reformulation académique. Les mots péjoratifs ne sont pas présentés comme interdits : ils produisent un effet discursif qu'il faut reconnaître, contextualiser et parfois reformuler.

## Installation

```bash
npm install
npm run dev
npm run build
npm run preview
```

Sous PowerShell, si `npm` est bloqué par la politique d'exécution, utiliser `npm.cmd`.

## Règles

- Neutraliser les mots péjoratifs avec le tir.
- Protéger les mots mélioratifs avec l'action de protection.
- Ignorer les mots neutres.
- Absorber les verbes-bonus avec l'action de protection.
- Lire le contexte des mots ambivalents.
- Terminer le boss textuel en repérant puis reformulant les jugements trop marqués.

## Niveaux et modes

Niveaux : A2, B1, B2. La vitesse, la densité, la présence de neutres et d'ambivalents, ainsi que la complexité du boss changent selon le niveau.

Modes : Arcade, Entraînement, Boss seulement, Classe / vidéoprojecteur.

Objectifs CECRL :

- A2 : reconnaître une appréciation positive ou négative dans des mots courants.
- B1 : distinguer jugement, description neutre et critique formulée simplement.
- B2 : analyser l'effet discursif d'un terme et reformuler une critique avec nuance.

## Contrôles

- Déplacement : flèches, ZQSD ou WASD.
- Neutraliser : Espace.
- Protéger / absorber : E, Entrée ou bouton Protéger.
- Pause : P ou Échap.

Sur mobile, le tir automatique cible surtout les péjoratifs proches de l'axe du joueur, et le bouton Protéger permet de valider les mots mélioratifs ou les verbes-bonus.

## Principe de neutralisation visuelle

En mode Arcade B1/B2, les mots ordinaires ne sont pas colorés selon leur catégorie. Un péjoratif, un mélioratif et un neutre ont une apparence équivalente avant action : la décision doit donc reposer sur la lecture du mot et la connaissance de sa connotation.

Les couleurs catégorielles sont réservées :

- au feedback après décision ;
- au mode `training`, sous forme d'aide après action ;
- au mode `full`, destiné à l'accessibilité ou à une découverte très guidée ;
- à l'écran Lexique, qui est un espace de révision hors contrainte.

Les verbes-bonus restent visuellement distincts sous forme de capsules, car leur rôle n'est pas de signaler une connotation. Les mots ambivalents peuvent porter un `?`, qui indique seulement qu'un contexte est nécessaire.

## Nouvelles mécaniques de sanction

- Les mots péjoratifs laissés passer endommagent la base discursive en bas de l'écran.
- Si la base tombe à 0 %, la partie se termine par un échec : trop de jugements négatifs non repérés ont atteint le terrain discursif.
- Détruire un mot mélioratif bloque temporairement le tir. Le joueur peut toujours se déplacer, mais il doit attendre avant de neutraliser à nouveau.
- Les cartouches des mots ont été réduits pour améliorer la fluidité, la précision du tir et la lisibilité de la zone de jeu.

La base est dessinée dans le Canvas comme une petite citadelle typographique. Elle a cinq états visuels : intacte `100-76`, premiers dégâts `75-51`, dégâts moyens `50-26`, critique `25-1`, détruite `0`. Les impacts produisent un effet local, et l'option "Réduire les animations" limite le shake, la fumée et les particules.

## Structure

- `src/components` : écrans et UI.
- `src/data` : lexique, thèmes, niveaux, boss.
- `src/engine` : types, scoring, difficulté, collision, contrat d'intégration.
- `src/hooks` : clavier, tactile, session.
- `src/utils` : hasard, texte, stockage local.

## Ajouter un mot

Modifier `src/data/lexicalItems.ts`. Pour un mot standard, l'ajouter à la liste du niveau et de la catégorie. Pour un mot ambivalent, ajouter deux phrases de contexte dans `ambivalentData`. Pour un bonus, ajouter une entrée dans `bonusMap` avec un effet.

## Ajouter un boss

Modifier `src/data/bossTexts.ts` et ajouter un appel à `mk` avec le niveau, le thème, le texte, les mots ciblés et la reformulation neutre.

## Intégration Mission ISPA

Le contrat est défini dans `src/engine/integrationContract.ts`. En cas de réussite réelle, le jeu émet un `CustomEvent` `missionNuance:complete` et un `postMessage` `mission-nuance:complete`.

Voir aussi `INTEGRATION.md`.

## Limites connues V0.9

- Les sons Web Audio sont préparés conceptuellement via l'option muet, mais les effets sonores ne sont pas encore branchés pour éviter les blocages navigateur.
- La phase arcade du boss est condensée en repérage interactif puis reformulation.
- Les événements spéciaux sont représentés par les bonus et la progression de rythme, pas encore par des vagues nommées affichées.
