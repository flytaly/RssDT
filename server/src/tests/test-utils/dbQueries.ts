import { DB } from '#root/db/db.js';
import { feeds, users, usersToBeDeleted } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';
import {normalizeUrl } from '#root/utils/normalizer.js';

export async function deleteUserWithEmail(db: DB, email: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return;
  await db.delete(usersToBeDeleted).where(eq(usersToBeDeleted.userId, user.id)).execute();
  await db.delete(users).where(eq(users.id, user.id)).execute();
}

export async function deleteFeedWithUrl(db: DB, url: string) {
  await db
    .delete(feeds)
    .where(eq(feeds.url, normalizeUrl(url)))
    .execute();
}
