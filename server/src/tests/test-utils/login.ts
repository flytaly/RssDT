import { type DB } from '#root/db/db.js';
import { options, users } from '#root/db/schema.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import argon2 from 'argon2';
import { faker } from '@faker-js/faker';
import getTestClient from './getClient.js';
import { eq } from 'drizzle-orm';

export const getSdkWithLoggedInUser = async (email: string, password: string) => {
  const { client, lastHeaders } = getTestClient();
  const sdk = getSdk(client);
  const { login } = await sdk.login({ email, password });

  if (login.errors) throw new Error(login.errors[0].message);
  const cookie = lastHeaders.pop()?.get('set-cookie');
  client.setHeader('cookie', cookie!);
  return sdk;
};

export const createUserAndGetSdk = async (db: DB, email?: string, password?: string) => {
  password = password || faker.internet.password({ length: 8 });
  email = email || faker.internet.email().toLowerCase();
  await db.delete(users).where(eq(users.email, email));
  const insertedUsers = await db
    .insert(users)
    .values({
      email,
      password: await argon2.hash(password),
    })
    .returning();
  const insertedOpts = await db.insert(options).values({ userId: insertedUsers[0].id }).returning();
  const user = { ...insertedUsers[0], options: insertedOpts[0] };

  const sdk = await getSdkWithLoggedInUser(email, password);
  return { user, sdk };
};
