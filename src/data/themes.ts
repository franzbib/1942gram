import type { ThemeId } from "../engine/types";

export const themes: { id: ThemeId; label: string; description: string }[] = [
  { id: "vie-etudiante", label: "Vie étudiante", description: "Campus, cours, logement, sorties." },
  { id: "vie-quotidienne", label: "Vie quotidienne", description: "Objets, services, habitudes." },
  { id: "critique-culturelle", label: "Critique culturelle", description: "Films, spectacles, livres, expositions." },
  { id: "argumentation", label: "Argumentation", description: "Jugement, nuance, débat." },
  { id: "presse-debat", label: "Presse et débat public", description: "Articles, opinions, controverses." },
  { id: "commentaire-litteraire", label: "Commentaire littéraire", description: "Style, personnages, interprétation." },
  { id: "relations-sociales", label: "Relations sociales", description: "Portraits, échanges, attitudes." },
  { id: "travail-universitaire", label: "Travail universitaire", description: "Exposés, méthodes, écrits académiques." },
];

export const allThemeIds = themes.map((theme) => theme.id);
