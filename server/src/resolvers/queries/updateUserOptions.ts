import { DB } from '#root/db/db.js';
import { Options, options } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';

export async function updateUserOptions(db: DB, userId: number, values: Partial<Options>) {
  const result = await db //
    .update(options)
    .set(values)
    .where(eq(options.userId, userId))
    .returning();
  return { options: result[0] };
}
