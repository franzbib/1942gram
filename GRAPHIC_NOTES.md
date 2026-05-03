# Graphic Notes - Mission Nuance

Ce document décrit la direction artistique adoptée pour la refonte visuelle du jeu *Mission Nuance*. L'objectif était de passer d'une interface très brute à un design plus élégant, de type "rétro-arcade sobre", sans trahir l'exigence pédagogique du projet.

## 1. Palette de couleurs (Tokens)

L'atmosphère générale s'appuie sur une palette nocturne et "papier", évoquant une mission intellectuelle dans une citadelle de la nuance.

- **Bleus Nuits (Ciel, Interface)** : `#080f1c`, `#0b1426`, `#0f1c30`. Utilisés pour les fonds, créant une ambiance feutrée qui fait ressortir le reste.
- **Ivoire / Parchemin (Mots, Textes, Vaisseau)** : `#f4f1ea`, `#eaddcc`. Donne un côté "livre", "typographie" aux éléments interactifs.
- **Or Discret (Mélioratif révélé, Bonus, Boutons primaires)** : `#d4af37`. Une couleur de récompense classique mais non agressive.
- **Bordeaux / Grenat (Péjoratif révélé, Dégâts, Erreurs)** : `#8b3a4a`, `#1a1620`. Signalétique d'alerte et de destruction.
- **Ardoise / Gris perle (Neutre, Textes secondaires)** : `#8e9db0`, `#a9b5c2`.

## 2. Pédagogie par la couleur : La contrainte stricte

Le jeu ne doit **pas** guider l'action par la couleur. Par conséquent :
- Les vaisseaux-mots ordinaires ont été uniformisés visuellement. Ils utilisent les mêmes couleurs (parchemin / ivoire pour le fond, sombre pour le texte). 
- La reconnaissance des péjoratifs/mélioratifs doit toujours venir de la *lecture* du texte.
- La couleur (`semanticColors`) n'est affichée qu'en cas d'indice explicite activé (`fullHints`) ou d'effet bonus spécifique.

## 3. Composants visuels clés

### Le Vaisseau (Joueur)
L'ancien triangle a été remplacé par une silhouette stylisée d'**avion de papier**. C'est une métaphore filée de l'esprit volant au milieu du texte. Il est bicolore (blanc cassé + ombre grise).

### Les Projectiles
Les anciens rectangles brillants sont devenus des traits fins et lumineux (ressemblant à un pipe `|` ou un tiret typographique), évoquant un trait de crayon ou d'effaceur fendant le texte.

### La Base Terrestre
La base est une citadelle représentant des fragments de quartiers (LEX, NU, ARG...).
Ses états de destruction (santé 100%, 75%, 50%, 25%, 0%) sont représentés de façon de plus en plus dramatique mais esthétique :
1. **Healthy** : Couleurs propres, pas de fumée.
2. **Damaged** : Bâtiments légèrement assombris, couleurs plus sourdes.
3. **Heavy** : Fissures apparentes, panaches de fumée grise élégante.
4. **Critical** : Incendies visibles (flammes minimalistes), bâtiments effondrés visuellement.
5. **Destroyed** : Ruine sombre.

### HUD et Interface Globale
- Utilisation du *glassmorphism* léger : `backdrop-filter: blur(8px)` sur des fonds très sombres avec `rgba`.
- Boutons affinés avec une police `Inter` et de légères animations au survol.
- Message de retour (Feedback strip) retravaillé pour être moins agressif mais plus lisible.

## 4. Recommandations pour l'avenir
- Si un mode "Daltonien" doit être renforcé, les icônes ajoutées (`!`, `+`, `=`) suffisent généralement, mais des textures pourraient être ajoutées sur les mots lors du feedback.
- L'architecture Canvas est compacte. Il faut faire attention aux appels de dessin trop lourds dans la fonction `draw` si le jeu venait à être étendu. Le `reducedMotion` désactive déjà les calculs trigonométriques coûteux (fumées, flammes).
