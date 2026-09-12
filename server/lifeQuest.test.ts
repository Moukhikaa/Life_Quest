import { describe, expect, it } from "vitest";
import { DIFFICULTY_REWARDS, getLevelFromXp, getLevelProgress } from "../shared/lifeQuest";

describe("LIFE//QUEST progression", () => {
  it("keeps reward values ordered by difficulty", () => {
    expect(DIFFICULTY_REWARDS.easy).toMatchObject({ xp: 35, gold: 15 });
    expect(DIFFICULTY_REWARDS.epic).toMatchObject({ xp: 350, gold: 140 });
    expect(DIFFICULTY_REWARDS.legendary.xp).toBeGreaterThan(DIFFICULTY_REWARDS.hard.xp);
  });

  it("uses non-linear level thresholds", () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(99)).toBe(1);
    expect(getLevelFromXp(100)).toBe(2);
    expect(getLevelFromXp(399)).toBe(2);
    expect(getLevelFromXp(400)).toBe(3);
  });

  it("calculates progress inside the current level band", () => {
    expect(getLevelProgress(250, 2)).toEqual({ current: 150, total: 300, percent: 50 });
    expect(getLevelProgress(0, 1).percent).toBe(0);
  });
});
