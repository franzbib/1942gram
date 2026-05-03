import { useCallback, useEffect, useRef, useState } from "react";
import { getLexicon } from "../data/lexicalItems";
import { BASE_DAMAGE_BY_LEVEL, GAME_SIZE, MAX_WEAPON_LOCK_MS, SCORING, WEAPON_LOCK_BY_LEVEL, WORD_VISUAL_SCALE } from "../engine/constants";
import { getDifficulty } from "../engine/difficulty";
import { buildResult, initialStats } from "../engine/scoring";
import type { GameConfig, GameResult, LexicalItem, SessionStats } from "../engine/types";
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
type BaseImpact = { id: string; x: number; born: number };
type FeedbackTone = "neutral" | "success" | "error";
type BaseDamageState = "healthy" | "damaged" | "heavy" | "critical" | "destroyed";

const semanticColors = {
  pejorative: "#8b2434",
  meliorative: "#f3bd4f",
  neutral: "#9ca3af",
  bonus: "#5eead4",
  ambivalent: "#b06df3",
};

const neutralWordSkins = [
  { fill: "rgba(244, 241, 234, .95)", stroke: "rgba(11, 20, 38, .15)" },
  { fill: "rgba(240, 237, 230, .96)", stroke: "rgba(11, 20, 38, .18)" },
  { fill: "rgba(235, 232, 226, .95)", stroke: "rgba(11, 20, 38, .12)" },
];

function neutralSkinFor(text: string) {
  const code = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return neutralWordSkins[code % neutralWordSkins.length];
}

function categoryLabel(item: LexicalItem) {
  return item.category === "pejorative" ? "péjoratif" : item.category === "meliorative" ? "mélioratif" : item.category === "neutral" ? "neutre" : item.category === "bonus" ? "bonus" : "contexte ?";
}

function baseStateFor(health: number): BaseDamageState {
  if (health <= 0) return "destroyed";
  if (health <= 25) return "critical";
  if (health <= 50) return "heavy";
  if (health <= 75) return "damaged";
  return "healthy";
}

function drawCrack(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 8 * scale, y + 10 * scale);
  ctx.lineTo(x + 2 * scale, y + 18 * scale);
  ctx.moveTo(x + 8 * scale, y + 10 * scale);
  ctx.lineTo(x + 16 * scale, y + 15 * scale);
  ctx.stroke();
}

