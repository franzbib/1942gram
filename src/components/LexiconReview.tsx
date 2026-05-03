import { useMemo, useState } from "react";
import { lexicalItems } from "../data/lexicalItems";
import { themes } from "../data/themes";
import type { CefrLevel, ThemeId, WordCategory } from "../engine/types";
import { normalizeText } from "../utils/text";

const categories: { id: "all" | WordCategory; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "pejorative", label: "Péjoratif" },
  { id: "meliorative", label: "Mélioratif" },
  { id: "neutral", label: "Neutre" },
  { id: "bonus", label: "Bonus" },
  { id: "ambivalent", label: "Ambivalent" },
];

export default function LexiconReview({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState<"all" | CefrLevel>("all");
  const [category, setCategory] = useState<"all" | WordCategory>("all");
  const [theme, setTheme] = useState<"all" | ThemeId>("all");
  const [q, setQ] = useState("");
  const items = useMemo(() => lexicalItems.filter((item) => {
    const query = normalizeText(q);
    return (level === "all" || item.level === level)
      && (category === "all" || item.category === category)
      && (theme === "all" || item.themes.includes(theme))
      && (!query || normalizeText(item.text).includes(query));
  }).slice(0, 140), [level, category, theme, q]);
  return (
    <main className="lexicon-screen">
      <section className="lexicon-head">
        <div>
          <div className="kicker">Révision</div>
          <h1>Lexique de Mission Nuance</h1>
        </div>
        <button onClick={onBack}>Retour</button>
      </section>
      <section className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un mot" />
        <select value={level} onChange={(e) => setLevel(e.target.value as "all" | CefrLevel)}>
          <option value="all">Tous niveaux</option><option>A2</option><option>B1</option><option>B2</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as "all" | WordCategory)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={theme} onChange={(e) => setTheme(e.target.value as "all" | ThemeId)}>
          <option value="all">Tous thèmes</option>
          {themes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </section>
      <section className="lexicon-grid">
        {items.map((item) => (
          <article key={item.id} className={`lex-card ${item.category}`}>
            <h2>{item.text}</h2>
            <span>{item.level} - {item.category}</span>
            <p>{item.explanation}</p>
            {item.example && <p>{item.example}</p>}
            {item.neutralEquivalent && <p>Équivalent neutre : {item.neutralEquivalent}</p>}
            {item.opposite && <p>Opposé : {item.opposite}</p>}
            {item.contextExamples?.map((ctx) => <p key={ctx.sentence}>{ctx.sentence} - {ctx.explanation}</p>)}
          </article>
        ))}
      </section>
    </main>
  );
}
