import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight, BarChart3, Brain, Check, ChevronRight, Circle, Coins, Flame, Hammer,
  HeartPulse, History, Home, Lock, Menu, Palette, Plus, Rocket, ScrollText, Settings,
  ShieldCheck, ShoppingBag, Sparkles, Swords, Target, Trash2, Trophy, User, X, Zap,
} from "lucide-react";

const categoryMeta = {
  intellect: { label: "INTELLECT", icon: Brain, color: "violet", emoji: "◈" },
  strength: { label: "STRENGTH", icon: Swords, color: "red", emoji: "✦" },
  vitality: { label: "VITALITY", icon: HeartPulse, color: "emerald", emoji: "◆" },
  creativity: { label: "CREATIVITY", icon: Palette, color: "pink", emoji: "✧" },
  discipline: { label: "DISCIPLINE", icon: Flame, color: "gold", emoji: "✹" },
  social: { label: "SOCIAL", icon: User, color: "blue", emoji: "◇" },
} as const;

type Category = keyof typeof categoryMeta;
type Difficulty = "easy" | "medium" | "hard" | "epic" | "legendary";
type Quest = { id: number; title: string; description: string; category: Category; difficulty: Difficulty; xp: number; gold: number; completed: boolean; createdAt: string };
type GameState = { xp: number; level: number; gold: number; streak: number; quests: Quest[]; attributes: Record<Category, number>; unlocked: string[] };

const rewards: Record<Difficulty, { xp: number; gold: number; label: string; tone: string }> = {
  easy: { xp: 35, gold: 15, label: "EASY", tone: "easy" },
  medium: { xp: 75, gold: 30, label: "MEDIUM", tone: "medium" },
  hard: { xp: 150, gold: 60, label: "HARD", tone: "hard" },
  epic: { xp: 350, gold: 140, label: "EPIC", tone: "epic" },
  legendary: { xp: 750, gold: 300, label: "LEGENDARY", tone: "legendary" },
};

const starterQuests: Quest[] = [
  { id: 101, title: "Complete 3 DSA problems", description: "Sharpen the blade. Focus on arrays, graphs, and one stretch problem.", category: "intellect", difficulty: "epic", xp: 350, gold: 140, completed: false, createdAt: "Today" },
  { id: 102, title: "30 minute strength training", description: "Build momentum with a focused movement session.", category: "strength", difficulty: "medium", xp: 75, gold: 30, completed: false, createdAt: "Today" },
  { id: 103, title: "Deep work — product roadmap", description: "Turn the next big idea into three shippable steps.", category: "creativity", difficulty: "hard", xp: 150, gold: 60, completed: false, createdAt: "Today" },
  { id: 104, title: "Read 20 pages", description: "A small daily investment in the mind.", category: "intellect", difficulty: "easy", xp: 35, gold: 15, completed: true, createdAt: "Today" },
];

const starterState: GameState = {
  xp: 1260,
  level: 4,
  gold: 1240,
  streak: 12,
  quests: starterQuests,
  attributes: { intellect: 65, strength: 48, vitality: 54, creativity: 57, discipline: 71, social: 43 },
  unlocked: ["First Quest", "7 Day Streak", "Knowledge Seeker"],
};

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue] as const;
}

function getLevelFromXp(xp: number) { return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1); }
function getLevelProgress(xp: number, level: number) {
  const floor = Math.max(0, (level - 1) ** 2 * 100);
  const ceiling = level ** 2 * 100;
  return { current: Math.max(0, xp - floor), total: ceiling - floor, percent: Math.min(100, Math.max(0, ((xp - floor) / (ceiling - floor)) * 100)) };
}

function Logo({ small = false }: { small?: boolean }) {
  return <div className={`logo-lockup ${small ? "logo-small" : ""}`}><span className="logo-mark"><Sparkles size={small ? 13 : 16} /></span><span>LIFE<span className="logo-slash">//</span>QUEST</span></div>;
}

