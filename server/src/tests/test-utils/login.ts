import { Options, User } from '#entities';
import { type DB } from '#root/db/db.js';
import { options, users } from '#root/db/schema.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import argon2 from 'argon2';
import faker from 'faker';
import getTestClient from './getClient.js';

export const getSdkWithLoggedInUser = async (email: string, password: string) => {
  const { client, lastHeaders } = getTestClient();
  const sdk = getSdk(client);
  const { login } = await sdk.login({ email, password });

  if (login.errors) throw new Error(login.errors[0].message);
  const cookie = lastHeaders.pop()?.get('set-cookie');
  client.setHeader('cookie', cookie!);
  return sdk;
};

export const generateUserAndGetSdk = async (email?: string, password?: string) => {
  password = password || faker.internet.password(8);
  email = email || faker.internet.email().toLowerCase();
  const user = await User.create({
    email,
    password: await argon2.hash(password),
    options: new Options(),
  }).save();
  const sdk = await getSdkWithLoggedInUser(email, password);
  return { user, sdk };
};

export const createUserAndGetSdk = async (db: DB, email?: string, password?: string) => {
  password = password || faker.internet.password(8);
  email = email || faker.internet.email().toLowerCase();
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
