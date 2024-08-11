 
import 'reflect-metadata';
import { DigestSchedule, TernaryState, Theme } from '#root/types/enums.js';
import { Role } from '#root/types/index.js';
import { InferModel, relations, sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { defaultLocale, defaultTimeZone } from '../constants';

const timestampTZ = customType<{
  data: Date;
  driverData: string;
  config: { withTimezone: boolean; precision?: number };
}>({
  dataType(/* config */) {
    /* const precision = typeof config.precision !== 'undefined' ? ` (${config.precision})` : ''; */
    /* return `timestamp${precision}${config.withTimezone ? ' with time zone' : ''}`; */
    return `timestamp with time zone`;
  },
  fromDriver(value: string): Date {
    return new Date(value);
  },
});

const now = sql`now()`;

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  role: text('role', { enum: [Role.USER, Role.ADMIN] })
    .default(Role.USER)
    .notNull(),
  locale: varchar('locale', { length: 200 }).default(defaultLocale).notNull(),
  timeZone: varchar('timeZone', { length: 100 }).default(defaultTimeZone).notNull(),
  createdAt: timestampTZ('createdAt').default(now).notNull(),
  updatedAt: timestampTZ('updatedAt').default(now).notNull(),
  // ====
  password: varchar('password', { length: 256 }),
  deleted: boolean('deleted'),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  options: one(options, {
    fields: [users.id],
    references: [options.userId],
  }),
  userFeeds: many(userFeeds),
}));

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, 'insert'>;

export const themeEnum = pgEnum('theme', [Theme.default, Theme.text]);

export const options = pgTable('options', {
  userId: integer('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  dailyDigestHour: integer('dailyDigestHour').default(18).notNull(),
  withContentTableDefault: boolean('withContentTableDefault').default(false).notNull(),
  itemBodyDefault: boolean('itemBodyDefault').default(true).notNull(),
  attachmentsDefault: boolean('attachmentsDefault').default(true).notNull(),
  themeDefault: themeEnum('themeDefault').default(Theme.default).notNull(),
  customSubject: varchar('customSubject', { length: 150 }),
  shareEnable: boolean('shareEnable').default(true).notNull(),
  shareList: varchar('shareList', { length: 25 }).array(),
});

export type Options = InferModel<typeof options>;
export type NewOptions = InferModel<typeof options, 'insert'>;

export const feeds = pgTable('feed', {
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
  createdAt: timestampTZ('createdAt').default(now).notNull(),
  updatedAt: timestampTZ('updatedAt').default(now).notNull(),
  lastSuccessfulUpd: timestampTZ('lastSuccessfulUpd').default(new Date(0)).notNull(),
  lastPubdate: timestampTZ('lastPubdate').default(new Date(0)),

  // ===
  /** Activated means that it was added by user with confirmed email */
  activated: boolean('activated').default(false),
  lastUpdAttempt: timestampTZ('lastUpdAttempt').default(new Date(0)).notNull(),
  throttled: integer('throttled').default(0).notNull(),
  /* @OneToMany('Item', 'feed', { nullable: true }) */
  /* items?: IItem[]; */
});

export const feedsRelations = relations(feeds, ({ many }) => ({
  items: many(items),
  userFeeds: many(userFeeds),
}));

export type Feed = InferModel<typeof feeds>;
export type NewFeed = InferModel<typeof feeds, 'insert'>;

export function updateLastPubdateFromItems(
  feed: Feed | NewFeed,
  items: Array<{ pubdate?: Date | null }>,
) {
  const lastPubdate = items.reduce<Date | null>((prevDate, { pubdate }) => {
    if (!pubdate) return prevDate;
    return !prevDate || pubdate > prevDate ? pubdate : prevDate;
  }, null);
  if (lastPubdate) feed.lastPubdate = lastPubdate;
  return feed;
}

export const items = pgTable('item', {
  id: serial('id').primaryKey(),
  feedId: integer('feedId').references(() => feeds.id, { onDelete: 'cascade' }),
  guid: varchar('guid', { length: 2048 }),
  pubdate: timestampTZ('pubdate'),
  link: varchar('link', { length: 2048 }),
  title: varchar('title', { length: 2048 }),
  description: text('description'),
  summary: text('summary').default(''),
  imageUrl: varchar('imageUrl', { length: 2048 }),
  createdAt: timestampTZ('createdAt').default(now).notNull(),
});

export type Item = InferModel<typeof items>;
export type NewItem = InferModel<typeof items, 'insert'>;
export type ItemWithEnclosures = Item & { enclosures: Enclosure[] };
export type NewItemWithEnclosures = NewItem & { enclosures?: NewEnclosure[] };

export const itemsRelations = relations(items, ({ one, many }) => ({
  feed: one(feeds, {
    fields: [items.feedId],
    references: [feeds.id],
  }),
  enclosures: many(enclosures),
}));

export const enclosures = pgTable('enclosure', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 2048 }),
  length: varchar('length', { length: 100 }),
  type: varchar('type', { length: 20 }),
  itemId: integer('itemId').references(() => items.id, { onDelete: 'cascade' }),
});

