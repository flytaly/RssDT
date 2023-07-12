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
