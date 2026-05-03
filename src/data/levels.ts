import type { CefrLevel, GameMode } from "../engine/types";

export const levels: { id: CefrLevel; label: string; description: string }[] = [
  { id: "A2", label: "A2", description: "Mots fréquents, rythme doux, aide visuelle." },
  { id: "B1", label: "B1", description: "Neutres, premiers verbes d'analyse, boss guidé." },
  { id: "B2", label: "B2", description: "Ambivalences, lexique abstrait, reformulation universitaire." },
];

export const modes: { id: GameMode; label: string; description: string }[] = [
  { id: "arcade", label: "Arcade", description: "Rythme dynamique, combos, boss final." },
  { id: "training", label: "Entraînement", description: "Vitesse réduite et feedback plus présent." },
  { id: "boss", label: "Boss seulement", description: "Accès direct à l'analyse d'un texte orienté." },
  { id: "class", label: "Classe", description: "Affichage agrandi pour vidéoprojecteur." },
];