function Landing({ onEnter, onSignUp }: { onEnter: () => void; onSignUp: () => void }) {
  return <div className="landing-page">
    <div className="landing-noise" />
    <header className="landing-nav"><Logo /><div className="landing-links"><a href="#system">THE SYSTEM</a><a href="#why">WHY QUEST?</a><button className="nav-login" onClick={onEnter}>SIGN IN <ArrowRight size={14} /></button></div></header>
    <main className="landing-main">
      <section className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS NOW</div>
        <h1>YOUR LIFE.<br /><span>YOUR QUEST.</span></h1>
        <p className="hero-subtitle">Stop managing tasks.<br /><strong>Start leveling up.</strong></p>
        <div className="hero-actions"><button className="primary-button" onClick={onSignUp}>BEGIN YOUR JOURNEY <ArrowRight size={18} /></button><button className="ghost-button" onClick={onEnter}><span className="play-icon">▶</span> WATCH HOW IT WORKS</button></div>
        <div className="hero-proof"><div className="proof-avatars"><span>⌁</span><span>◉</span><span>✦</span><span>+</span></div><span><strong>2,847</strong> adventurers already in motion</span></div>
      </section>
      <section className="hero-visual" aria-label="LIFE QUEST character preview">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
        <div className="float-label label-top"><span className="label-dot violet-dot" /> DAILY XP <strong>+350</strong></div>
        <div className="float-label label-right"><span className="label-dot gold-dot" /> STREAK <strong>12 DAYS</strong></div>
        <div className="float-label label-bottom"><span className="label-dot green-dot" /> LEVEL UP READY</div>
        <div className="character-glow" /><div className="character-card-preview"><div className="card-topline"><span>CHAMPION / 04</span><span>◈</span></div><div className="avatar-core"><div className="avatar-hood" /><div className="avatar-face"><span className="eye eye-left" /><span className="eye eye-right" /><span className="face-mark">✦</span></div><div className="avatar-collar" /></div><div className="character-name">THE WAYFINDER</div><div className="character-class">BALANCED / ASCENDANT</div><div className="preview-xp"><div className="preview-xp-label"><span>EXPERIENCE</span><strong>1260 / 1600 XP</strong></div><div className="xp-track"><div style={{ width: "54%" }} /></div></div><div className="preview-stats"><div><span>INT</span><strong>65</strong></div><div><span>STR</span><strong>48</strong></div><div><span>VIT</span><strong>54</strong></div><div><span>DIS</span><strong>71</strong></div></div></div>
      </section>
    </main>
    <section className="landing-system" id="system"><div><span className="section-kicker">THE LIFE//QUEST SYSTEM</span><h2>Small actions.<br /><span>Mythic momentum.</span></h2></div><p>Every task is a quest. Every completion strengthens an attribute. Every day you show up, your character becomes harder to stop.</p><div className="system-grid"><div><span>01</span><strong>CLAIM A QUEST</strong><p>Turn intent into a clear, rewarding mission.</p></div><div><span>02</span><strong>EARN YOUR XP</strong><p>Progress is calculated, persistent, and yours.</p></div><div><span>03</span><strong>BECOME LEGEND</strong><p>Watch a real character take shape over time.</p></div></div></section>
    <footer className="landing-footer"><Logo small /><span>BUILD THE LIFE YOU WANT TO LIVE.</span><span>© 2026 LIFE//QUEST</span></footer>
  </div>;
}

function OnboardingScreen({ onComplete }: { onComplete: (path: "scholar" | "warrior" | "builder" | "creator" | "balanced") => void }) {
  const [selected, setSelected] = useState<"scholar" | "warrior" | "builder" | "creator" | "balanced">("balanced");
  const paths = [["scholar", "Scholar", "Knowledge, study, and sharper questions.", Brain], ["warrior", "Warrior", "Strength, movement, and resilient energy.", Swords], ["builder", "Builder", "Craft, career, and things that ship.", Hammer], ["creator", "Creator", "Ideas, art, and expressive momentum.", Palette], ["balanced", "Balanced", "A little of everything, consistently.", Sparkles]] as const;
  return <div className="onboarding-page"><div className="onboarding-glow" /><div className="onboarding-shell"><Logo /><div className="onboarding-progress"><span className="active" /><span /><span /></div><span className="section-kicker">ORIGIN STORY / 01</span><h1>Choose your path.</h1><p>The direction is yours. The next step is showing up.</p><div className="path-grid">{paths.map(([id, title, copy, Icon]) => <button key={id} className={`path-card ${selected === id ? "selected" : ""}`} onClick={() => setSelected(id)}><span className="path-icon"><Icon size={22} /></span><strong>{title}</strong><small>{copy}</small>{selected === id && <Check className="path-check" size={15} />}</button>)}</div><button className="primary-button onboarding-continue" onClick={() => onComplete(selected)}>ENTER THE WORLD <ArrowRight size={16} /></button></div></div>;
}

