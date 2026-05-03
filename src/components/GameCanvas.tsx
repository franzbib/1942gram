import { useCallback, useEffect, useRef, useState } from "react";
import { getLexicon } from "../data/lexicalItems";
import { GAME_SIZE, SCORING } from "../engine/constants";
import { getDifficulty } from "../engine/difficulty";
import { initialStats } from "../engine/scoring";
import type { GameConfig, LexicalItem, SessionStats } from "../engine/types";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useTouchControls } from "../hooks/useTouchControls";
import { choice, uid } from "../utils/random";
import Hud from "./Hud";
import PauseOverlay from "./PauseOverlay";

type FallingWord = {
  id: string;
  item: LexicalItem;
  x: number;
  y: number;
  speed: number;
  w: number;
  h: number;
  contextValue?: "pejorative" | "meliorative" | "neutral";
};

type Shot = { id: string; x: number; y: number; w: number; h: number };
type Pulse = { id: string; x: number; y: number; born: number; ok: boolean };

const colors = {
  pejorative: "#8b2434",
  meliorative: "#f3bd4f",
  neutral: "#9ca3af",
  bonus: "#5eead4",
  ambivalent: "#b06df3",
};

function categoryLabel(item: LexicalItem) {
  return item.category === "pejorative" ? "péjoratif" : item.category === "meliorative" ? "mélioratif" : item.category === "neutral" ? "neutre" : item.category === "bonus" ? "bonus" : "contexte ?";
}

