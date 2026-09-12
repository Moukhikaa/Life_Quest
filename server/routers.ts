import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb, getUserQuests, getUserSnapshot } from "./db";
import { attributes, inventory, items, quests, transactions, users } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";

const difficultyRewards = {
  easy: { xp: 35, gold: 15 },
  medium: { xp: 75, gold: 30 },
  hard: { xp: 150, gold: 60 },
  epic: { xp: 350, gold: 140 },
  legendary: { xp: 750, gold: 300 },
} as const;

const categorySchema = z.enum(["intellect", "strength", "vitality", "creativity", "discipline", "social"]);
const difficultySchema = z.enum(["easy", "medium", "hard", "epic", "legendary"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  lifeQuest: router({
    snapshot: protectedProcedure.query(async ({ ctx }) => {
      const snapshot = await getUserSnapshot(ctx.user.id);
      if (!snapshot) return null;
      return snapshot;
    }),
    quests: protectedProcedure.query(({ ctx }) => getUserQuests(ctx.user.id)),
    createQuest: protectedProcedure.input(z.object({ title: z.string().min(2).max(255), description: z.string().max(1000).optional(), category: categorySchema, difficulty: difficultySchema })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const reward = difficultyRewards[input.difficulty];
      const activeDuplicate = await db.select({ id: quests.id }).from(quests).where(and(eq(quests.userId, ctx.user.id), eq(quests.title, input.title), eq(quests.status, "active"))).limit(1);
      if (activeDuplicate.length) throw new Error("You already have an active quest with this title");
      const result = await db.insert(quests).values({ userId: ctx.user.id, title: input.title, description: input.description ?? null, category: input.category, difficulty: input.difficulty, xpReward: reward.xp, goldReward: reward.gold, status: "active" });
      return { id: result[0].insertId, ...input, ...reward, status: "active" };
    }),
    completeQuest: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const found = await db.select().from(quests).where(and(eq(quests.id, input.id), eq(quests.userId, ctx.user.id))).limit(1);
      const quest = found[0];
      if (!quest || quest.status === "completed") throw new Error("Quest is not available");
      const currentRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const user = currentRows[0];
      if (!user) throw new Error("User not found");
      const newXp = user.xp + quest.xpReward;
      const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
      const leveledUp = newLevel > user.level;
      await db.update(quests).set({ status: "completed", completedAt: new Date() }).where(and(eq(quests.id, input.id), eq(quests.userId, ctx.user.id)));
      await db.update(users).set({ xp: newXp, level: newLevel, gold: user.gold + quest.goldReward, streak: user.streak + 1, lastActive: new Date() }).where(eq(users.id, ctx.user.id));
      await db.insert(transactions).values({ userId: ctx.user.id, type: "quest_reward", amount: quest.xpReward, reason: `Completed: ${quest.title}` });
      return { quest, newXp, newLevel, leveledUp, goldEarned: quest.goldReward };
    }),
    deleteQuest: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(quests).where(and(eq(quests.id, input.id), eq(quests.userId, ctx.user.id)));
      return { success: true } as const;
    }),
    updatePath: protectedProcedure.input(z.object({ path: z.enum(["scholar", "warrior", "builder", "creator", "balanced"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(users).set({ path: input.path }).where(eq(users.id, ctx.user.id));
      await db.insert(attributes).values({ userId: ctx.user.id }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
      return { success: true } as const;
    }),
    shopCatalog: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(items);
    }),
    purchaseItem: protectedProcedure.input(z.object({ itemName: z.string().min(1).max(100) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const found = await db.select().from(items).where(eq(items.name, input.itemName)).limit(1);
      const item = found[0];
      if (!item) throw new Error("Item not found");
      const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const user = userRows[0];
      if (!user || user.gold < item.price) throw new Error("Not enough gold");
      await db.update(users).set({ gold: user.gold - item.price }).where(eq(users.id, ctx.user.id));
      await db.insert(inventory).values({ userId: ctx.user.id, itemId: item.id, quantity: 1 });
      return { success: true, item, remainingGold: user.gold - item.price } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