function AuthScreen({ mode, onSwitch }: { mode: "login" | "signup"; onSwitch: () => void }) {
  const isSignup = mode === "signup";
  return <div className="auth-page"><div className="auth-stars" /><div className="auth-card"><Logo /><span className="section-kicker">{isSignup ? "INITIATE OPERATIVE" : "RETURN TO THE WORLD"}</span><h1>{isSignup ? "Create your legend." : "Welcome back, wayfinder."}</h1><p>{isSignup ? "Your progress starts with one decision: show up." : "Your quests are waiting exactly where you left them."}</p><button className="primary-button auth-cta" onClick={() => startLogin()}><span>{isSignup ? "CONTINUE WITH SECURE SIGN-IN" : "SIGN IN SECURELY"}</span><ArrowRight size={16} /></button><div className="auth-divider"><span>SECURE AUTHENTICATION</span></div><div className="auth-benefits"><span><ShieldCheck size={14} /> Your data is private</span><span><Lock size={14} /> Session protected</span><span><Zap size={14} /> Progress persists</span></div><button className="auth-switch" onClick={onSwitch}>{isSignup ? "Already have an account? Sign in" : "New here? Create an account"}</button><button className="back-home" onClick={() => window.location.href = "/"}>← BACK TO LANDING</button></div></div>;
}

function Sidebar({ path, onNavigate, onLogout }: { path: string; onNavigate: (path: string) => void; onLogout: () => void }) {
  const primary = [{ path: "/dashboard", label: "Command Center", icon: Home }, { path: "/quests", label: "Quest Log", icon: ScrollText }, { path: "/character", label: "Character", icon: User }, { path: "/history", label: "History", icon: History }];
  return <aside className="sidebar"><div className="sidebar-top"><Logo /><button className="mobile-menu"><Menu size={18} /></button></div><div className="sidebar-label">NAVIGATION</div><nav>{primary.map(item => { const Icon = item.icon; return <button key={item.path} className={`side-link ${path === item.path ? "active" : ""}`} onClick={() => onNavigate(item.path)}><Icon size={17} /><span>{item.label}</span>{path === item.path && <ChevronRight className="side-chevron" size={14} />}</button>; })}</nav><div className="sidebar-label sidebar-label-space">YOUR WORLD</div><nav><button className={`side-link ${path === "/shop" ? "active" : ""}`} onClick={() => onNavigate("/shop")}><ShoppingBag size={17} /><span>Item Shop</span><span className="new-pill">NEW</span></button><button className={`side-link ${path === "/profile" ? "active" : ""}`} onClick={() => onNavigate("/profile")}><Settings size={17} /><span>Profile & Settings</span></button></nav><div className="sidebar-bottom"><div className="sidebar-quote"><Sparkles size={14} /><span>Consistency is a superpower.</span></div><button className="side-link logout-link" onClick={onLogout}><span className="logout-glyph">↗</span><span>Exit world</span></button></div></aside>;
}

function Topbar({ state, onCreate, username }: { state: GameState; onCreate: () => void; username?: string | null }) {
  const progress = getLevelProgress(state.xp, state.level);
  return <header className="topbar"><div className="mobile-brand"><Logo small /></div><div className="topbar-context"><span className="topbar-kicker">WEDNESDAY, SEPTEMBER 12</span><span className="topbar-title">Good morning, <strong>{username || "Wayfinder"}</strong> <span className="wave">✦</span></span></div><div className="topbar-actions"><div className="top-stat"><span className="top-stat-icon streak-icon"><Flame size={14} /></span><div><small>STREAK</small><strong>{state.streak} DAYS</strong></div></div><div className="top-stat"><span className="top-stat-icon gold-icon"><Coins size={14} /></span><div><small>GOLD</small><strong>{state.gold.toLocaleString()}</strong></div></div><div className="user-avatar">A</div><button className="top-create" onClick={onCreate}><Plus size={16} /> <span>NEW QUEST</span></button></div><div className="mobile-top-stats"><Flame size={15} /><span>{state.streak}</span><Coins size={15} /><span>{state.gold}</span></div></header>;
}

function ProgressHeader({ state }: { state: GameState }) {
  const progress = getLevelProgress(state.xp, state.level);
  return <div className="progress-header"><div className="level-block"><span className="micro-label">CURRENT RANK</span><div className="level-number">{String(state.level).padStart(2, "0")}</div><div className="level-caption">ASCENDANT</div></div><div className="progress-copy"><div className="progress-meta"><span>LEVEL {state.level} PROGRESS</span><strong>{progress.current} <em>/ {progress.total} XP</em></strong></div><div className="big-progress"><div className="big-progress-fill" style={{ width: `${progress.percent}%` }}><span /></div></div><div className="progress-foot"><span><Zap size={13} /> {Math.round(progress.percent)}% to next level</span><span>LEVEL {state.level + 1} <ChevronRight size={13} /></span></div></div><div className="progress-badge"><Trophy size={16} /><span>NEXT MILESTONE</span><strong>SKILL POINT</strong><small>Level {state.level + 1}</small></div></div>;
}

