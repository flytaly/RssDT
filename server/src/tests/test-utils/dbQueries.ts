import { DB } from '#root/db/db.js';
import { feeds, users } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';
import { importNormalizer, normalizeUrl } from '#root/utils/normalizer.js';

export function deleteUserWithEmail(db: DB, email: string) {
  return db.delete(users).where(eq(users.email, email)).execute();
}

export async function deleteFeedWithUrl(db: DB, url: string) {
  await importNormalizer();
  await db
    .delete(feeds)
    .where(eq(feeds.url, normalizeUrl(url)))
    .execute();
}
