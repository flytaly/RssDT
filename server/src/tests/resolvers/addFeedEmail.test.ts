import { startTestServer, stopTestServer } from '#root/tests/test-server.js';

import { db } from '#root/db/db.js';
import { userFeeds, users } from '#root/db/schema.js';
import {
  AddFeedEmailInput,
  UserFeedOptionsInput,
  UserInfoInput,
} from '#root/resolvers/resolver-types/inputs.js';
import { DigestSchedule } from '#root/types/enums.js';
import test, { ExecutionContext } from 'ava';
import { SQL, eq } from 'drizzle-orm';
import faker from 'faker';
import nock from 'nock';
import * as uuid from 'uuid';
import { getSdk } from '#root/tests/graphql/generated.js';
import { generateFeed } from '#root/tests/test-utils/generate-feed.js';
import getTestClient from '#root/tests/test-utils/getClient.js';
import {
  deleteEmails,
  getEmailByAddress,
  getSubscriptionConfirmData,
} from '#root/tests/test-utils/test-emails.js';

let testData: {
  feed: ReturnType<typeof generateFeed>;
  input: AddFeedEmailInput;
  userInfo: UserInfoInput;
};

const sdk = getSdk(getTestClient().client);

test.before(async () => {
  await startTestServer();

  const feed = generateFeed();
  feed.mockRequests();
  const input = { feedUrl: feed.feedUrl, email: faker.internet.email().toLowerCase() };
  testData = { feed, input, userInfo: { locale: 'de', timeZone: 'Europe/Berlin' } };
});

test.after(() => {
  nock.cleanAll();
  return stopTestServer();
});

test.afterEach(async () => {
  await deleteEmails();
});

async function getToken(email: string, userFeedId: number | string, t: ExecutionContext<unknown>) {
  const mail = await getEmailByAddress(email);
  t.truthy(mail);
  const tokenAndId = getSubscriptionConfirmData(mail!);
  t.true(tokenAndId.token.length > 0);
  t.is(tokenAndId.userFeedId, String(userFeedId));
  return tokenAndId;
}

async function getUserFeed(where: SQL<unknown>) {
  return db.query.userFeeds.findFirst({
    with: { user: true, feed: true },
    where,
  });
}

test.serial('addFeedWithEmail: create user, feed, send mail', async (t) => {
  const { userInfo, input } = testData;

  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.disable };
  const response = await sdk.addFeedWithEmail({ input, userInfo, feedOpts });
  const { userFeed, errors } = response.addFeedWithEmail!;
  t.falsy(errors);
  t.truthy(userFeed);

  const dbUserFeed = await getUserFeed(eq(userFeeds.id, userFeed!.id));
  const expectedUf = { ...feedOpts, schedule: DigestSchedule.daily, activated: false };
  t.like(dbUserFeed, expectedUf, 'cannot disable digests');
  t.like(dbUserFeed?.user, { ...userInfo, emailVerified: false }, 'email should be not verified');
  t.like(dbUserFeed?.feed, { url: testData.feed.feedUrl, activated: false }, "feed isn't activate");
  t.true(uuid.validate(dbUserFeed!.unsubscribeToken));

  await getToken(input.email, userFeed?.id!, t);
});

test.serial("addFeedWithEmail: should send another mail if feed wasn't activated", async (t) => {
  const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input: testData.input });
  const { userFeed, errors } = addFeedWithEmail!;
  t.falsy(errors);
  t.like(userFeed, { activated: false });
  await getToken(testData.input.email, userFeed?.id!, t);
});

test.serial('activateFeed: activate feed', async (t) => {
  const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input: testData.input });
  const feedId = addFeedWithEmail?.userFeed?.id;
  const tokenAndId = await getToken(testData.input.email, feedId!, t);

  const { activateFeed } = await sdk.activateFeed(tokenAndId);
  t.like(activateFeed.userFeed, { activated: true });
  const dbUserFeed = await getUserFeed(eq(userFeeds.id, feedId!));
  t.like(dbUserFeed, { activated: true });
  t.like(dbUserFeed?.user, { emailVerified: true });
  t.like(dbUserFeed?.feed, { activated: true });
});

test.serial('addFeedWithEmail: return error if feed was activated', async (t) => {
  const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input: testData.input });
  t.falsy(addFeedWithEmail?.userFeed);
  t.like(addFeedWithEmail?.errors?.[0], { argument: 'url', message: 'feed was already added' });
});

test.serial('addFeedWithEmail: add another feed to the same user', async (t) => {
  const feed2 = generateFeed();
  feed2.mockRequests();
  const { email } = testData.input;
  const { addFeedWithEmail } = await sdk.addFeedWithEmail({
    input: { email, feedUrl: feed2.feedUrl },
  });
  t.falsy(addFeedWithEmail!.errors);
  t.is(addFeedWithEmail!.userFeed?.feed.url, feed2.feedUrl);
  t.like(addFeedWithEmail?.userFeed, { activated: false });
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const uFeed = await db.query.userFeeds.findMany({ where: eq(userFeeds.userId, user!.id) });
  t.is(uFeed.length, 2);
});

test('error: not a feed', async (t) => {
  const feedUrl = faker.internet.url();
  nock(feedUrl).get('/').reply(200, 'text');
  const response = await sdk.addFeedWithEmail({ input: { email: testData.input.email, feedUrl } });
  const errors = response.addFeedWithEmail?.errors;
  t.is(errors?.length, 1);
  t.like(errors![0], { argument: 'url', message: 'Not a feed' });
});

test('error: no access to feed', async (t) => {
  const feedUrl = faker.internet.url();
  nock(feedUrl).get('/').replyWithError({ message: 'error_message', code: 'error_code' });
  const response = await sdk.addFeedWithEmail({
    input: { email: testData.input.email, feedUrl },
  });
  const errors = response.addFeedWithEmail?.errors;
  t.is(errors?.length, 1);
  t.like(errors![0], { argument: 'url', message: "Couldn't get access to feed" });
});

test('normalize url', async (t) => {
  const inputUrl = ' domain.com ';
  const correctUrl = `https://${inputUrl.trim()}`;
  generateFeed({ feedUrl: correctUrl }).mockRequests();

  const { addFeedWithEmail } = await sdk.addFeedWithEmail({
    input: { email: testData.input.email, feedUrl: inputUrl },
  });
  t.is(addFeedWithEmail?.userFeed?.feed.url, correctUrl);
});

test('validate url', async (t) => {
  const wrongUrls = ['', 'https:', 'https://', 'ftp://asdf.com', 'juststring'];
  const promises = wrongUrls.map(async (feedUrl) => {
    const r = await sdk.addFeedWithEmail({ input: { email: testData.input.email, feedUrl } });
    t.is(r.addFeedWithEmail?.errors?.[0].argument, 'feedUrl');
  });
  await Promise.all(promises);
});
