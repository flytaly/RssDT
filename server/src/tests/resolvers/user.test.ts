import { startTestServer, stopTestServer } from '#root/tests/test-server.js';

import { db } from '#root/db/db.js';
import { users, usersToBeDeleted } from '#root/db/schema.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import { deleteUserWithEmail } from '#root/tests/test-utils/dbQueries.js';
import getTestClient from '#root/tests/test-utils/getClient.js';
import { getSdkWithLoggedInUser } from '#root/tests/test-utils/login.js';
import {
  deleteEmails,
  getConfirmRegisterData,
  getEmailByAddress,
  getPasswordResetData,
} from '#root/tests/test-utils/test-emails.js';
import argon2 from 'argon2';
import test from 'ava';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

const email = faker.internet.email().toLowerCase();
const password = faker.internet.password({ length: 8 });
const sdkAnonym = getSdk(getTestClient().client);

test.before(() => startTestServer());

test.afterEach(async () => {
  await deleteEmails();
});

test.after(async () => {
  await deleteUserWithEmail(db, email);
  return stopTestServer();
});

const registerUser = async () => {
  await deleteUserWithEmail(db, email);
  return sdkAnonym.register({ email, password });
};

test.serial('register: create user and return cookie', async (t) => {
  const { client, lastHeaders } = getTestClient();
  const sdk = getSdk(client);
  const { register } = await sdk.register({ email, password });
  t.is(register.user?.email, email, 'registered');

  const cookie = lastHeaders.pop()?.get('set-cookie');
  client.setHeader('cookie', cookie!);
  const { me } = await sdk.me();
  t.is(me?.email, email);
  t.false(me?.emailVerified);
});

test.serial('register: should hash password', async (t) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  t.truthy(await argon2.verify(user!.password!, password));
});

test.serial('me: return null without cookie', async (t) => {
  const { me } = await sdkAnonym.me();
  t.is(me, null);
});

test.serial('register: user already exist error', async (t) => {
  await registerUser();
  const { register } = await sdkAnonym.register({ email, password });
  t.like(register.errors![0], { message: 'User already exists', argument: 'email' });
});

test.serial('verifyEmail: send confirmation email and activate with token', async (t) => {
  await registerUser();
  const mail = await getEmailByAddress(email);
  t.like(mail, { subject: 'Confirm registration' });
  const { verifyEmail } = await sdkAnonym.verifyEmail(getConfirmRegisterData(mail!));
  t.like(verifyEmail.user, { email, emailVerified: true });
});

test.serial('requestEmailVerification: send confirmation email', async (t) => {
  await registerUser();
  await deleteEmails();

  await t.throwsAsync(sdkAnonym.requestEmailVerification());
  const sdk = await getSdkWithLoggedInUser(email, password);
  const response = await sdk.requestEmailVerification();
  t.true(response.requestEmailVerification);

  const mail = await getEmailByAddress(email);
  t.like(mail, { subject: 'Confirm registration' });
  const { verifyEmail } = await sdkAnonym.verifyEmail(getConfirmRegisterData(mail!));
  t.like(verifyEmail.user, { email, emailVerified: true });
});

test.serial('requestPasswordReset: reset password flow', async (t) => {
  await registerUser();
  await deleteEmails();

  const newPass = faker.internet.password({ length: 10 });

  const sdk = await getSdkWithLoggedInUser(email, password);
  const { requestPasswordReset } = await sdk.requestPasswordReset({ email });
  t.like(requestPasswordReset, { message: 'OK' });
  const mail = await getEmailByAddress(email);
  t.truthy(mail);

  const tokenAndId = getPasswordResetData(mail!);
  const r = await sdk.resetPassword({ input: { ...tokenAndId, password: newPass } });
  t.like(r.resetPassword.user, { email });

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, +tokenAndId.userId) });
  t.true(await argon2.verify(userRecord!.password!, newPass));
});

test.serial('login: log in and set cookie', async (t) => {
  await registerUser();
  const { client, lastHeaders } = getTestClient();
  const sdk = getSdk(client);
  const { login } = await sdk.login({ email, password });
  t.like(login.user, { email });

  const cookie = lastHeaders.pop()?.get('set-cookie');
  client.setHeader('cookie', cookie!);
  const { me } = await sdk.me();
  t.like(me, { email });
});

test.serial('login error: incorrect email', async (t) => {
  const sdk = getSdk(getTestClient().client);
  const { login } = await sdk.login({ email: 'wrongemail@something.com', password });
  t.falsy(login.user);
  t.like(login.errors![0], {
    message: "User with such email doesn't exist",
    argument: 'email',
  });
});

test.serial('login error: incorrect or empty password ', async (t) => {
  const sdk = getSdk(getTestClient().client);
  const l1 = await sdk.login({ email, password: 'password1234' });
  t.falsy(l1.login.user);
  t.like(l1.login.errors![0], {
    message: 'Wrong password',
    argument: 'password',
  });
  const l2 = await sdk.login({ email, password: '' });
  t.falsy(l2.login.user);
  t.like(l2.login.errors![0], {
    message: '"password" is not allowed to be empty',
    argument: 'password',
  });
});

test.serial('input normalization', async (t) => {
  const sdk = getSdk(getTestClient().client);

  const emailInput = ` ${faker.internet.email().toUpperCase()} `;
  const passwordInput = ' password  ';
  const normEmail = emailInput.trim().toLowerCase();
  const normPassword = passwordInput.trim().toLowerCase();
  const { register } = await sdk.register({ email: emailInput, password: passwordInput });
  t.is(register.user?.email, normEmail);

  const l1 = await sdk.login({ email: normEmail, password: normPassword });
  const l2 = await sdk.login({ email: emailInput, password: passwordInput });
  t.is(l1.login?.user?.email, normEmail);
  t.is(l2.login?.user?.email, normEmail);
});

test.serial('input validation: register', async (t) => {
  const sdk = getSdk(getTestClient().client);
  const argErrorTest = async (args: { email: string; password: string }, argument: string) => {
    const resp = await sdk.register(args);
    t.is(resp.register?.errors?.[0].argument, argument);
  };
  await argErrorTest({ email: '', password: '32742374892374' }, 'email');
  await argErrorTest({ email: faker.internet.email(), password: '' }, 'password');
  await argErrorTest({ email: 'not an email', password: '32742374892374' }, 'email');
  await argErrorTest({ email: faker.internet.email(), password: 'short' }, 'password');
});

test.serial('input validation: login', async (t) => {
  const sdk = getSdk(getTestClient().client);
  const argErrorTest = async (args: { email: string; password: string }, argument: string) => {
    const resp = await sdk.register(args);
    t.is(resp.register?.errors?.[0].argument, argument);
  };
  await argErrorTest({ email: '', password: '32742374892374' }, 'email');
  await argErrorTest({ email: faker.internet.email(), password: '' }, 'password');
  await argErrorTest({ email: 'not an email', password: '32742374892374' }, 'email');
  await argErrorTest({ email: faker.internet.email(), password: 'short' }, 'password');
});

test.serial('delete user', async (t) => {
  await registerUser();

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  t.falsy(user!.deleted);

  const sdk = await getSdkWithLoggedInUser(email, password);
  const resp = await sdk.deleteUser();
  t.is(resp.deleteUser?.message, 'OK');

  const userAfter = await db.query.users.findFirst({ where: eq(users.email, email) });
  t.is(userAfter?.deleted, true);

  const deletedUser = await db.query.usersToBeDeleted.findFirst({
    where: eq(usersToBeDeleted.userId, user!.id),
  });
  t.truthy(deletedUser);
});
