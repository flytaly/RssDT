import faker from 'faker';
import argon2 from 'argon2';
// eslint-disable-next-line import/extensions
import { User, Options } from '#entities';
import { getSdk } from '../graphql/generated.js';
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
