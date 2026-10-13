import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), googleSub: text("google_sub").notNull(),
  nickname: text("nickname").notNull(), ranked: integer("ranked", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(), imported: integer("imported", { mode: "boolean" }).notNull().default(false),
}, t => [uniqueIndex("profiles_google_sub").on(t.googleSub)]);
export const sessions = sqliteTable("sessions", {
  hash: text("hash").primaryKey(), userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), expiresAt: integer("expires_at").notNull(),
}, t => [index("sessions_expiry").on(t.expiresAt)]);
export const authChallenges = sqliteTable("auth_challenges", {
  hash: text("hash").primaryKey(), expiresAt: integer("expires_at").notNull(),
});
export const dailyGames = sqliteTable("daily_games", {
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), date: text("date").notNull(), puzzleId: text("puzzle_id").notNull(),
  guesses: text("guesses").notNull().default("[]"), won: integer("won", { mode: "boolean" }).notNull().default(false), finished: integer("finished", { mode: "boolean" }).notNull().default(false),
  revision: integer("revision").notNull().default(0), updatedAt: integer("updated_at").notNull(),
  rankEligible: integer("rank_eligible", { mode: "boolean" }).notNull().default(true),
}, t => [primaryKey({ columns: [t.userId, t.date] }), index("daily_games_date").on(t.date)]);
export const favorites = sqliteTable("favorites", {
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), kind: text("kind").notNull(), itemId: text("item_id").notNull(), createdAt: integer("created_at").notNull(),
}, t => [primaryKey({ columns: [t.userId, t.kind, t.itemId] })]);
export const characterNotes = sqliteTable("character_notes", {
  userId: text("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }), characterId: text("character_id").notNull(), kioku: text("kioku").notNull().default(""), portrait: text("portrait").notNull().default(""), notes: text("notes").notNull().default(""), updatedAt: integer("updated_at").notNull(),
}, t => [primaryKey({ columns: [t.userId, t.characterId] })]);

// Editorial content is separate from visitor accounts and game records.
export const editorialNews = sqliteTable("editorial_news", {
  id: text("id").primaryKey(), source: text("source").notNull(),
  articleJson: text("article_json").notNull(), checkedAt: text("checked_at").notNull(),
}, t => [uniqueIndex("editorial_news_source").on(t.source)]);
export const publicUpdates = sqliteTable("public_updates", {
  key: text("key").primaryKey(), valueJson: text("value_json").notNull(), updatedAt: text("updated_at").notNull(),
});

export const personalTierLists = sqliteTable('personal_tier_lists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), kind: text('kind').notNull(), entriesJson: text('entries_json').notNull(),
  revision: integer('revision').notNull().default(0),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, table => [index('personal_tier_lists_user_updated').on(table.userId, table.updatedAt)]);

export const growthPlans = sqliteTable('growth_plans', {
  userId: text('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  planJson: text('plan_json').notNull(), revision: integer('revision').notNull().default(0), updatedAt: integer('updated_at').notNull(),
});
export const achievementProgress = sqliteTable('achievement_progress', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull(), completedAt: integer('completed_at').notNull(),
}, t => [primaryKey({ columns: [t.userId, t.achievementId] })]);
export const showcaseBuilds = sqliteTable('showcase_builds', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  kiokuId: text('kioku_id').notNull(), buildJson: text('build_json').notNull(), revision: integer('revision').notNull().default(0),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, t => [uniqueIndex('showcase_user_kioku').on(t.userId, t.kiokuId), index('showcase_updated').on(t.updatedAt)]);
export const showcaseVotes = sqliteTable('showcase_votes', {
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  buildId: text('build_id').notNull().references(() => showcaseBuilds.id, { onDelete: 'cascade' }), createdAt: integer('created_at').notNull(),
}, t => [primaryKey({ columns: [t.userId, t.buildId] }), index('showcase_votes_build').on(t.buildId)]);
export const supportRequests = sqliteTable('support_requests', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), title: text('title').notNull(), body: text('body').notNull(), page: text('page').notNull().default(''),
  language: text('language').notNull(), public: integer('public', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('new'), reply: text('reply').notNull().default(''),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, t => [index('support_user_updated').on(t.userId, t.updatedAt), index('support_public_kind').on(t.public, t.kind)]);