function CharacterOrb({ state }: { state: GameState }) {
  const attrs = Object.entries(state.attributes) as [Category, number][];
  return <div className="character-orb-wrap"><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="character-orb"><div className="orb-glow" /><div className="avatar-large"><div className="avatar-hood" /><div className="avatar-face"><span className="eye eye-left" /><span className="eye eye-right" /><span className="face-mark">✦</span></div><div className="avatar-collar" /></div><div className="orb-level">LEVEL {state.level}</div><div className="orb-name">THE WAYFINDER</div></div>{attrs.map(([key, value], index) => { const meta = categoryMeta[key]; const Icon = meta.icon; return <div key={key} className={`attribute-node attr-${index}`}><div className={`attribute-icon ${meta.color}`}><Icon size={15} /></div><div><span>{meta.label}</span><strong>{value}</strong></div></div>; })}</div>;
}

function QuestCard({ quest, onComplete, onDelete }: { quest: Quest; onComplete: (quest: Quest) => void; onDelete: (id: number) => void }) {
  const meta = categoryMeta[quest.category]; const Icon = meta.icon;
  return <div className={`quest-card ${quest.completed ? "completed" : ""}`}><div className={`quest-category ${meta.color}`}><Icon size={18} /></div><div className="quest-main"><div className="quest-title-row"><h4>{quest.title}</h4>{quest.completed && <span className="completed-tag"><Check size={11} /> COMPLETE</span>}</div><p>{quest.description}</p><div className="quest-rewards"><span className={`difficulty ${rewards[quest.difficulty].tone}`}>{rewards[quest.difficulty].label}</span><span><Zap size={12} /> +{quest.xp} XP</span><span><Coins size={12} /> +{quest.gold}</span></div></div><div className="quest-actions">{quest.completed ? <div className="check-complete"><Check size={16} /></div> : <button className="complete-button" onClick={() => onComplete(quest)}><span>COMPLETE</span><Check size={15} /></button>}<button className="quest-delete" aria-label={`Delete ${quest.title}`} onClick={() => onDelete(quest.id)}><Trash2 size={14} /></button></div></div>;
}

function Dashboard({ state, onCreate, onComplete, onDelete, onNavigate }: { state: GameState; onCreate: () => void; onComplete: (q: Quest) => void; onDelete: (id: number) => void; onNavigate: (path: string) => void }) {
  const active = state.quests.filter(q => !q.completed);
  return <div className="dashboard-page"><ProgressHeader state={state} /><div className="dashboard-grid"><section className="character-panel panel"><div className="panel-heading"><div><span className="section-kicker">YOUR AVATAR</span><h3>Character core</h3></div><button className="text-button" onClick={() => onNavigate("/character")}>VIEW SHEET <ArrowRight size={14} /></button></div><CharacterOrb state={state} /><div className="attribute-legend"><span><i className="legend-dot violet" /> MIND</span><span><i className="legend-dot red" /> BODY</span><span><i className="legend-dot gold" /> WILL</span><span><i className="legend-dot pink" /> CREATE</span></div></section><section className="quests-panel panel"><div className="panel-heading"><div><span className="section-kicker">ACTIVE MISSIONS / {active.length}</span><h3>Today's quests</h3></div><button className="add-quest-button" onClick={onCreate}><Plus size={16} /> NEW QUEST</button></div><div className="quest-list">{active.length ? active.slice(0, 4).map(q => <QuestCard key={q.id} quest={q} onComplete={onComplete} onDelete={onDelete} />) : <div className="empty-quests"><Sparkles size={22} /><strong>All missions cleared.</strong><span>Claim a new quest to keep your streak alive.</span><button onClick={onCreate}>CLAIM QUEST <ArrowRight size={14} /></button></div>}</div><button className="view-all" onClick={() => onNavigate("/quests")}>VIEW ALL QUESTS <span>{state.quests.length}</span><ArrowRight size={14} /></button></section></div><div className="dashboard-lower"><div className="streak-panel panel"><div className="mini-heading"><span className="section-kicker">RITUAL / 07</span><h3>Momentum streak</h3><span className="streak-big"><Flame size={17} /> {state.streak}</span></div><div className="week-grid">{["M","T","W","T","F","S","S"].map((day, i) => <div key={`${day}-${i}`} className="day-cell"><span>{day}</span><div className={i < 6 ? "day-done" : "day-today"}>{i < 6 ? <Check size={13} /> : <Circle size={10} />}</div></div>)}</div><p className="streak-message"><span>✦</span> Four more days to unlock <strong>Iron Will</strong></p></div><div className="analytics-panel panel"><div className="mini-heading"><span className="section-kicker">ACTIVITY / 7 DAYS</span><h3>XP earned</h3><button className="text-button" onClick={() => onNavigate("/history")}>FULL HISTORY <ArrowRight size={14} /></button></div><div className="bar-chart">{[42, 66, 48, 82, 58, 74, 91].map((height, i) => <div key={i} className="chart-column"><div className="chart-bar" style={{ height: `${height}%` }}><span>+{[120, 240, 180, 350, 210, 280, 420][i]}</span></div><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div></div></div></div>;
}

