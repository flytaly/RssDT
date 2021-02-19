import faker from 'faker';
import argon2 from 'argon2';
import { getSdk } from '../graphql/generated';
import getTestClient from './getClient';
import { User } from '../../entities/User';
import { Options } from '../../entities/Options';

export const getSdkWithLoggedInUser = async (email: string, password: string) => {
  const { client, lastHeaders } = getTestClient();
  const sdk = getSdk(client);
  const { login } = await sdk.login({ email, password });
  expect(login.errors).toBeNull();
  expect(login.user?.email).toBe(email);

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
