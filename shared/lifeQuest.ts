export const DIFFICULTY_REWARDS = {
  easy: { xp: 35, gold: 15, label: "EASY", tone: "easy" },
  medium: { xp: 75, gold: 30, label: "MEDIUM", tone: "medium" },
  hard: { xp: 150, gold: 60, label: "HARD", tone: "hard" },
  epic: { xp: 350, gold: 140, label: "EPIC", tone: "epic" },
  legendary: { xp: 750, gold: 300, label: "LEGENDARY", tone: "legendary" },
} as const;

export type Difficulty = keyof typeof DIFFICULTY_REWARDS;

export function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

export function getLevelProgress(xp: number, level = getLevelFromXp(xp)) {
  const floor = Math.max(0, (level - 1) ** 2 * 100);
  const ceiling = level ** 2 * 100;
  const total = Math.max(1, ceiling - floor);
  const current = Math.max(0, xp - floor);
  return { current, total, percent: Math.min(100, Math.max(0, (current / total) * 100)) };
}