function QuestLog({ state, onCreate, onComplete, onDelete }: { state: GameState; onCreate: () => void; onComplete: (q: Quest) => void; onDelete: (id: number) => void }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = state.quests.filter(q => filter === "ALL" || filter === "COMPLETED" && q.completed || filter === "ACTIVE" && !q.completed);
  return <PageShell kicker="MISSION CONTROL" title="Quest log" description="Convert intention into action. Your next level is one clear mission away." action={<button className="primary-button compact" onClick={onCreate}><Plus size={16} /> CREATE QUEST</button>}><div className="quest-log-toolbar"><div className="filter-tabs">{["ALL", "ACTIVE", "COMPLETED"].map(tab => <button key={tab} className={filter === tab ? "selected" : ""} onClick={() => setFilter(tab)}>{tab}<span>{tab === "ALL" ? state.quests.length : tab === "ACTIVE" ? state.quests.filter(q => !q.completed).length : state.quests.filter(q => q.completed).length}</span></button>)}</div><div className="sort-note"><Target size={14} /> SERVER-VERIFIED REWARDS</div></div><div className="quest-log-list">{filtered.map(q => <QuestCard key={q.id} quest={q} onComplete={onComplete} onDelete={onDelete} />)}</div></PageShell>;
}

function CharacterPage({ state }: { state: GameState }) {
  return <PageShell kicker="IDENTITY / ASCENDANT" title="Character sheet" description="A living record of the person your daily choices are building."><div className="character-sheet-grid"><div className="sheet-hero panel"><div className="sheet-hero-top"><span className="rarity-tag"><Sparkles size={12} /> RARE PROFILE</span><span className="sheet-id">LQ-0004</span></div><CharacterOrb state={state} /><div className="sheet-title"><span>CLASS</span><strong>THE WAYFINDER</strong><small>Balanced path / curiosity-driven</small></div></div><div className="attributes-panel panel"><div className="panel-heading"><div><span className="section-kicker">CORE ATTRIBUTES</span><h3>Built, not assigned</h3></div><span className="attribute-total">338 <small>TOTAL</small></span></div><div className="attribute-rows">{(Object.entries(state.attributes) as [Category, number][]).map(([key, value]) => { const meta = categoryMeta[key]; const Icon = meta.icon; return <div className="attribute-row" key={key}><div className={`row-icon ${meta.color}`}><Icon size={16} /></div><div className="row-name"><span>{meta.label}</span><small>+{Math.round(value / 4)} this season</small></div><div className="row-bar"><div style={{ width: `${value}%` }} /></div><strong>{value}<em>/100</em></strong></div>; })}</div><div className="next-milestone"><span className="milestone-icon"><Lock size={15} /></span><div><span>NEXT MILESTONE</span><strong>Master of Momentum</strong><small>Complete 30 discipline quests</small></div><span className="milestone-count">18 / 30</span></div></div></div><div className="achievements-section"><div className="panel-heading"><div><span className="section-kicker">ACHIEVEMENTS / {state.unlocked.length}</span><h3>Proof of progress</h3></div></div><div className="achievement-grid">{[["First Quest", "The journey begins", Target, "earned"], ["7 Day Streak", "You showed up", Flame, "earned"], ["Knowledge Seeker", "Feed the mind", Brain, "earned"], ["Iron Will", "30 discipline quests", ShieldCheck, "locked"]].map(([name, description, Icon, status]) => <div className={`achievement-card ${status}`} key={name as string}><div className="achievement-icon"><Icon size={20} /></div><div><strong>{name as string}</strong><span>{description as string}</span></div>{status === "earned" ? <Check size={15} /> : <Lock size={15} />}</div>)}</div></div></PageShell>;
}

