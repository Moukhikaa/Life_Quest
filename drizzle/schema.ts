import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  level: int("level").default(1).notNull(),
  xp: int("xp").default(0).notNull(),
  gold: int("gold").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  path: varchar("path", { length: 32 }).default("balanced").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const attributes = mysqlTable("attributes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  intellect: int("intellect").default(35).notNull(),
  strength: int("strength").default(35).notNull(),
  vitality: int("vitality").default(35).notNull(),
  creativity: int("creativity").default(35).notNull(),
  discipline: int("discipline").default(35).notNull(),
  social: int("social").default(35).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quests = mysqlTable("quests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 32 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "epic", "legendary"]).notNull(),
  xpReward: int("xpReward").notNull(),
  goldReward: int("goldReward").notNull(),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  price: int("price").notNull(),
  rarity: varchar("rarity", { length: 32 }).default("common").notNull(),
});

export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: int("itemId").notNull().references(() => items.id, { onDelete: "cascade" }),
  quantity: int("quantity").default(1).notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementName: varchar("achievementName", { length: 100 }).notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type Attribute = typeof attributes.$inferSelect;
