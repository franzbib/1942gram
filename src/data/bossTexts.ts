import type { BossText, CefrLevel, ThemeId } from "../engine/types";

const mk = (
  id: string,
  level: CefrLevel,
  theme: ThemeId,
  title: string,
  text: string,
  badWords: string[],
  correct: string,
): BossText => ({
  id,
  level,
  theme,
  title,
  text,
  targets: badWords.map((word) => ({
    word,
    category: "pejorative",
    explanation: `« ${word} » produit un jugement négatif. Il peut être utilisé, mais il doit être reconnu et justifié.`,
  })),
  reformulationQuestion: {
    original: text,
    prompt: "Choisissez la reformulation la plus neutre ou universitaire.",
    choices: [
      correct,
      text,
      "Ce document est nul et ne sert à rien.",
      "Tout est parfait et il n'y a aucune limite.",
    ],
    correctIndex: 0,
    explanation: "La reformulation garde la critique, mais elle réduit la brutalité du jugement.",
  },
});

export const bossTexts: BossText[] = [
  mk("a2-film", "A2", "critique-culturelle", "Un avis trop dur", "Ce film est mauvais, ennuyeux et inutile.", ["mauvais", "ennuyeux", "inutile"], "Ce film ne m'a pas beaucoup intéressé."),
  mk("a2-cours", "A2", "vie-etudiante", "Un cours difficile", "Le cours est long, difficile et triste.", ["long", "difficile", "triste"], "Le cours demande beaucoup d'attention."),
  mk("a2-ville", "A2", "vie-quotidienne", "Une sortie à Amiens", "La rue est sale, bruyante et dangereuse.", ["sale", "bruyante", "dangereuse"], "La rue pourrait être plus propre et plus calme."),
  mk("a2-ami", "A2", "relations-sociales", "Un portrait trop direct", "Il est froid, méchant et bizarre.", ["froid", "méchant", "bizarre"], "Il paraît réservé et parfois difficile à comprendre."),
  mk("a2-objet", "A2", "vie-quotidienne", "Un achat décevant", "Ce téléphone est cher, lent et inutile.", ["cher", "lent", "inutile"], "Ce téléphone ne correspond pas bien à mes besoins."),

  mk("b1-spectacle", "B1", "critique-culturelle", "Une critique de spectacle", "Le spectacle était vraiment ennuyeux. L'histoire était confuse, les personnages étaient ridicules et la fin était inutile.", ["ennuyeux", "confuse", "ridicules", "inutile"], "Le spectacle manquait de rythme, l'histoire aurait pu être plus claire et la fin semblait peu nécessaire."),
  mk("b1-expose", "B1", "travail-universitaire", "Un exposé sévère", "L'exposé était désorganisé et imprécis. Plusieurs exemples étaient faibles et la conclusion semblait ratée.", ["désorganisé", "imprécis", "faibles", "ratée"], "L'exposé gagnerait à être mieux structuré, avec des exemples plus précis et une conclusion plus nette."),
  mk("b1-campus", "B1", "vie-etudiante", "Vie de campus", "La réunion était fatigante, compliquée et parfois injuste pour les nouveaux étudiants.", ["fatigante", "compliquée", "injuste"], "La réunion était dense et pourrait mieux accompagner les nouveaux étudiants."),
  mk("b1-article", "B1", "presse-debat", "Un article polémique", "L'article adopte un ton négatif et excessif. Certaines formules sont violentes et maladroites.", ["négatif", "excessif", "violentes", "maladroites"], "L'article formule une critique forte qui gagnerait à être plus mesurée."),
  mk("b1-roman", "B1", "commentaire-litteraire", "Portrait d'un personnage", "Le personnage semble fermé, sec et inquiétant, ce qui rend la scène désagréable.", ["fermé", "sec", "inquiétant", "désagréable"], "Le personnage est présenté avec une distance qui crée une tension dans la scène."),
  mk("b1-groupe", "B1", "relations-sociales", "Travail de groupe", "Le groupe était lent, confus et déséquilibré. La discussion est devenue pénible.", ["lent", "confus", "déséquilibré", "pénible"], "Le groupe a rencontré des difficultés d'organisation et de répartition de la parole."),
  mk("b1-methode", "B1", "travail-universitaire", "Méthode de travail", "La méthode reste fragile, compliquée et peu efficace pour préparer l'examen.", ["fragile", "compliquée", "peu efficace"], "La méthode pourrait être consolidée et simplifiée pour mieux préparer l'examen."),
  mk("b1-avis", "B1", "argumentation", "Avis trop fermé", "Le commentaire est fermé, négatif et banal. Il ne propose aucune nuance.", ["fermé", "négatif", "banal"], "Le commentaire exprime une réserve mais gagnerait à proposer des distinctions."),

  mk("b2-analyse", "B2", "argumentation", "Une analyse trop sévère", "Cette analyse paraît superficielle : elle réduit le texte à une opposition caricaturale et propose une lecture souvent confuse. Certains arguments sont fallacieux, tandis que la conclusion reste laborieuse et peu convaincante.", ["superficielle", "réduit", "caricaturale", "confuse", "fallacieux", "laborieuse", "peu convaincante"], "Cette analyse gagnerait à être approfondie. Elle tend à simplifier l'opposition centrale du texte, et certains arguments demanderaient à être mieux justifiés."),
  mk("b2-universite", "B2", "travail-universitaire", "Appréciation universitaire", "Le dossier est approximatif, redondant et parfois incohérent. La problématique demeure opaque.", ["approximatif", "redondant", "incohérent", "opaque"], "Le dossier gagnerait en précision, en concision et en cohérence argumentative."),
  mk("b2-film", "B2", "critique-culturelle", "Critique de film", "La mise en scène paraît artificielle et complaisante. Le discours final devient pesant et convenu.", ["artificielle", "complaisante", "pesant", "convenu"], "La mise en scène pourrait être perçue comme trop visible, et le discours final manque de retenue."),
  mk("b2-presse", "B2", "presse-debat", "Débat public", "La chronique adopte une posture démagogique et tendancieuse. Les exemples restent anecdotiques.", ["démagogique", "tendancieuse", "anecdotiques"], "La chronique privilégie des effets de persuasion et gagnerait à diversifier ses exemples."),
  mk("b2-litteraire", "B2", "commentaire-litteraire", "Analyse littéraire", "La lecture est réductrice : elle transforme le personnage en symbole plat et propose une opposition simpliste.", ["réductrice", "plat", "simpliste"], "La lecture pourrait mieux rendre compte de la complexité du personnage et des tensions du texte."),
  mk("b2-reseaux", "B2", "presse-debat", "Réseaux sociaux", "Le message est brutal, péremptoire et moralisateur. Il ferme la possibilité d'un échange argumenté.", ["brutal", "péremptoire", "moralisateur"], "Le message affirme une position forte mais gagnerait à ménager un espace de discussion."),
  mk("b2-methode", "B2", "travail-universitaire", "Méthode contestable", "La démarche est contestable et parfois désinvolte. Les sources sont insuffisantes.", ["contestable", "désinvolte", "insuffisantes"], "La démarche devrait préciser ses critères et renforcer son appui documentaire."),
  mk("b2-portrait", "B2", "relations-sociales", "Portrait social", "Le portrait devient paternaliste et biaisé. Il réduit la personne à quelques traits convenus.", ["paternaliste", "biaisé", "réduit", "convenus"], "Le portrait gagnerait à éviter les généralisations et à restituer davantage de complexité."),
  mk("b2-amiens", "B2", "vie-etudiante", "Vie étudiante à Amiens", "Le texte décrit la ville comme figée, pauvre et défaillante, sans évoquer ses ressources culturelles.", ["figée", "pauvre", "défaillante"], "Le texte formule des réserves mais pourrait aussi intégrer des éléments de contexte et de nuance."),
  mk("b2-essai", "B2", "argumentation", "Essai polémique", "L'essai demeure dogmatique et partial. Sa critique, souvent outrancière, affaiblit sa portée.", ["dogmatique", "partial", "outrancière", "affaiblit"], "L'essai gagnerait à expliciter ses présupposés et à formuler une critique plus mesurée."),
];

export function getBosses(level: CefrLevel, theme: ThemeId) {
  const themed = bossTexts.filter((boss) => boss.level === level && boss.theme === theme);
  return themed.length ? themed : bossTexts.filter((boss) => boss.level === level);
}