export default function GameCanvas({
  config,
  onBoss,
  onMenu,
}: {
  config: GameConfig;
  onBoss: (stats: SessionStats) => void;
  onMenu: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statsRef = useRef(initialStats());
  const [statsView, setStatsView] = useState(statsRef.current);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("Détruisez les mots péjoratifs. Protégez les mots mélioratifs.");
  const [comboView, setComboView] = useState(1);
  const [activeBonus, setActiveBonus] = useState<string | undefined>();
  const pausedRef = useRef(false);
  const keys = useKeyboardControls(() => setPaused((p) => !p));
  const touch = useTouchControls();
  const words = useRef<FallingWord[]>([]);
  const shots = useRef<Shot[]>([]);
  const pulses = useRef<Pulse[]>([]);
  const player = useRef<{ x: number; y: number }>({ x: GAME_SIZE.width / 2, y: GAME_SIZE.playerY });
  const combo = useRef(1);
  const lastFire = useRef(0);
  const lastProtect = useRef(0);
  const lastSpawn = useRef(0);
  const startedAt = useRef(0);
  const bonusUntil = useRef(0);
  const bonusEffect = useRef<string | null>(null);
  const difficulty = getDifficulty(config.level, config.mode);
  const lexicon = getLexicon(config.level, config.theme);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const addScore = (delta: number, correct: boolean) => {
    const multiplier = bonusEffect.current === "scoreMultiplier" && performance.now() < bonusUntil.current ? 1.5 : 1;
    const stats = statsRef.current;
    stats.score = Math.max(0, stats.score + Math.round(delta * multiplier * Math.max(1, combo.current * 0.12)));
    if (correct) stats.correct += 1;
    else stats.mistakes += 1;
  };

  const feedback = (text: string) => {
    setMessage(text);
  };

  const spawnWord = (now: number) => {
    if (words.current.length >= GAME_SIZE.maxObjects) return;
    const pool = lexicon.filter((item) => {
      if (config.level === "A2") return item.category !== "neutral" && item.category !== "ambivalent" && item.category !== "bonus";
      if (config.level === "B1") return item.category !== "ambivalent" || Math.random() < 0.35;
      return true;
    });
    const item = choice(pool);
    const fontSize = (config.options.readable ? 23 : 19) * difficulty.readableScale;
    const width = Math.max(86, item.text.length * fontSize * 0.62 + 28);
    const context = item.category === "ambivalent" ? choice(item.contextExamples ?? []) : undefined;
    words.current.push({
      id: uid("word"),
      item,
      x: 30 + Math.random() * (GAME_SIZE.width - width - 60),
      y: -40,
      speed: (0.55 + Math.random() * 0.55) * difficulty.speed,
      w: width,
      h: fontSize + 22,
      contextValue: context?.value,
    });
    lastSpawn.current = now;
  };

  const fire = (now: number) => {
    const interval = bonusEffect.current === "wideShot" ? 160 : 230;
    if (now - lastFire.current < interval) return;
    const wide = bonusEffect.current === "wideShot" && now < bonusUntil.current;
    shots.current.push({ id: uid("shot"), x: player.current.x - 4, y: player.current.y - 20, w: wide ? 18 : 8, h: 24 });
    if (wide) {
      shots.current.push({ id: uid("shot"), x: player.current.x - 38, y: player.current.y - 14, w: 8, h: 22 });
      shots.current.push({ id: uid("shot"), x: player.current.x + 30, y: player.current.y - 14, w: 8, h: 22 });
    }
    statsRef.current.shots += 1;
    lastFire.current = now;
  };

  const isPejorativeInContext = (word: FallingWord) => word.item.category === "pejorative" || (word.item.category === "ambivalent" && word.contextValue === "pejorative");
  const isMeliorativeInContext = (word: FallingWord) => word.item.category === "meliorative" || (word.item.category === "ambivalent" && word.contextValue === "meliorative");

  const processHit = (word: FallingWord) => {
    const stats = statsRef.current;
    stats.hits += 1;
    stats.wordsProcessed += 1;
    const cat = word.item.category;
    if (cat === "pejorative" || (cat === "ambivalent" && word.contextValue === "pejorative")) {
      addScore(cat === "ambivalent" ? SCORING.correctAmbivalent : SCORING.destroyPejorative, true);
      stats.pejorativesDestroyed += 1;
      if (cat === "ambivalent") stats.ambivalentResolved += 1;
      combo.current += 1;
      feedback(cat === "ambivalent" ? "Belle nuance : le contexte rendait ce mot critique." : "Lecture précise : mot péjoratif neutralisé.");
    } else if (cat === "meliorative" || (cat === "ambivalent" && word.contextValue === "meliorative")) {
      if (bonusEffect.current === "precisionBeam" && performance.now() < bonusUntil.current) return;
      addScore(SCORING.shootMeliorative, false);
      stats.meliorativesDestroyed += 1;
      stats.review.unshift({ item: word.item, reason: `Vous avez tiré sur « ${word.item.text} ». Ce mot valorise généralement l'idée.` });
      combo.current = 1;
      feedback("Attention à la connotation : ce mot était mélioratif.");
    } else if (cat === "bonus") {
      addScore(SCORING.shootBonus, false);
      stats.review.unshift({ item: word.item, reason: `« ${word.item.text} » était un verbe-bonus à absorber.` });
      feedback("Ce verbe devait être absorbé, pas détruit.");
    } else if (cat === "neutral" || word.contextValue === "neutral") {
      addScore(SCORING.shootNeutral, false);
      stats.neutralShot += 1;
      combo.current = 1;
      feedback("Ce mot était neutre : il décrit sans juger.");
    }
    stats.comboMax = Math.max(stats.comboMax, combo.current);
  };

  const protectWord = (word: FallingWord) => {
    const stats = statsRef.current;
    const cat = word.item.category;
    if (cat === "bonus") {
      absorbBonus(word);
      return true;
    }
    stats.wordsProcessed += 1;
    if (isMeliorativeInContext(word)) {
      addScore(cat === "ambivalent" ? SCORING.correctAmbivalent : SCORING.protectMeliorative, true);
      stats.meliorativesProtected += 1;
      if (cat === "ambivalent") stats.ambivalentResolved += 1;
      combo.current += 1;
      feedback(cat === "ambivalent" ? "Protection juste : le contexte rendait ce mot valorisant." : "Mot mélioratif protégé : bonne maîtrise du jugement positif.");
      return true;
    }
    if (isPejorativeInContext(word)) {
      addScore(cat === "ambivalent" ? SCORING.wrongAmbivalent : SCORING.missPejorative, false);
      stats.pejorativesMissed += 1;
      stats.review.unshift({ item: word.item, reason: `Vous avez protégé « ${word.item.text} », alors que le contexte portait un jugement négatif.` });
      combo.current = 1;
      feedback("Ce mot devait être neutralisé, pas protégé.");
      return true;
    }
    if (cat === "neutral" || word.contextValue === "neutral") {
      addScore(-15, false);
      stats.neutralShot += 1;
      feedback("Mot neutre : il suffisait de l'ignorer.");
      return true;
    }
    return false;
  };

  const protect = (now: number) => {
    if (now - lastProtect.current < 520) return;
    lastProtect.current = now;
    const radius = config.options.readable ? 112 : 94;
    const target = words.current
      .map((word) => ({ word, distance: Math.hypot(word.x + word.w / 2 - player.current.x, word.y + word.h / 2 - player.current.y) }))
      .filter(({ distance }) => distance < radius)
      .sort((a, b) => a.distance - b.distance)[0]?.word;
    const ok = target ? protectWord(target) : false;
    pulses.current.push({ id: uid("pulse"), x: player.current.x, y: player.current.y, born: now, ok });
    if (target && ok) words.current = words.current.filter((word) => word.id !== target.id);
    if (!target) feedback("Aucun mot à protéger dans la zone d'analyse.");
  };

  const shouldAutoFire = () => {
    return words.current.some((word) => {
      const centerX = word.x + word.w / 2;
      const abovePlayer = word.y + word.h < player.current.y && word.y > 45;
      return abovePlayer && Math.abs(centerX - player.current.x) < 54 && isPejorativeInContext(word);
    });
  };

  const processMiss = (word: FallingWord) => {
    const stats = statsRef.current;
    stats.wordsProcessed += 1;
    const cat = word.item.category;
    if (cat === "pejorative" || (cat === "ambivalent" && word.contextValue === "pejorative")) {
      addScore(cat === "ambivalent" ? SCORING.wrongAmbivalent : SCORING.missPejorative, false);
      stats.pejorativesMissed += 1;
      stats.review.unshift({ item: word.item, reason: `« ${word.item.text} » a traversé l'écran alors qu'il portait une valeur négative.` });
      combo.current = 1;
      feedback("Un mot péjoratif est passé : la critique n'a pas été neutralisée.");
    } else if (cat === "meliorative" || (cat === "ambivalent" && word.contextValue === "meliorative")) {
      addScore(cat === "ambivalent" ? SCORING.correctAmbivalent : SCORING.protectMeliorative, true);
      stats.meliorativesProtected += 1;
      if (cat === "ambivalent") stats.ambivalentResolved += 1;
      combo.current += 1;
      feedback(cat === "ambivalent" ? "Contexte bien lu : ce mot valorisait l'idée." : "Bonne distinction : mot mélioratif protégé.");
    }
    stats.comboMax = Math.max(stats.comboMax, combo.current);
  };

  const absorbBonus = (word: FallingWord) => {
    const effect = word.item.bonusEffect ?? "scoreMultiplier";
    bonusEffect.current = effect;
    bonusUntil.current = performance.now() + 5200;
    statsRef.current.bonusAbsorbed += 1;
    statsRef.current.wordsProcessed += 1;
    addScore(SCORING.absorbBonus, true);
    setActiveBonus(word.item.text);
    feedback(`Bonus : ${word.item.text}. ${word.item.explanation}`);
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, now: number) => {
    const sx = width / GAME_SIZE.width;
    const sy = height / GAME_SIZE.height;
    ctx.save();
    ctx.scale(sx, sy);
    ctx.clearRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);
    const sky = ctx.createLinearGradient(0, 0, 0, GAME_SIZE.height);
    sky.addColorStop(0, "#122b47");
    sky.addColorStop(0.54, "#2d6389");
    sky.addColorStop(1, "#102135");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);
    ctx.globalAlpha = config.options.reducedMotion ? 0.22 : 0.36;
    for (let i = 0; i < 7; i++) {
      const x = (i * 170 + (config.options.reducedMotion ? 0 : now / (60 + i * 11))) % 1080 - 80;
      ctx.fillStyle = "#dbeafe";
      ctx.beginPath();
      ctx.ellipse(x, 92 + i * 42, 54, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 38, 88 + i * 42, 38, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(210,235,255,.12)";
    ctx.lineWidth = 1;
    for (let x = 120; x < GAME_SIZE.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_SIZE.height);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(74, 132, 164, .36)";
    ctx.beginPath();
    ctx.moveTo(0, 610);
    ctx.bezierCurveTo(180, 570, 320, 630, 500, 590);
    ctx.bezierCurveTo(690, 548, 790, 606, 960, 570);
    ctx.lineTo(960, 620);
    ctx.lineTo(0, 620);
    ctx.fill();
    ctx.fillStyle = "#102033";
    for (let i = 0; i < 18; i++) ctx.fillRect(i * 58, 560 - (i % 5) * 18, 42, 70 + (i % 4) * 16);
    ctx.fillStyle = "#182a3e";
    ctx.beginPath();
    ctx.moveTo(454, 560);
    ctx.lineTo(480, 452);
    ctx.lineTo(507, 560);
    ctx.fill();
    ctx.strokeStyle = "rgba(248, 217, 133, .45)";
    ctx.beginPath();
    ctx.arc(480, 520, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#f9d985";
    for (let i = 0; i < 16; i++) ctx.fillRect(i * 59 + 18, 585 - (i % 4) * 16, 6, 5);

    ctx.fillStyle = "#e8f1ff";
    ctx.beginPath();
    ctx.moveTo(player.current.x, player.current.y - 24);
    ctx.lineTo(player.current.x - 28, player.current.y + 24);
    ctx.lineTo(player.current.x, player.current.y + 12);
    ctx.lineTo(player.current.x + 28, player.current.y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6dd3ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    shots.current.forEach((shot) => {
      ctx.fillStyle = "#d9fbff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#9bf6ff";
      ctx.fillRect(shot.x, shot.y, shot.w, shot.h);
      ctx.shadowBlur = 0;
    });

    pulses.current.forEach((pulse) => {
      const age = (now - pulse.born) / 520;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.strokeStyle = pulse.ok ? "#f8d57d" : "#ff8ea3";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 28 + age * 86, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = pulse.ok ? "rgba(248,213,125,.14)" : "rgba(255,142,163,.12)";
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 18 + age * 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    words.current.forEach((word) => {
      const item = word.item;
      const color = colors[item.category];
      ctx.save();
      ctx.shadowBlur = item.category === "neutral" ? 2 : 13;
      ctx.shadowColor = color;
      ctx.fillStyle = item.category === "neutral" ? "rgba(55,65,81,.88)" : "rgba(10,20,36,.84)";
      const r = item.category === "bonus" ? 22 : item.category === "ambivalent" ? 6 : 12;
      ctx.beginPath();
      ctx.roundRect(word.x, word.y, word.w, word.h, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color;
      ctx.setLineDash(item.category === "ambivalent" ? [5, 5] : []);
      ctx.lineWidth = item.category === "meliorative" ? 3 : 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.beginPath();
      if (item.category === "pejorative") {
        ctx.moveTo(word.x + 18, word.y + word.h / 2 - 9);
        ctx.lineTo(word.x + 29, word.y + word.h / 2 + 10);
        ctx.lineTo(word.x + 7, word.y + word.h / 2 + 10);
        ctx.closePath();
      } else if (item.category === "meliorative") {
        ctx.arc(word.x + 18, word.y + word.h / 2, 9, 0, Math.PI * 2);
      } else if (item.category === "bonus") {
        ctx.roundRect(word.x + 8, word.y + word.h / 2 - 8, 22, 16, 8);
      } else if (item.category === "ambivalent") {
        ctx.arc(word.x + 18, word.y + word.h / 2, 10, 0, Math.PI * 2);
      } else {
        ctx.rect(word.x + 9, word.y + word.h / 2 - 8, 18, 16);
      }
      ctx.fill();
      ctx.fillStyle = item.category === "ambivalent" ? "#160f25" : "#102135";
      ctx.font = "bold 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const glyph = item.category === "pejorative" ? "!" : item.category === "meliorative" ? "+" : item.category === "bonus" ? "V" : item.category === "ambivalent" ? "?" : "=";
      ctx.fillText(glyph, word.x + 18, word.y + word.h / 2 + 1);
      ctx.fillStyle = "#f8fafc";
      ctx.font = `${config.options.readable ? 24 : 20}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.text, word.x + word.w / 2 + 10, word.y + word.h / 2 + 1);
      if ((item.category === "ambivalent" && (difficulty.help > 0.5 || bonusEffect.current === "contextReveal")) && item.contextExamples?.[0]) {
        const context = item.contextExamples.find((example) => example.value === word.contextValue) ?? item.contextExamples[0];
        ctx.fillStyle = "rgba(233,213,255,.9)";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(context.sentence.slice(0, 58), word.x + word.w / 2, word.y + word.h + 13);
      }
      if (difficulty.help > 0.75 || bonusEffect.current === "revealCategories") {
        ctx.fillStyle = color;
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(categoryLabel(item), word.x + word.w / 2, word.y - 7);
      } else if (item.category === "ambivalent") {
        ctx.fillStyle = "#e9d5ff";
        ctx.font = "15px Inter, system-ui, sans-serif";
        ctx.fillText("?", word.x + word.w - 13, word.y + 14);
      }
      ctx.restore();
    });
    ctx.restore();
  }, [config.options.readable, config.options.reducedMotion, difficulty.help]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    startedAt.current = performance.now();
    statsRef.current = initialStats();
    words.current = [];
    shots.current = [];
    pulses.current = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(320, Math.floor(rect.height * devicePixelRatio));
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      if (!pausedRef.current) {
        const dx = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
        const dy = (keys.current.down ? 1 : 0) - (keys.current.up ? 1 : 0);
        player.current.x = Math.max(38, Math.min(GAME_SIZE.width - 38, player.current.x + dx * 5.4));
        player.current.y = Math.max(360, Math.min(GAME_SIZE.height - 40, player.current.y + dy * 4.8));
        if (touch.current.x !== null) {
          const rect = canvas.getBoundingClientRect();
          player.current.x = Math.max(38, Math.min(GAME_SIZE.width - 38, (touch.current.x / rect.width) * GAME_SIZE.width));
          player.current.y = Math.max(360, Math.min(GAME_SIZE.height - 40, (touch.current.y! / rect.height) * GAME_SIZE.height));
        }
        const mobileAutoFire = matchMedia("(pointer: coarse)").matches;
        if (keys.current.fire || ((config.options.autoFire || mobileAutoFire) && shouldAutoFire())) fire(now);
        if (keys.current.protect) protect(now);
        if (now - lastSpawn.current > difficulty.spawnMs) spawnWord(now);
        shots.current.forEach((s) => (s.y -= 8.5));
        pulses.current = pulses.current.filter((pulse) => now - pulse.born < 520);
        words.current.forEach((w) => {
          const frozen = bonusEffect.current === "freezePejoratives" && w.item.category === "pejorative" && now < bonusUntil.current;
          const slow = bonusEffect.current === "slowMotion" && now < bonusUntil.current;
          w.y += frozen ? 0.12 : w.speed * (slow ? 0.38 : 1);
        });
        const hitWords = new Set<string>();
        shots.current = shots.current.filter((shot) => {
          if (shot.y < -30) return false;
          const hit = words.current.find((w) => shot.x < w.x + w.w && shot.x + shot.w > w.x && shot.y < w.y + w.h && shot.y + shot.h > w.y);
          if (!hit) return true;
          hitWords.add(hit.id);
          processHit(hit);
          return false;
        });
        words.current = words.current.filter((word) => {
          if (hitWords.has(word.id)) return false;
          const nearPlayer = Math.abs(word.x + word.w / 2 - player.current.x) < 42 && Math.abs(word.y + word.h / 2 - player.current.y) < 38;
          if (nearPlayer && word.item.category === "bonus") {
            absorbBonus(word);
            return false;
          }
          if (word.y > GAME_SIZE.height + 20) {
            processMiss(word);
            return false;
          }
          return true;
        });
        setComboView(combo.current);
        if (now > bonusUntil.current) {
          bonusEffect.current = null;
          setActiveBonus(undefined);
        }
        if ((now - startedAt.current) / 1000 > (config.mode === "training" ? 105 : 90) || statsRef.current.wordsProcessed >= GAME_SIZE.bossAfterProcessed || statsRef.current.mistakes >= 6) {
          onBoss(statsRef.current);
          return;
        }
      }
      draw(ctx, canvas.clientWidth, canvas.clientHeight, now);
      if (Math.floor(now / 350) % 2 === 0) setStatsView({ ...statsRef.current, review: statsRef.current.review.slice(0, 8) });
      raf = requestAnimationFrame(loop);
    };

    const onTouch = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      touch.current.x = t.clientX - rect.left;
      touch.current.y = t.clientY - rect.top;
    };
    const clearTouch = () => {
      touch.current.x = null;
      touch.current.y = null;
    };
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    canvas.addEventListener("touchend", clearTouch);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchend", clearTouch);
    };
  }, [config, difficulty.spawnMs, draw, keys, onBoss, touch]);

  return (
    <div className="game-layout" data-gameplay>
      <Hud stats={statsView} combo={comboView} activeBonus={activeBonus} />
      <div className="stage-wrap">
        <canvas ref={canvasRef} className="game-canvas" aria-label="Zone de jeu Mission Nuance" />
        <div className="action-legend">
          <span><kbd>E</kbd> protéger / absorber</span>
          <span><kbd>Espace</kbd> neutraliser</span>
        </div>
        <div className="message-strip">{message}</div>
        <button className="protect-button" onClick={() => protect(performance.now())}>Protéger</button>
        <button className="pause-button" onClick={() => setPaused(true)}>Pause</button>
        {paused && <PauseOverlay onResume={() => setPaused(false)} onMenu={onMenu} />}
      </div>
    </div>
  );
}