function ShopPage({ state, onBuy }: { state: GameState; onBuy: (name: string, cost: number) => void }) {
  const items = [["Cosmic Frame", "Profile Frame", 200, "✦", "violet"], ["Night Scholar", "Title", 350, "◈", "blue"], ["Inferno Theme", "World Theme", 500, "◆", "red"], ["Golden Focus", "Aura", 750, "✧", "gold"]] as const;
  return <PageShell kicker="THE VAULT / EXCHANGE" title="Item shop" description="Spend your hard-earned gold on the details that make your journey yours." action={<div className="gold-wallet"><Coins size={17} /> <strong>{state.gold.toLocaleString()}</strong><span>GOLD</span></div>}><div className="shop-banner"><div><span className="section-kicker">LIMITED DROP / SEASON 01</span><h3>Make your mark.</h3><p>Rare items rotate in. Your inventory is persistent across every quest.</p></div><div className="shop-banner-rune">✦</div></div><div className="shop-grid">{items.map(([name, type, cost, rune, tone]) => <div className={`shop-card ${tone}`} key={name}><div className="shop-art"><span>{rune}</span><div /></div><span className="shop-type">{type}</span><h3>{name}</h3><div className="shop-buy"><span><Coins size={14} /> {cost}</span><button onClick={() => onBuy(name, cost)} disabled={state.gold < cost}>{state.gold < cost ? "LOCKED" : "ACQUIRE"} <ArrowRight size={13} /></button></div></div>)}</div></PageShell>;
}

function HistoryPage({ state }: { state: GameState }) { const completed = state.quests.filter(q => q.completed); return <PageShell kicker="MEMORY / LEDGER" title="Quest history" description="Every completed mission is evidence that you can do hard things."><div className="history-layout"><div className="timeline panel"><div className="panel-heading"><div><span className="section-kicker">RECENTLY COMPLETED</span><h3>The ledger</h3></div><span className="ledger-total">{completed.length} TOTAL</span></div>{completed.length ? completed.map(q => { const meta = categoryMeta[q.category]; const Icon = meta.icon; return <div className="timeline-row" key={q.id}><div className={`timeline-icon ${meta.color}`}><Icon size={15} /></div><div><strong>{q.title}</strong><span>{q.createdAt} · {rewards[q.difficulty].label}</span></div><div className="timeline-reward"><span>+{q.xp} XP</span><small>+{q.gold} GOLD</small></div></div>; }) : <div className="empty-history"><History size={22} /> Your legend is waiting to be written.</div>}</div><div className="weekly-summary panel"><span className="section-kicker">SEASON SCORE</span><h3>Weekly output</h3><div className="summary-score">1,800 <span>XP</span></div><div className="summary-delta"><span>↗ 24%</span> from last week</div><div className="summary-bars">{[42, 67, 38, 84, 51, 78, 62].map((n, i) => <div key={i} style={{ height: `${n}%` }}><span>{["M","T","W","T","F","S","S"][i]}</span></div>)}</div></div></div></PageShell>; }

function ProfilePage({ state, onLogout }: { state: GameState; onLogout: () => void }) { return <PageShell kicker="ACCOUNT / OPERATIVE" title="Profile & settings" description="Tune your world. Keep the important things close."><div className="profile-grid"><div className="profile-card panel"><div className="profile-avatar">A<div className="profile-level">LVL {state.level}</div></div><span className="section-kicker">THE WAYFINDER</span><h3>Alex Morgan</h3><p>Balanced path · joined this season</p><div className="profile-stats"><div><strong>{state.quests.filter(q => q.completed).length}</strong><span>QUESTS DONE</span></div><div><strong>{state.xp.toLocaleString()}</strong><span>TOTAL XP</span></div><div><strong>{state.streak}</strong><span>DAY STREAK</span></div></div></div><div className="settings-card panel"><div className="panel-heading"><div><span className="section-kicker">PREFERENCES</span><h3>World settings</h3></div><Settings size={18} /></div>{[["Sound effects", "Subtle feedback on completion", true], ["Reduced motion", "Respect system preference", false], ["Public profile", "Let other adventurers find you", false]].map(([title, subtitle, checked]) => <div className="setting-row" key={title as string}><div><strong>{title as string}</strong><span>{subtitle as string}</span></div><div className={`toggle ${checked ? "on" : ""}`}><span /></div></div>)}<button className="logout-button" onClick={onLogout}>EXIT WORLD <ArrowRight size={15} /></button></div></div></PageShell>; }

