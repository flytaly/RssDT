import { DB } from '#root/db/db.js';
import { User, users } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';

export async function updateUser(db: DB, id: number, values: Partial<User>) {
  const result = await db //
    .update(users)
    .set(values)
    .where(eq(users.id, id))
    .returning();
  return { user: result[0] as User };
}
