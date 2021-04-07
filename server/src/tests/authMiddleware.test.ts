import test from 'ava';
import { getSdk } from './graphql/generated.js';
import { startTestServer, stopTestServer } from './test-server.js';
import getTestClient from './test-utils/getClient.js';
import { generateUserAndGetSdk } from './test-utils/login.js';

test.before(() => startTestServer());
test.after(() => stopTestServer());

test.serial('Authentication Error', async (t) => {
  const sdk = getSdk(getTestClient().client);
  const expectAuthError = async (query: Promise<any>) => {
    const err = await t.throwsAsync(query);
    t.regex(err.message, /not authenticated/);
  };
  await expectAuthError(sdk.me());
  await expectAuthError(sdk.addFeedToCurrentUser({ input: { feedUrl: 'http://feed.com' } }));
  await expectAuthError(sdk.users());
});

test.serial('Forbidden Error', async (t) => {
  const { sdk } = await generateUserAndGetSdk();
  const err = await t.throwsAsync(sdk.users());
  t.regex(err.message, /forbidden/);
});