function PageShell({ kicker, title, description, action, children }: { kicker: string; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) { return <div className="page-shell"><div className="page-heading"><div><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-heading-action">{action}</div>}</div>{children}</div>; }

function CreateQuestModal({ onClose, onCreate }: { onClose: () => void; onCreate: (quest: Omit<Quest, "id" | "completed" | "createdAt">) => void }) { const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [category, setCategory] = useState<Category>("intellect"); const [difficulty, setDifficulty] = useState<Difficulty>("medium"); const reward = rewards[difficulty]; return <div className="modal-backdrop" onMouseDown={onClose}><div className="quest-modal" onMouseDown={e => e.stopPropagation()}><div className="modal-heading"><div><span className="section-kicker">NEW MISSION / INPUT</span><h2>Claim a quest</h2></div><button onClick={onClose} aria-label="Close"><X size={18} /></button></div><label>QUEST NAME<input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ship the landing page" /></label><label>DESCRIPTION <span>OPTIONAL</span><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does done look like?" rows={3} /></label><label>ATTRIBUTE FOCUS<div className="category-picker">{(Object.keys(categoryMeta) as Category[]).map(key => { const meta = categoryMeta[key]; const Icon = meta.icon; return <button type="button" key={key} className={category === key ? "picked" : ""} onClick={() => setCategory(key)}><Icon size={16} /><span>{meta.label}</span></button>; })}</div></label><label>DIFFICULTY<div className="difficulty-picker">{(Object.keys(rewards) as Difficulty[]).map(key => <button type="button" key={key} className={`${difficulty === key ? "picked" : ""} ${rewards[key].tone}`} onClick={() => setDifficulty(key)}><span>{rewards[key].label}</span><strong>+{rewards[key].xp} XP</strong></button>)}</div></label><div className="modal-footer"><div className="reward-preview"><Zap size={15} /><strong>+{reward.xp} XP</strong><Coins size={15} /><strong>+{reward.gold}</strong></div><button className="primary-button compact" disabled={title.trim().length < 2} onClick={() => { onCreate({ title: title.trim(), description: description.trim(), category, difficulty, xp: reward.xp, gold: reward.gold }); onClose(); }}>CREATE QUEST <ArrowRight size={15} /></button></div></div></div>; }

function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) { return <div className="modal-backdrop celebration"><div className="level-modal"><div className="celebration-rune"><Sparkles size={28} /></div><span className="section-kicker">MILESTONE REACHED</span><h2>LEVEL UP</h2><div className="new-level">{String(level).padStart(2, "0")}</div><p>Your consistency is becoming identity.</p><div className="reward-unlock"><Trophy size={16} /><span>NEW REWARD UNLOCKED</span><strong>+1 SKILL POINT</strong></div><button className="primary-button" onClick={onClose}>CONTINUE <ArrowRight size={16} /></button></div></div>; }

function MobileNav({ path, onNavigate }: { path: string; onNavigate: (path: string) => void }) { return <nav className="mobile-nav">{[["/dashboard", Home, "HOME"], ["/quests", ScrollText, "QUESTS"], ["/character", User, "CHARACTER"], ["/shop", ShoppingBag, "SHOP"], ["/profile", Settings, "PROFILE"]].map(([to, Icon, label]) => <button className={path === to ? "active" : ""} key={to as string} onClick={() => onNavigate(to as string)}><Icon size={18} /><span>{label as string}</span></button>)}</nav>; }

function App() {
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">(() => (window.localStorage.getItem("lifequest-theme") as "dark" | "light") || "dark");
  const [state, setState] = useState<GameState>(starterState);
  const [showCreate, setShowCreate] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [burst, setBurst] = useState<{ xp: number; gold: number } | null>(null);
  const [toast, setToast] = useState("");
  const snapshotQuery = trpc.lifeQuest.snapshot.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const createQuestMutation = trpc.lifeQuest.createQuest.useMutation();
  const completeQuestMutation = trpc.lifeQuest.completeQuest.useMutation();
  const deleteQuestMutation = trpc.lifeQuest.deleteQuest.useMutation();
  const purchaseMutation = trpc.lifeQuest.purchaseItem.useMutation();
  const updatePathMutation = trpc.lifeQuest.updatePath.useMutation();
  const appPath = location === "/" ? "/" : location;
  useEffect(() => { window.localStorage.setItem("lifequest-theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const snap = snapshotQuery.data;
    if (!snap?.user) return;
    const apiQuests: Quest[] = snap.quests.map((q: any) => ({ id: q.id, title: q.title, description: q.description || "", category: q.category as Category, difficulty: q.difficulty as Difficulty, xp: q.xpReward, gold: q.goldReward, completed: q.status === "completed", createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Today" }));
    const apiAttrs = snap.attributes || { intellect: 35, strength: 35, vitality: 35, creativity: 35, discipline: 35, social: 35 };
    setState(prev => ({ ...prev, xp: snap.user.xp, level: snap.user.level, gold: snap.user.gold, streak: snap.user.streak, quests: apiQuests, attributes: { intellect: apiAttrs.intellect, strength: apiAttrs.strength, vitality: apiAttrs.vitality, creativity: apiAttrs.creativity, discipline: apiAttrs.discipline, social: apiAttrs.social } }));
  }, [snapshotQuery.data]);
  const navigate = (path: string) => setLocation(path);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const completeQuest = async (quest: Quest) => {
    if (completeQuestMutation.isPending) return;
    try {
      const result = await completeQuestMutation.mutateAsync({ id: quest.id });
      setState(prev => ({ ...prev, xp: result.newXp, level: result.newLevel, gold: prev.gold + result.goldEarned, streak: prev.streak + 1, quests: prev.quests.map(q => q.id === quest.id ? { ...q, completed: true } : q), attributes: { ...prev.attributes, [quest.category]: Math.min(100, prev.attributes[quest.category] + (quest.difficulty === "epic" ? 3 : 2)) } }));
      setBurst({ xp: quest.xp, gold: quest.gold }); window.setTimeout(() => setBurst(null), 1200);
      if (result.leveledUp) setLevelUp(result.newLevel); else notify(`Quest complete · +${quest.xp} XP`);
    } catch (error: any) { notify(error?.message || "Quest could not be completed"); }
  };
  const createQuest = async (quest: Omit<Quest, "id" | "completed" | "createdAt">) => {
    try { const result = await createQuestMutation.mutateAsync({ title: quest.title, description: quest.description, category: quest.category, difficulty: quest.difficulty }); setState(prev => ({ ...prev, quests: [{ ...quest, id: Number(result.id), completed: false, createdAt: "Today" }, ...prev.quests] })); notify("Quest claimed · the path is clear"); } catch (error: any) { notify(error?.message || "Quest could not be created"); }
  };
  const deleteQuest = async (id: number) => { try { await deleteQuestMutation.mutateAsync({ id }); setState(prev => ({ ...prev, quests: prev.quests.filter(q => q.id !== id) })); notify("Quest abandoned"); } catch (error: any) { notify(error?.message || "Quest could not be deleted"); } };
  const buy = async (name: string, cost: number) => { try { await purchaseMutation.mutateAsync({ itemName: name }); setState(prev => ({ ...prev, gold: prev.gold - cost, unlocked: [...prev.unlocked, name] })); notify(`${name} added to inventory`); } catch (error: any) { notify(error?.message || "Purchase unavailable"); } };
  useEffect(() => { if (!authLoading && !isAuthenticated && ["/dashboard", "/quests", "/character", "/shop", "/history", "/profile"].includes(appPath)) setLocation("/login");
    if (!authLoading && isAuthenticated && ["/login", "/signup"].includes(appPath)) setLocation("/dashboard");
  }, [authLoading, isAuthenticated, appPath]);
  if (authLoading) return <div className="loading-screen"><Logo /><div className="loading-rune"><Sparkles size={22} /></div><span>ALIGNING YOUR WORLD...</span></div>;
  if (appPath === "/") return <Landing onEnter={() => navigate("/login")} onSignUp={() => navigate("/signup")} />;
  if (!isAuthenticated || appPath === "/login" || appPath === "/signup") return <AuthScreen mode={appPath === "/signup" ? "signup" : "login"} onSwitch={() => navigate(appPath === "/signup" ? "/login" : "/signup")} />;
  if (appPath === "/onboarding") return <OnboardingScreen onComplete={async (path) => { await updatePathMutation.mutateAsync({ path }); navigate("/dashboard"); }} />;
  let main: React.ReactNode;
  if (appPath === "/dashboard") main = <Dashboard state={state} onCreate={() => setShowCreate(true)} onComplete={completeQuest} onDelete={deleteQuest} onNavigate={navigate} />;
  else if (appPath === "/quests") main = <QuestLog state={state} onCreate={() => setShowCreate(true)} onComplete={completeQuest} onDelete={deleteQuest} />;
  else if (appPath === "/character") main = <CharacterPage state={state} />;
  else if (appPath === "/shop") main = <ShopPage state={state} onBuy={buy} />;
  else if (appPath === "/history") main = <HistoryPage state={state} />;
  else main = <ProfilePage state={state} onLogout={() => logout()} />;
  return <div className={`app-shell theme-${theme}`}><Sidebar path={appPath} onNavigate={navigate} onLogout={() => logout()} /><main className="app-main"><Topbar state={state} username={user?.name} onCreate={() => setShowCreate(true)} /><button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle light and dark theme">{theme === "dark" ? "☼ LIGHT" : "☾ DARK"}</button>{main}</main><MobileNav path={appPath} onNavigate={navigate} />{showCreate && <CreateQuestModal onClose={() => setShowCreate(false)} onCreate={createQuest} />}{levelUp && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}{burst && <div className="xp-burst"><span>+{burst.xp} XP</span><small>+{burst.gold} GOLD</small><i>✦</i><i>✧</i><i>•</i></div>}{toast && <div className="toast"><Check size={15} /> {toast}</div>}</div>;
}
export default App;
