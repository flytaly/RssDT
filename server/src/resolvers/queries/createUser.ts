import { DB } from '#root/db/db.js';
import { NewUser, options, Options, User, users } from '#root/db/schema.js';
import { ArgumentError } from '#root/resolvers/resolver-types/errors.js';

type UserWithOptions = User & { options: Options };

export async function createUser(db: DB, newUser: NewUser) {
  try {
    const user = await db.transaction(async (tx) => {
      const insertedUser = await tx.insert(users).values(newUser).returning();
      const opts = await tx.insert(options).values({ userId: insertedUser[0].id }).returning();
      (insertedUser[0] as UserWithOptions).options = opts[0];
      return insertedUser[0];
    });
    return { user, error: null };
  } catch (err) {
    if (err.code === '23505') {
      return { error: new ArgumentError('email', 'User already exists') };
    }
    return { error: new ArgumentError('', err.message) };
  }
}
