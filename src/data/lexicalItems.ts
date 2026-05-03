import type { BonusEffect, CefrLevel, LexicalItem, ThemeId, WordCategory } from "../engine/types";
import { allThemeIds } from "./themes";

const rotatingThemes: ThemeId[][] = [
  ["vie-etudiante", "vie-quotidienne", "relations-sociales"],
  ["critique-culturelle", "commentaire-litteraire", "argumentation"],
  ["presse-debat", "argumentation", "travail-universitaire"],
  ["travail-universitaire", "vie-etudiante", "commentaire-litteraire"],
  ["vie-quotidienne", "relations-sociales", "presse-debat"],
];

function makeItems(words: string[], category: WordCategory, level: CefrLevel, explanation: string, extra?: Partial<LexicalItem>): LexicalItem[] {
  return words.map((text, index) => ({
    id: `${level}-${category}-${text}-${index}`.replace(/\s+/g, "-"),
    text,
    category,
    level,
    themes: rotatingThemes[index % rotatingThemes.length],
    explanation,
    example: `Dans ce contexte, « ${text} » ${category === "neutral" ? "décrit sans juger" : category === "meliorative" ? "valorise l'idée" : "oriente le jugement"}.`,
    ...extra,
  }));
}

const a2Pejorative = [
  "mauvais", "triste", "laid", "sale", "difficile", "inutile", "bizarre", "dangereux", "faible", "lent",
  "bruyant", "froid", "cher", "pauvre", "méchant", "dur", "grave", "long", "petit", "vieux",
  "fatigué", "nul", "vide", "sombre", "lourd",
];
const a2Meliorative = [
  "bon", "beau", "utile", "facile", "clair", "agréable", "calme", "propre", "rapide", "intéressant",
  "gentil", "important", "pratique", "joyeux", "simple", "joli", "fort", "riche", "moderne", "léger",
  "sympa", "sûr", "vivant", "chaleureux", "correct",
];
const b1Pejorative = [
  "ennuyeux", "confus", "ridicule", "désagréable", "injuste", "violent", "raté", "fatigant", "compliqué", "maladroit",
  "fragile", "inquiétant", "décevant", "banal", "excessif", "négatif", "fermé", "sec", "monotone", "limité",
  "désorganisé", "imprécis", "pauvre", "lourd", "prévisible", "malvenu", "pénible", "déséquilibré", "faux", "brutal",
  "faible", "lent", "irrespectueux", "agaçant", "inutile",
];
const b1Meliorative = [
  "réussi", "vivant", "original", "courageux", "sérieux", "efficace", "drôle", "émouvant", "accueillant", "précis",
  "solide", "rassurant", "équilibré", "agréable", "positif", "ouvert", "chaleureux", "dynamique", "honnête", "utile",
  "convaincant", "clair", "soigné", "créatif", "adapté", "respectueux", "attentif", "pertinent", "cohérent", "stimulant",
  "sensible", "maîtrisé", "nuancé", "accessible", "constructif",
];
const neutralWords = [
  "quotidien", "local", "national", "public", "privé", "universitaire", "administratif", "numérique", "collectif", "individuel",
  "récent", "ancien", "scolaire", "professionnel", "culturel", "social", "économique", "politique", "urbain", "rural",
  "mensuel", "annuel", "oral", "écrit", "central", "secondaire", "extérieur", "intérieur", "commun", "officiel",
];
const b2Pejorative = [
  "superficiel", "caricatural", "réducteur", "laborieux", "outrancier", "fallacieux", "médiocre", "indigent", "complaisant", "stérile",
  "convenu", "approximatif", "contestable", "discutable", "problématique", "incohérent", "pesant", "artificiel", "démagogique", "simpliste",
  "ambigu", "opaque", "fragile", "excessif", "brutal", "tendancieux", "partial", "désinvolte", "confus", "dogmatique",
  "paternaliste", "moralisateur", "anecdotique", "pauvre", "maladroit", "insuffisant", "sommaire", "précaire", "creux", "défaillant",
  "biaisé", "figé", "redondant", "plat", "péremptoire",
];
const b2Meliorative = [
  "pertinent", "nuancé", "rigoureux", "subtil", "fécond", "stimulant", "éclairant", "convaincant", "maîtrisé", "audacieux",
  "équilibré", "cohérent", "élégant", "suggestif", "remarquable", "salutaire", "judicieux", "solide", "expressif", "sobre",
  "précis", "profond", "fertile", "habile", "lucide", "méthodique", "probant", "structuré", "incisif", "mesuré",
  "nuançable", "argumenté", "documenté", "fécond", "soutenu", "fin", "dense", "inventif", "crédible", "exigeant",
  "pertinemment formulé", "éthique", "robuste", "éloquent", "heuristique",
];

const bonusMap: [string, BonusEffect, string][] = [
  ["nuancer", "slowMotion", "Ralentit les mots pour mieux lire les connotations."],
  ["reformuler", "convertPejorativeToNeutral", "Transforme quelques jugements brutaux en formulations neutres."],
  ["argumenter", "wideShot", "Élargit temporairement le tir."],
  ["préciser", "revealCategories", "Affiche brièvement les catégories."],
  ["contextualiser", "contextReveal", "Affiche des exemples pour les mots ambivalents."],
  ["atténuer", "shield", "Protège d'une erreur."],
  ["valoriser", "scoreMultiplier", "Augmente les points des actions correctes."],
  ["critiquer", "precisionBeam", "Rend le tir plus sélectif."],
  ["analyser", "freezePejoratives", "Ralentit les mots péjoratifs."],
  ["distinguer", "precisionBeam", "Évite de détruire les mots mélioratifs proches."],
  ["interpréter", "contextReveal", "Révèle un indice de contexte."],
  ["problématiser", "scoreMultiplier", "Renforce la puissance argumentative."],
  ["hiérarchiser", "slowMotion", "Réduit la vitesse pour prioriser les cibles."],
  ["objectiver", "neutralizeOneError", "Annule la prochaine erreur."],
  ["justifier", "shield", "Protège une décision discutable."],
  ["comparer", "revealCategories", "Clarifie les contrastes lexicaux."],
  ["opposer", "wideShot", "Améliore le tir pendant une courte rafale."],
  ["expliquer", "contextReveal", "Ajoute une phrase d'exemple."],
  ["clarifier", "revealCategories", "Rend les halos plus explicites."],
  ["synthétiser", "scoreMultiplier", "Multiplie temporairement le score."],
];

