import { Connection, EntityManager, QueryRunner } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Options, User } from '#entities';

import { defaultLocale, defaultTimeZone } from '../../constants.js';
import { UserInfo } from './createUserFeed.js';

export async function upsertUser(
  conn: Connection | EntityManager | QueryRunner,
  email: string,
  userInfo?: UserInfo | null,
) {
  const { locale = defaultLocale, timeZone = defaultTimeZone } = userInfo || {};
  const result = await conn.query(
    `
        WITH new_user AS (
                INSERT INTO "user" ("email", "locale", "timeZone")
                       VALUES ($1, $2, $3)
                ON CONFLICT("email") DO NOTHING
                RETURNING *
            )
            SELECT * FROM new_user
        UNION
            SELECT * FROM "user" WHERE email=$1
                `,
    [email, locale, timeZone],
  );
  return result[0] as User;
}

export async function upsertUserAndReturn(
  queryRunner: QueryRunner,
  email: string | null,
  userInfo?: UserInfo | null,
) {
  const user = await upsertUser(queryRunner, email!, userInfo);
  if (!user.id) throw new Error("Couldn't fetch user");
  const userId = user.id;
  const options = Options.create({ userId });
  await queryRunner.manager.save(options);
  return user;
}