export const enclosuresRelations = relations(enclosures, ({ one }) => ({
  item: one(items, {
    fields: [enclosures.itemId],
    references: [items.id],
  }),
}));

export type Enclosure = InferModel<typeof enclosures>;
export type NewEnclosure = InferModel<typeof enclosures, 'insert'>;

export const digestScheduleEnum = pgEnum('digestSchedule', [
  DigestSchedule.realtime,
  DigestSchedule.everyhour,
  DigestSchedule.every2hours,
  DigestSchedule.every3hours,
  DigestSchedule.every6hours,
  DigestSchedule.every12hours,
  DigestSchedule.daily,
  DigestSchedule.disable,
]);

export const ternaryState = pgEnum('ternaryState', [
  TernaryState.enable,
  TernaryState.disable,
  TernaryState.default,
]);

export const userFeeds = pgTable('user_feed', {
  id: serial('id').primaryKey(),
  activated: boolean('activated').default(false).notNull(),
  title: varchar('title', { length: 50 }),
  schedule: digestScheduleEnum('schedule').default(DigestSchedule.disable).notNull(),
  withContentTable: ternaryState('withContentTable').default(TernaryState.default).notNull(),
  itemBody: ternaryState('itemBody').default(TernaryState.default).notNull(),
  attachments: ternaryState('attachments').default(TernaryState.default).notNull(),
  theme: themeEnum('theme').default(Theme.default).notNull(),
  filter: varchar('filter', { length: 250 }),
  lastDigestSentAt: timestampTZ('lastDigestSentAt'),
  lastViewedItemDate: timestampTZ('lastViewedItemDate'),
  createdAt: timestampTZ('createdAt').default(now).notNull(),
  updatedAt: timestampTZ('updatedAt').default(now).notNull(),

  // ===
  userId: integer('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  feedId: integer('feedId')
    .references(() => feeds.id, { onDelete: 'cascade' })
    .notNull(),
  wasFilteredAt: timestampTZ('wasFilteredAt'),
  unsubscribeToken: varchar('unsubscribeToken', { length: 100 }).notNull(),
});

export const userFeedsRelations = relations(userFeeds, ({ one }) => ({
  user: one(users, {
    fields: [userFeeds.userId],
    references: [users.id],
  }),
  feed: one(feeds, {
    fields: [userFeeds.feedId],
    references: [feeds.id],
  }),
}));

export type UserFeed = InferModel<typeof userFeeds>;
export type NewUserFeed = InferModel<typeof userFeeds, 'insert'>;
export type UserFeedWithOpts = UserFeed & { user: User & { options: Options } };

export const usersToBeDeleted = pgTable('users_to_be_deleted', {
  userId: integer('userId').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestampTZ('createdAt').default(now).notNull(),
});

export const userToBeDeletedRelations = relations(usersToBeDeleted, ({ one }) => ({
  user: one(users, {
    fields: [usersToBeDeleted.userId],
    references: [users.id],
  }),
}));
