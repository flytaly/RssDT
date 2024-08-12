import { eq, sql } from 'drizzle-orm';

import { DB } from '#root/db/db.js';
import { User, userFeeds, users } from '#root/db/schema.js';

type UserWithFeedCount = User & {
  countFeeds: number;
};

interface UserIdId {
  userId?: number;
  email: string;
}

interface UserIdEmail {
  userId: number;
  email?: string;
}

type UserIdArgs = UserIdId | UserIdEmail;

export const getUserAndCountFeeds = async (db: DB, { userId, email }: UserIdArgs) => {
  if (!userId && !email) return null;

  const where = userId ? eq(users.id, userId) : eq(users.email, email!);

  const res = (await db
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      role: users.role,
      locale: users.locale,
      timeZone: users.timeZone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      countFeeds: sql<number>`count(${userFeeds.userId})`,
    }) //
    .from(users)
    .leftJoin(userFeeds, eq(users.id, userFeeds.userId))
    .groupBy(users.id)
    .where(where)) as UserWithFeedCount[];

  return res[0] || null;
};
