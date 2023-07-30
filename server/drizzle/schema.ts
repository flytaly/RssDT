import { pgTable, pgEnum, pgSchema, AnyPgColumn, foreignKey, serial, integer, varchar, timestamp, text, unique, boolean } from "drizzle-orm/pg-core"

export const digestSchedule = pgEnum("digestSchedule", ['disable', 'daily', 'every12hours', 'every6hours', 'every3hours', 'every2hours', 'everyhour', 'realtime'])
export const ternaryState = pgEnum("ternaryState", ['default', 'disable', 'enable'])
export const theme = pgEnum("theme", ['text', 'default'])

import { sql } from "drizzle-orm"

export const item = pgTable("item", {
	id: serial("id").primaryKey().notNull(),
	feedId: integer("feedId").references(() => feed.id, { onDelete: "cascade" } ),
	guid: varchar("guid", { length: 2048 }),
	pubdate: timestamp("pubdate", { withTimezone: true, mode: 'string' }),
	link: varchar("link", { length: 2048 }),
	title: varchar("title", { length: 2048 }),
	description: text("description"),
	summary: text("summary").default(''),
	imageUrl: varchar("imageUrl", { length: 2048 }),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const enclosure = pgTable("enclosure", {
	id: serial("id").primaryKey().notNull(),
	url: varchar("url", { length: 2048 }),
	length: varchar("length", { length: 100 }),
	type: varchar("type", { length: 20 }),
	itemId: integer("itemId").references(() => item.id, { onDelete: "cascade" } ),
});

export const feed = pgTable("feed", {
	id: serial("id").primaryKey().notNull(),
	url: varchar("url", { length: 2048 }).notNull(),
	link: varchar("link", { length: 2048 }),
	title: varchar("title", { length: 2000 }).default(''::character varying),
	description: text("description").default(''),
	language: varchar("language", { length: 50 }),
	favicon: varchar("favicon", { length: 2048 }),
	siteFavicon: varchar("siteFavicon", { length: 2048 }),
	siteIcon: varchar("siteIcon", { length: 2048 }),
	imageUrl: varchar("imageUrl", { length: 2048 }),
	imageTitle: varchar("imageTitle", { length: 1000 }),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastSuccessfulUpd: timestamp("lastSuccessfulUpd", { withTimezone: true, mode: 'string' }).default('1970-01-01 03:00:00+03').notNull(),
	lastPubdate: timestamp("lastPubdate", { withTimezone: true, mode: 'string' }).default('1970-01-01 03:00:00+03'),
	activated: boolean("activated").default(false),
	lastUpdAttempt: timestamp("lastUpdAttempt", { withTimezone: true, mode: 'string' }).default('1970-01-01 03:00:00+03').notNull(),
	throttled: integer("throttled").default(0).notNull(),
},
(table) => {
	return {
		feedUrlUnique: unique("feed_url_unique").on(table.url),
	}
});

export const user = pgTable("user", {
	id: serial("id").primaryKey().notNull(),
	email: varchar("email", { length: 256 }).notNull(),
	emailVerified: boolean("emailVerified").default(false).notNull(),
	role: text("role").default('USER').notNull(),
	locale: varchar("locale", { length: 200 }).default('en-US'::character varying).notNull(),
	timeZone: varchar("timeZone", { length: 100 }).default('UTC'::character varying).notNull(),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	password: varchar("password", { length: 256 }),
	deleted: boolean("deleted"),
},
(table) => {
	return {
		userEmailUnique: unique("user_email_unique").on(table.email),
	}
});

export const options = pgTable("options", {
	userId: integer("userId").primaryKey().notNull().references(() => user.id, { onDelete: "cascade" } ),
	dailyDigestHour: integer("dailyDigestHour").default(18).notNull(),
	withContentTableDefault: boolean("withContentTableDefault").default(false).notNull(),
	itemBodyDefault: boolean("itemBodyDefault").default(true).notNull(),
	attachmentsDefault: boolean("attachmentsDefault").default(true).notNull(),
	themeDefault: theme("themeDefault").default('default').notNull(),
	customSubject: varchar("customSubject", { length: 150 }),
	shareEnable: boolean("shareEnable").default(true).notNull(),
	shareList: varchar("shareList", { length: 25)[ }).array(),
});

export const userFeed = pgTable("user_feed", {
	id: serial("id").primaryKey().notNull(),
	activated: boolean("activated").default(false).notNull(),
	title: varchar("title", { length: 50 }),
	schedule: digestSchedule("schedule").default('disable').notNull(),
	withContentTable: ternaryState("withContentTable").default('default').notNull(),
	itemBody: ternaryState("itemBody").default('default').notNull(),
	attachments: ternaryState("attachments").default('default').notNull(),
	theme: theme("theme").default('default').notNull(),
	filter: varchar("filter", { length: 250 }),
	lastDigestSentAt: timestamp("lastDigestSentAt", { withTimezone: true, mode: 'string' }),
	lastViewedItemDate: timestamp("lastViewedItemDate", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updatedAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: integer("userId").notNull().references(() => user.id, { onDelete: "cascade" } ),
	feedId: integer("feedId").notNull().references(() => feed.id, { onDelete: "cascade" } ),
	wasFilteredAt: timestamp("wasFilteredAt", { withTimezone: true, mode: 'string' }),
	unsubscribeToken: varchar("unsubscribeToken", { length: 100 }).notNull(),
});

export const usersToBeDeleted = pgTable("users_to_be_deleted", {
	userId: integer("userId").references(() => user.id, { onDelete: "cascade" } ),
	createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});