import { DB } from '#root/db/db.js';
import { users, usersToBeDeleted } from '#root/db/schema.js';
import { eq } from 'drizzle-orm';

/** Set user.deleted = true and add reference to the user into the deleting queue. */
export const setUserDeleted = async (db: DB, userId: number) => {
  if (!userId) return;
  try {
    await db.transaction(async (tx) => {
      await tx.update(users).set({ deleted: true }).where(eq(users.id, userId));
      await tx.insert(usersToBeDeleted).values({ userId }).execute();
    });
  } catch (error) {
    return error?.message;
  }
};
