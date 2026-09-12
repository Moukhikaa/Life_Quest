import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { attributes, InsertUser, quests, Quest, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  if (user.name !== undefined) updateSet.name = user.name;
  if (user.email !== undefined) updateSet.email = user.email;
  if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
  if (user.role !== undefined) updateSet.role = user.role;
  else if (user.openId === ENV.ownerOpenId) updateSet.role = "admin";
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  const current = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
  if (current[0]) {
    await db.insert(attributes).values({ userId: current[0].id }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [userRows, attributeRows, questRows] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(attributes).where(eq(attributes.userId, userId)).limit(1),
    db.select().from(quests).where(eq(quests.userId, userId)).orderBy(desc(quests.createdAt)),
  ]);
  return { user: userRows[0], attributes: attributeRows[0], quests: questRows };
}

export async function getUserQuests(userId: number): Promise<Quest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quests).where(eq(quests.userId, userId)).orderBy(desc(quests.createdAt));
}

export { and, eq };