export default function GameCanvas({
  config,
  onBoss,
  onMenu,
  onGameOver,
}: {
  config: GameConfig;
  onBoss: (stats: SessionStats) => void;
  onMenu: () => void;
  onGameOver: (result: GameResult) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statsRef = useRef(initialStats());
  const [statsView, setStatsView] = useState(statsRef.current);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("Détruisez les mots péjoratifs. Protégez les mots mélioratifs.");
  const [messageTone, setMessageTone] = useState<FeedbackTone>("neutral");
  const [comboView, setComboView] = useState(1);
  const [activeBonus, setActiveBonus] = useState<string | undefined>();
  const [fireLockedMs, setFireLockedMs] = useState(0);
  const pausedRef = useRef(false);
  const gameOverScheduled = useRef(false);
  const baseDestroyedAt = useRef<number | null>(null);
  const keys = useKeyboardControls(() => setPaused((p) => !p));
  const touch = useTouchControls();
  const words = useRef<FallingWord[]>([]);
  const shots = useRef<Shot[]>([]);
  const pulses = useRef<Pulse[]>([]);
  const baseImpacts = useRef<BaseImpact[]>([]);
  const player = useRef<{ x: number; y: number }>({ x: GAME_SIZE.width / 2, y: GAME_SIZE.playerY });
  const combo = useRef(1);
  const lastFire = useRef(0);
  const lastProtect = useRef(0);
  const lastSpawn = useRef(0);
  const startedAt = useRef(0);
  const bonusUntil = useRef(0);
  const bonusEffect = useRef<string | null>(null);
  const weaponDisabledUntil = useRef(0);
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

  const feedback = (text: string, tone: FeedbackTone = "neutral") => {
    setMessage(text);
    setMessageTone(tone);
  };

  const wordSizePreset = () => {
    const scale = config.options.readable ? WORD_VISUAL_SCALE.readable : WORD_VISUAL_SCALE.normal;
    const baseFont = config.options.readable ? 19 : 16;
    return {
      fontSize: Math.max(config.options.readable ? 16 : 14, baseFont * difficulty.readableScale * scale),
      xPad: config.options.readable ? 14 : 10,
      yPad: config.options.readable ? 9 : 6,
      minWidth: config.options.readable ? 60 : 48,
    };
  };

  const spawnWord = (now: number) => {
    if (words.current.length >= GAME_SIZE.maxObjects) return;
    const pool = lexicon.filter((item) => {
      if (config.level === "A2") return item.category !== "neutral" && item.category !== "ambivalent" && item.category !== "bonus";
      if (config.level === "B1") return item.category !== "ambivalent" || Math.random() < 0.35;
      return true;
    });
    const item = choice(pool);
    const size = wordSizePreset();
    const fontSize = item.text.length > 16 ? size.fontSize - 1.5 : size.fontSize;
    const width = Math.max(size.minWidth, item.text.length * fontSize * 0.56 + size.xPad * 2);
    const context = item.category === "ambivalent" ? choice(item.contextExamples ?? []) : undefined;
    words.current.push({
      id: uid("word"),
      item,
      x: 30 + Math.random() * (GAME_SIZE.width - width - 60),
      y: -40,
      speed: (0.55 + Math.random() * 0.55) * difficulty.speed,
      w: width,
      h: fontSize + size.yPad * 2,
      contextValue: context?.value,
    });
    lastSpawn.current = now;
  };

  const fire = (now: number) => {
    if (now < weaponDisabledUntil.current) return;
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

  const lockWeapon = (now: number) => {
    const modeFactor = config.mode === "training" ? 0.75 : 1;
    const duration = WEAPON_LOCK_BY_LEVEL[config.level] * modeFactor;
    weaponDisabledUntil.current = Math.min(Math.max(weaponDisabledUntil.current, now) + duration, now + MAX_WEAPON_LOCK_MS);
    statsRef.current.weaponLocks += 1;
    setFireLockedMs(Math.max(0, weaponDisabledUntil.current - now));
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
      feedback(cat === "ambivalent" ? "Belle nuance : le contexte rendait ce mot critique." : "Péjoratif reconnu : neutralisation juste.", "success");
    } else if (cat === "meliorative" || (cat === "ambivalent" && word.contextValue === "meliorative")) {
      if (bonusEffect.current === "precisionBeam" && performance.now() < bonusUntil.current) return;
      addScore(SCORING.shootMeliorative, false);
      stats.meliorativesDestroyed += 1;
      stats.review.unshift({ item: word.item, reason: `Vous avez tiré sur « ${word.item.text} ». Ce mot valorise généralement l'idée.` });
      combo.current = 1;
      lockWeapon(performance.now());
      feedback("Mot mélioratif détruit : tir désactivé.", "error");
    } else if (cat === "bonus") {
      addScore(SCORING.shootBonus, false);
      stats.review.unshift({ item: word.item, reason: `« ${word.item.text} » était un verbe-bonus à absorber.` });
      feedback("Ce verbe devait être absorbé, pas détruit.", "error");
    } else if (cat === "neutral" || word.contextValue === "neutral") {
      addScore(SCORING.shootNeutral, false);
      stats.neutralShot += 1;
      combo.current = 1;
      feedback("Mot neutre : il décrit sans juger.", "neutral");
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
      feedback(cat === "ambivalent" ? "Protection juste : le contexte rendait ce mot valorisant." : "Mot valorisant protégé.", "success");
      return true;
    }
    if (isPejorativeInContext(word)) {
      addScore(cat === "ambivalent" ? SCORING.wrongAmbivalent : SCORING.missPejorative, false);
      stats.pejorativesMissed += 1;
      stats.review.unshift({ item: word.item, reason: `Vous avez protégé « ${word.item.text} », alors que le contexte portait un jugement négatif.` });
      combo.current = 1;
      feedback("Ce mot devait être neutralisé, pas protégé.", "error");
      return true;
    }
    if (cat === "neutral" || word.contextValue === "neutral") {
      addScore(-15, false);
      stats.neutralShot += 1;
      feedback("Mot neutre : il suffisait de l'ignorer.", "neutral");
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
    if (!target) feedback("Aucun mot à protéger dans la zone d'analyse.", "neutral");
  };

  const shouldAutoFire = () => {
    return words.current.some((word) => {
      const centerX = word.x + word.w / 2;
      const abovePlayer = word.y + word.h < player.current.y && word.y > 45;
      return abovePlayer && Math.abs(centerX - player.current.x) < 54 && isPejorativeInContext(word);
    });
  };

  const damageBase = (word: FallingWord) => {
    const stats = statsRef.current;
    const damage = BASE_DAMAGE_BY_LEVEL[config.level];
    const now = performance.now();
    stats.baseHealth = Math.max(0, stats.baseHealth - damage);
    stats.pejorativesHitBase += 1;
    stats.failureReason = stats.baseHealth <= 0 ? "baseDestroyed" : stats.failureReason;
    if (stats.baseHealth <= 0 && baseDestroyedAt.current === null) baseDestroyedAt.current = now;
    baseImpacts.current.push({ id: uid("base"), x: word.x + word.w / 2, born: now });
  };

  const processMiss = (word: FallingWord) => {
    const stats = statsRef.current;
    stats.wordsProcessed += 1;
    const cat = word.item.category;
    if (cat === "pejorative" || (cat === "ambivalent" && word.contextValue === "pejorative")) {
      addScore(cat === "ambivalent" ? SCORING.wrongAmbivalent : SCORING.missPejorative, false);
      stats.pejorativesMissed += 1;
      damageBase(word);
      stats.review.unshift({ item: word.item, reason: `« ${word.item.text} » a traversé l'écran alors qu'il portait une valeur négative.` });
      combo.current = 1;
      feedback("Péjoratif laissé passer : la base perd en clarté.", "error");
    } else if (cat === "meliorative" || (cat === "ambivalent" && word.contextValue === "meliorative")) {
      addScore(cat === "ambivalent" ? SCORING.correctAmbivalent : SCORING.protectMeliorative, true);
      stats.meliorativesProtected += 1;
      if (cat === "ambivalent") stats.ambivalentResolved += 1;
      combo.current += 1;
      feedback(cat === "ambivalent" ? "Contexte bien lu : ce mot valorisait l'idée." : "Mot valorisant protégé.", "success");
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
    feedback(`Bonus : ${word.item.text}. ${word.item.explanation}`, "success");
  };

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, now: number) => {
    const sx = width / GAME_SIZE.width;
    const sy = height / GAME_SIZE.height;
    const latestImpact = baseImpacts.current.at(-1);
    const shakeAge = latestImpact ? now - latestImpact.born : 9999;
    const shake = config.options.reducedMotion ? 0 : Math.max(0, 1 - shakeAge / 260) * (statsRef.current.baseHealth <= 25 ? 5 : 3);
    ctx.save();
    ctx.scale(sx, sy);
    if (shake) ctx.translate(Math.sin(now / 22) * shake, Math.cos(now / 27) * shake * 0.55);
    ctx.clearRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);
    const sky = ctx.createLinearGradient(0, 0, 0, GAME_SIZE.height);
    sky.addColorStop(0, "#080f1c");
    sky.addColorStop(0.6, "#0f1c30");
    sky.addColorStop(1, "#0a1120");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_SIZE.width, GAME_SIZE.height);
    ctx.globalAlpha = config.options.reducedMotion ? 0.22 : 0.36;
    for (let i = 0; i < 7; i++) {
      const x = (i * 170 + (config.options.reducedMotion ? 0 : now / (60 + i * 11))) % 1080 - 80;
      ctx.fillStyle = "rgba(244, 241, 234, 0.4)";
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
    const baseHealth = statsRef.current.baseHealth;
    const baseState = baseStateFor(baseHealth);
    ctx.fillStyle = "rgba(74, 132, 164, .36)";
    ctx.beginPath();
    ctx.moveTo(0, 610);
    ctx.bezierCurveTo(180, 570, 320, 630, 500, 590);
    ctx.bezierCurveTo(690, 548, 790, 606, 960, 570);
    ctx.lineTo(960, 620);
    ctx.lineTo(0, 620);
    ctx.fill();
    ctx.fillStyle = "#102033";
    for (let i = 0; i < 18; i++) ctx.fillRect(i * 58, 552 - (i % 5) * 14, 38, 52 + (i % 4) * 12);

    const baseTop = GAME_SIZE.baseY - 36;
    const baseHeight = 58;
    const baseFill = baseState === "destroyed" ? "#1a1620" : baseState === "critical" ? "#382025" : baseState === "heavy" ? "#2a2c36" : baseState === "damaged" ? "#182436" : "#0d1a2e";
    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.fillRect(18, baseTop + 15, GAME_SIZE.width - 36, baseHeight + 10);
    ctx.fillStyle = baseFill;
    ctx.beginPath();
    ctx.roundRect(34, baseTop + 20, GAME_SIZE.width - 68, 34, 7);
    ctx.fill();
    ctx.fillStyle = baseState === "destroyed" ? "#110e14" : "#0b1426";
    ctx.fillRect(48, baseTop + 48, GAME_SIZE.width - 96, 18);

    const buildings = [
      { x: 82, w: 44, h: 44, label: "LEX" },
      { x: 148, w: 62, h: 58, label: "NU" },
      { x: 232, w: 50, h: 38, label: "ARG" },
      { x: 324, w: 78, h: 64, label: "TXT" },
      { x: 438, w: 86, h: 78, label: "AMI" },
      { x: 562, w: 70, h: 52, label: "CTX" },
      { x: 666, w: 56, h: 40, label: "B1" },
      { x: 760, w: 72, h: 60, label: "B2" },
      { x: 858, w: 46, h: 46, label: "FLE" },
    ];
    buildings.forEach((b, index) => {
      const damaged = baseState === "destroyed" || (baseState === "critical" && index % 2 === 0) || (baseState === "heavy" && index % 3 === 0) || (baseState === "damaged" && index % 5 === 0);
      const collapse = baseState === "destroyed" ? 18 + (index % 3) * 5 : damaged && baseState === "critical" ? 8 : damaged && baseState === "heavy" ? 4 : 0;
      ctx.fillStyle = damaged ? "rgba(38, 28, 32, .94)" : "rgba(22, 38, 56, .96)";
      ctx.beginPath();
      ctx.roundRect(b.x, baseTop + 20 - b.h + collapse, b.w, b.h, 4);
      ctx.fill();
      ctx.fillStyle = damaged ? "rgba(212, 175, 55, .15)" : "rgba(212, 175, 55, .5)";
      for (let wx = b.x + 9; wx < b.x + b.w - 8; wx += 15) {
        for (let wy = baseTop + 28 - b.h + collapse; wy < baseTop + 14 + collapse; wy += 14) {
          if (!damaged || (wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 5, 4);
        }
      }
      ctx.fillStyle = "rgba(244, 241, 234, .75)";
      ctx.font = "bold 9px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      if (!damaged || baseState !== "destroyed") ctx.fillText(b.label, b.x + b.w / 2, baseTop + 44 + collapse);
    });

    ctx.fillStyle = "rgba(232, 241, 247, .82)";
    ctx.font = "12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Base discursive", 18, GAME_SIZE.baseY + 16);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.fillRect(132, GAME_SIZE.baseY + 8, 118, 8);
    ctx.fillStyle = baseHealth < 25 ? "#ff9aa7" : baseHealth < 51 ? "#f4c26d" : "#8fd7c1";
    ctx.fillRect(132, GAME_SIZE.baseY + 8, 118 * Math.max(0, baseHealth / 100), 8);

    if (baseState !== "healthy") {
      ctx.strokeStyle = "rgba(246, 220, 190, .46)";
      ctx.lineWidth = 2;
      const cracks = baseState === "damaged" ? 4 : baseState === "heavy" ? 8 : 13;
      for (let i = 0; i < cracks; i++) drawCrack(ctx, 276 + i * 48, baseTop + 18 + (i % 3) * 8, baseState === "critical" || baseState === "destroyed" ? 1.2 : 0.85);
    }

    if (baseState === "heavy" || baseState === "critical" || baseState === "destroyed") {
      const smokeCount = config.options.reducedMotion ? 3 : baseState === "heavy" ? 5 : 9;
      for (let i = 0; i < smokeCount; i++) {
        const drift = config.options.reducedMotion ? 0 : Math.sin(now / 650 + i) * 7;
        const x = 155 + i * 82 + drift;
        const y = baseTop - 30 - (config.options.reducedMotion ? i % 2 : (now / 55 + i * 9) % 34);
        ctx.fillStyle = baseState === "destroyed" ? "rgba(32, 28, 32, .42)" : "rgba(85, 81, 83, .35)";
        ctx.beginPath();
        ctx.ellipse(x, y, 18 + (i % 3) * 5, 8 + (i % 2) * 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (baseState === "critical" || baseState === "destroyed") {
      const flameCount = config.options.reducedMotion ? 2 : 5;
      for (let i = 0; i < flameCount; i++) {
        const x = 238 + i * 126;
        const flicker = config.options.reducedMotion ? 0 : Math.sin(now / 90 + i) * 3;
        ctx.fillStyle = "rgba(244, 113, 83, .72)";
        ctx.beginPath();
        ctx.moveTo(x, baseTop + 14);
        ctx.quadraticCurveTo(x + 10, baseTop - 8 + flicker, x + 20, baseTop + 14);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 212, 126, .72)";
        ctx.beginPath();
        ctx.moveTo(x + 6, baseTop + 14);
        ctx.quadraticCurveTo(x + 12, baseTop + 1 + flicker, x + 17, baseTop + 14);
        ctx.fill();
      }
    }
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

    const weaponLocked = now < weaponDisabledUntil.current;
    ctx.globalAlpha = weaponLocked && Math.floor(now / 120) % 2 === 0 ? 0.55 : 1;
    
    // Vaisseau joueur : avion de papier typographique stylisé
    ctx.fillStyle = "#f4f1ea";
    ctx.beginPath();
    ctx.moveTo(player.current.x, player.current.y - 28);
    ctx.lineTo(player.current.x - 22, player.current.y + 22);
    ctx.lineTo(player.current.x, player.current.y + 12);
    ctx.lineTo(player.current.x + 22, player.current.y + 22);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#d4cebe"; // Ombre aile droite
    ctx.beginPath();
    ctx.moveTo(player.current.x, player.current.y - 28);
    ctx.lineTo(player.current.x, player.current.y + 12);
    ctx.lineTo(player.current.x + 22, player.current.y + 22);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1;
    if (weaponLocked) {
      ctx.strokeStyle = "rgba(139, 58, 74, .82)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.current.x, player.current.y - 2, 34, 0, Math.PI * 2);
      ctx.stroke();
    }

    shots.current.forEach((shot) => {
      ctx.fillStyle = "#f4f1ea";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(244, 241, 234, 0.6)";
      ctx.fillRect(shot.x + shot.w / 2 - 1, shot.y, 2, shot.h);
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

    baseImpacts.current.forEach((impact) => {
      const age = (now - impact.born) / 900;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - age);
      ctx.strokeStyle = "rgba(255, 154, 167, .82)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(impact.x, GAME_SIZE.baseY + 8, 10 + age * 34, 0, Math.PI * 2);
      ctx.stroke();
      if (!config.options.reducedMotion) {
        ctx.fillStyle = "rgba(248, 217, 133, .68)";
        for (let i = 0; i < 7; i++) {
          const angle = (Math.PI * 2 * i) / 7;
          ctx.fillRect(impact.x + Math.cos(angle) * (12 + age * 30), GAME_SIZE.baseY + 8 + Math.sin(angle) * (7 + age * 22), 3, 3);
        }
      }
      ctx.restore();
    });

    if (baseDestroyedAt.current !== null) {
      const age = Math.min(1, (now - baseDestroyedAt.current) / 1200);
      ctx.save();
      ctx.globalAlpha = 1 - age * 0.25;
      ctx.strokeStyle = "rgba(255, 190, 125, .78)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(GAME_SIZE.width / 2, GAME_SIZE.baseY - 12, 60 + age * 210, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 120, 98, .12)";
      ctx.beginPath();
      ctx.arc(GAME_SIZE.width / 2, GAME_SIZE.baseY - 12, 44 + age * 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    words.current.forEach((word) => {
      const item = word.item;
      const isBonus = item.category === "bonus";
      const isAmbivalent = item.category === "ambivalent";
      const fullHints = config.options.visualHints === "full";
      const semanticColor = semanticColors[item.category];
      const skin = neutralSkinFor(item.text);
      const fill = fullHints ? (item.category === "neutral" ? "rgba(55,65,81,.88)" : "rgba(10,20,36,.84)") : isBonus ? "rgba(226, 241, 238, .96)" : skin.fill;
      const stroke = fullHints ? semanticColor : isBonus ? "rgba(68, 117, 112, .52)" : isAmbivalent ? "rgba(103, 88, 130, .44)" : skin.stroke;
      ctx.save();
      ctx.shadowBlur = isBonus ? 10 : 5;
      ctx.shadowColor = isBonus ? "rgba(136, 178, 171, .45)" : "rgba(15, 23, 42, .28)";
      ctx.fillStyle = fill;
      const r = isBonus ? 22 : 10;
      ctx.beginPath();
      ctx.roundRect(word.x, word.y, word.w, word.h, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = stroke;
      ctx.setLineDash(isAmbivalent && !fullHints ? [5, 5] : []);
      ctx.lineWidth = fullHints && item.category === "meliorative" ? 3 : 2;
      ctx.stroke();
      ctx.setLineDash([]);
      if (isBonus || isAmbivalent || fullHints) {
        ctx.fillStyle = isBonus ? "rgba(68, 117, 112, .76)" : isAmbivalent && !fullHints ? "rgba(103, 88, 130, .72)" : semanticColor;
        ctx.beginPath();
        if (isBonus) ctx.roundRect(word.x + 8, word.y + word.h / 2 - 8, 22, 16, 8);
        else ctx.arc(word.x + 18, word.y + word.h / 2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f4f1ea";
        ctx.font = "bold 11px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const glyph = isBonus ? "V" : isAmbivalent && !fullHints ? "?" : item.category === "pejorative" ? "!" : item.category === "meliorative" ? "+" : "=";
        ctx.fillText(glyph, word.x + 18, word.y + word.h / 2 + 1);
      }
      ctx.fillStyle = fullHints ? "#f4f1ea" : "#0b1426";
      const renderedFont = Math.max(config.options.readable ? 16 : 14, word.h - (config.options.readable ? 18 : 12));
      ctx.font = `${renderedFont}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.text, word.x + word.w / 2 + (isBonus || isAmbivalent || fullHints ? 10 : 0), word.y + word.h / 2 + 1);
      if ((item.category === "ambivalent" && bonusEffect.current === "contextReveal") && item.contextExamples?.[0]) {
        const context = item.contextExamples.find((example) => example.value === word.contextValue) ?? item.contextExamples[0];
        ctx.fillStyle = "rgba(236,230,244,.92)";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(context.sentence.slice(0, 58), word.x + word.w / 2, word.y + word.h + 13);
      }
      if (fullHints || bonusEffect.current === "revealCategories") {
        ctx.fillStyle = semanticColor;
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(categoryLabel(item), word.x + word.w / 2, word.y - 7);
      } else if (item.category === "ambivalent") {
        ctx.fillStyle = "#5d4f75";
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
    baseImpacts.current = [];
    weaponDisabledUntil.current = 0;
    gameOverScheduled.current = false;
    baseDestroyedAt.current = null;
    setFireLockedMs(0);

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
        baseImpacts.current = baseImpacts.current.filter((impact) => now - impact.born < 900 || statsRef.current.baseHealth <= 0);
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
          if (isPejorativeInContext(word) && word.y + word.h >= GAME_SIZE.baseY) {
            processMiss(word);
            return false;
          }
          if (word.y > GAME_SIZE.height + 20) {
            processMiss(word);
            return false;
          }
          return true;
        });
        setComboView(combo.current);
        setFireLockedMs(Math.max(0, weaponDisabledUntil.current - now));
        if (now > bonusUntil.current) {
          bonusEffect.current = null;
          setActiveBonus(undefined);
        }
        if (statsRef.current.baseHealth <= 0) {
          statsRef.current.failureReason = "baseDestroyed";
          if (!gameOverScheduled.current) {
            gameOverScheduled.current = true;
            baseDestroyedAt.current = baseDestroyedAt.current ?? now;
            feedback("La base s'effondre : trop de mots péjoratifs sont passés.", "error");
          }
          if (now - (baseDestroyedAt.current ?? now) > (config.options.reducedMotion ? 450 : 1250)) onGameOver(buildResult(statsRef.current, config));
          return;
        }
        if (statsRef.current.mistakes >= 6) {
          statsRef.current.failureReason = "tooManyMistakes";
          onGameOver(buildResult(statsRef.current, config));
          return;
        }
        if ((now - startedAt.current) / 1000 > (config.mode === "training" ? 105 : 90) || statsRef.current.wordsProcessed >= GAME_SIZE.bossAfterProcessed) {
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
  }, [config, difficulty.spawnMs, draw, keys, onBoss, onGameOver, touch]);

  return (
    <div className="game-layout" data-gameplay>
      <Hud stats={statsView} combo={comboView} activeBonus={activeBonus} fireLockedMs={fireLockedMs} />
      <div className="stage-wrap">
        <canvas ref={canvasRef} className="game-canvas" aria-label="Zone de jeu Mission Nuance" />
        <div className="action-legend">
          <span><kbd>E</kbd> protéger / absorber</span>
          <span><kbd>Espace</kbd> neutraliser</span>
        </div>
        <div className={`message-strip ${messageTone}`}>{message}</div>
        <button className="protect-button" onClick={() => protect(performance.now())}>Protéger</button>
        <button className="pause-button" onClick={() => setPaused(true)}>Pause</button>
        {paused && <PauseOverlay onResume={() => setPaused(false)} onMenu={onMenu} />}
      </div>
    </div>
  );
}
