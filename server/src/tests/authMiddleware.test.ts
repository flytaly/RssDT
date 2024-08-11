import { db } from '#root/db/db.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import { startTestServer, stopTestServer } from '#root/tests/test-server.js';
import getTestClient from '#root/tests/test-utils/getClient.js';
import { createUserAndGetSdk } from '#root/tests/test-utils/login.js';
import test from 'ava';

test.before(() => startTestServer());
test.after(() => stopTestServer());

test.serial('Authentication Error', async (t) => {
  const sdk = getSdk(getTestClient().client);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectAuthError = async (query: Promise<any>) => {
    const err = await t.throwsAsync(query);
    t.regex(err?.message || '', /not authenticated/);
  };
  await expectAuthError(sdk.addFeedToCurrentUser({ input: { feedUrl: 'http://feed.com' } }));
  await expectAuthError(sdk.users());
});

test.serial('Forbidden Error', async (t) => {
  const { sdk } = await createUserAndGetSdk(db);
  const err = await t.throwsAsync(sdk.users());
  t.regex(err?.message || '', /forbidden/);
});