const ambivalentData = [
  ["simple", "Son explication est simple et claire.", "Son analyse est simple, presque simpliste."],
  ["léger", "Le style est léger et agréable.", "L'argumentation est légère."],
  ["populaire", "Cette idée est populaire et rassembleuse.", "Le texte adopte un ton trop populaire pour un article scientifique."],
  ["curieux", "Ce choix curieux ouvre une piste intéressante.", "Cette réponse curieuse semble peu adaptée."],
  ["original", "La démarche est originale et pertinente.", "La mise en scène veut être originale mais devient confuse."],
  ["classique", "La composition est classique et maîtrisée.", "La conclusion reste très classique."],
  ["radical", "La thèse propose un changement radical et cohérent.", "Le propos devient radical et peu nuancé."],
  ["critique", "Il propose une lecture critique du texte.", "Elle adopte un ton très critique."],
  ["complexe", "Le problème est complexe et demande une méthode.", "La phrase est inutilement complexe."],
  ["étrange", "Cette image étrange crée un effet poétique.", "Son raisonnement paraît étrange."],
  ["familier", "Le ton familier rapproche le narrateur du lecteur.", "Le registre familier convient mal à cet écrit."],
  ["froid", "Le style froid donne une distance intéressante.", "L'accueil est froid."],
  ["sec", "Une réponse sèche peut être efficace dans ce dialogue.", "Le commentaire est sec et peu constructif."],
  ["direct", "Son style direct clarifie la position.", "Le ton direct devient brutal."],
  ["naïf", "Le regard naïf du personnage est touchant.", "L'argument paraît naïf."],
  ["drôle", "Cette scène drôle allège le récit.", "La remarque drôle affaiblit le sérieux du débat."],
  ["brillant", "L'exposé est brillant et bien organisé.", "L'effet brillant masque un raisonnement fragile."],
  ["spectaculaire", "L'entrée spectaculaire attire l'attention.", "Le procédé spectaculaire paraît artificiel."],
  ["libre", "La forme libre sert le propos.", "La méthode est trop libre pour être vérifiable."],
  ["sensible", "Son analyse sensible respecte la nuance.", "Le sujet sensible exige plus de prudence."],
] as const;

export const lexicalItems: LexicalItem[] = [
  ...makeItems(a2Pejorative, "pejorative", "A2", "Ce mot est péjoratif : il donne une image négative.", { neutralEquivalent: "moins favorable" }),
  ...makeItems(a2Meliorative, "meliorative", "A2", "Ce mot est mélioratif : il valorise une personne, une idée ou une œuvre.", { opposite: "négatif" }),
  ...makeItems(b1Pejorative, "pejorative", "B1", "Ce mot oriente le jugement vers une appréciation négative.", { neutralEquivalent: "peu satisfaisant" }),
  ...makeItems(b1Meliorative, "meliorative", "B1", "Ce mot exprime une appréciation positive ou constructive.", { opposite: "défavorable" }),
  ...makeItems(neutralWords, "neutral", "B1", "Ce mot est neutre : il décrit sans juger."),
  ...makeItems(b2Pejorative, "pejorative", "B2", "Ce terme porte une connotation critique forte ; dans un écrit universitaire, il faut souvent le justifier ou l'atténuer.", { neutralEquivalent: "à discuter" }),
  ...makeItems(b2Meliorative, "meliorative", "B2", "Ce terme valorise la qualité d'une analyse, d'une œuvre ou d'un argument.", { opposite: "peu convaincant" }),
  ...bonusMap.map<LexicalItem>(([text, bonusEffect, explanation], index) => ({
    id: `bonus-${text}`,
    text,
    category: "bonus",
    level: index < 8 ? "B1" : "B2",
    themes: allThemeIds,
    explanation,
    example: `${text[0].toUpperCase()}${text.slice(1)} permet de passer d'une réaction à une analyse.`,
    bonusEffect,
  })),
  ...ambivalentData.map<LexicalItem>(([text, positive, negative], index) => ({
    id: `ambivalent-${text}`,
    text,
    category: "ambivalent",
    level: index < 5 ? "B1" : "B2",
    themes: rotatingThemes[index % rotatingThemes.length],
    explanation: "Ce mot dépend du contexte : il peut valoriser, décrire ou critiquer.",
    contextExamples: [
      { sentence: positive, value: "meliorative", explanation: `Ici, « ${text} » soutient une appréciation positive ou utile.` },
      { sentence: negative, value: "pejorative", explanation: `Ici, « ${text} » signale une limite ou une réserve.` },
    ],
  })),
];

export function getLexicon(level: CefrLevel, theme: ThemeId) {
  const allowedLevels: CefrLevel[] = level === "A2" ? ["A2"] : level === "B1" ? ["A2", "B1"] : ["A2", "B1", "B2"];
  return lexicalItems.filter((item) => allowedLevels.includes(item.level) && (item.themes.includes(theme) || item.category === "bonus"));
}
