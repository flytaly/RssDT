/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { InferModel, relations } from 'drizzle-orm';
import { defaultLocale, defaultTimeZone } from '../constants';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  role: text('role', { enum: ['USER', 'ADMIN'] })
    .default('USER')
    .notNull(),
  locale: varchar('locale', { length: 200 }).default(defaultLocale),
  timeZone: varchar('timeZone', { length: 100 }).default(defaultTimeZone),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  // ====
  password: varchar('password', { length: 256 }),
  deleted: boolean('deleted'),
});

export const optionsRelations = relations(user, ({ one }) => ({
  options: one(options, {
    fields: [user.id],
    references: [options.userId],
  }),
}));

export const themeEnum = pgEnum('theme', ['default', 'text']);

export const options = pgTable('options', {
  userId: integer('userId')
    .references(() => user.id, { onDelete: 'cascade' })
    .primaryKey(),
  dailyDigestHour: integer('dailyDigestHour').default(18).notNull(),
  withContentTableDefault: boolean('withContentTableDefault').default(false),
  itemBodyDefault: boolean('itemBodyDefault').default(true),
  attachmentsDefault: boolean('attachmentsDefault').default(true),
  themeDefault: themeEnum('themeDefault').default('default').notNull(),
  customSubject: varchar('customSubject', { length: 150 }),
  shareEnable: boolean('shareEnable').default(true).notNull(),
  shareList: varchar('shareList', { length: 25 }).array(),
});

export type User = InferModel<typeof user>;
export type NewUser = InferModel<typeof user, 'insert'>;

export const feed = pgTable('feed', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 2048 }).unique().notNull(),
  link: varchar('link', { length: 2048 }),
  title: varchar('title', { length: 2000 }).default(''),
  description: text('description').default(''),
  language: varchar('language', { length: 50 }),
  /** A link to the favicon from feed (provided by Atom feeds) */
  favicon: varchar('favicon', { length: 2048 }),
  /** A link to the favicon of the website */
  siteFavicon: varchar('siteFavicon', { length: 2048 }),
  /** A link to the website icon (should be >= 100x100px) */
  siteIcon: varchar('siteIcon', { length: 2048 }),
  imageUrl: varchar('imageUrl', { length: 2048 }),
  imageTitle: varchar('imageTitle', { length: 1000 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  lastSuccessfulUpd: timestamp('lastSuccessfulUpd').default(new Date(0)).notNull(),
  lastPubdate: timestamp('lastPubdate').default(new Date(0)),

  // ===
  /** Activated means that it was added by user with confirmed email */
  activated: boolean('activated').default(false),
  lastUpdAttempt: timestamp('lastUpdAttempt').default(new Date(0)).notNull(),
  throttled: integer('throttled').default(0).notNull(),
  /* @OneToMany('Item', 'feed', { nullable: true }) */
  /* items?: IItem[]; */
});

export const feedRelations = relations(feed, ({ many }) => ({
  items: many(item),
}));

export const item = pgTable('item', {
  id: serial('id').primaryKey(),
  feedId: integer('feedId').references(() => feed.id, { onDelete: 'cascade' }),
  guid: varchar('guid', { length: 2048 }),
  pubdate: timestamp('pubdate'),
  link: varchar('link', { length: 2048 }),
  title: varchar('title', { length: 2048 }),
  description: text('description'),
  summary: text('summary').default(''),
  imageUrl: varchar('imageUrl', { length: 2048 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const itemsRelations = relations(item, ({ one, many }) => ({
  feed: one(feed, {
    fields: [item.feedId],
    references: [feed.id],
  }),
  enclosures: many(enclosure),
}));

export const enclosure = pgTable('enclosure', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 2048 }),
  length: varchar('length', { length: 100 }),
  type: varchar('type', { length: 20 }),
  itemId: integer('itemId').references(() => item.id, { onDelete: 'cascade' }),
});

export const enclosureRelations = relations(enclosure, ({ one }) => ({
  item: one(item, {
    fields: [enclosure.id],
    references: [item.id],
  }),
}));
