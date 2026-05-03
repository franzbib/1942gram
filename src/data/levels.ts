import type { CefrLevel, GameMode } from "../engine/types";

export const levels: { id: CefrLevel; label: string; description: string; objective: string }[] = [
  { id: "A2", label: "A2", description: "Mots fréquents, rythme doux, aide visuelle.", objective: "Reconnaître rapidement une appréciation positive ou négative dans des mots courants." },
  { id: "B1", label: "B1", description: "Neutres, premiers verbes d'analyse, boss guidé.", objective: "Distinguer jugement, description neutre et critique formulée simplement." },
  { id: "B2", label: "B2", description: "Ambivalences, lexique abstrait, reformulation universitaire.", objective: "Analyser l'effet discursif d'un terme et reformuler une critique avec nuance." },
];

export const levelObjectives = Object.fromEntries(levels.map((level) => [level.id, level.objective])) as Record<CefrLevel, string>;

export const modes: { id: GameMode; label: string; description: string }[] = [
  { id: "arcade", label: "Arcade", description: "Rythme dynamique, combos, boss final." },
  { id: "training", label: "Entraînement", description: "Vitesse réduite et feedback plus présent." },
  { id: "boss", label: "Boss seulement", description: "Accès direct à l'analyse d'un texte orienté." },
  { id: "class", label: "Classe", description: "Affichage agrandi pour vidéoprojecteur." },
];
