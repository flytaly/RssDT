import argon2 from 'argon2';
import test, { ExecutionContext } from 'ava';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import nock from 'nock';
import * as uuid from 'uuid';

import { startTestServer, stopTestServer } from '#root/tests/test-server.js';

import { db } from '#root/db/db.js';
import { NewUser, feeds, items, userFeeds, users } from '#root/db/schema.js';
import { UserFeedOptionsInput, UserInfoInput } from '#root/resolvers/resolver-types/inputs.js';
import { deleteFeedWithUrl, deleteUserWithEmail } from '#root/tests/test-utils/dbQueries.js';
import { generateFeed } from '#root/tests/test-utils/generate-feed.js';
import { getSdkWithLoggedInUser } from '#root/tests/test-utils/login.js';
import {
  deleteEmails,
  getEmailByAddress,
  getSubscriptionConfirmData,
} from '#root/tests/test-utils/test-emails.js';
import { DigestSchedule } from '#root/types/enums.js';

let testData: {
  feed1: ReturnType<typeof generateFeed>;
  feed2: ReturnType<typeof generateFeed>;
  userInfo: UserInfoInput;
  email: string;
  password: string;
};

test.before(async () => {
  await startTestServer();

  const feed1 = generateFeed();
  const feed2 = generateFeed();
  feed1.mockRequests();
  feed2.mockRequests();
  const email = faker.internet.email().toLowerCase();
  const password = faker.internet.password({ length: 10 });
  const userInfo: UserInfoInput = { locale: 'de', timeZone: 'Europe/Berlin' };
  testData = { feed1, feed2, email, password, userInfo };
  const newUser: NewUser = { email, password: await argon2.hash(password) };
  await db.insert(users).values(newUser).execute();
});

test.after(async () => {
  nock.cleanAll();
  await deleteUserWithEmail(db, testData.email);
  await deleteFeedWithUrl(db, testData.feed1.feedUrl);
  await deleteFeedWithUrl(db, testData.feed2.feedUrl);
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

test.serial('add feed to user with not verified email and activate', async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const input = { feedUrl: testData.feed1.feedUrl };
  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.every6hours };
  const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input, feedOpts });
  const { errors, userFeed } = addFeedToCurrentUser!;
  t.falsy(errors);
  t.is(userFeed?.feed.url, testData.feed1.feedUrl);
  t.like(userFeed, { activated: false });
  //
  const userFeedInDB = await db.query.userFeeds.findFirst({
    where: eq(userFeeds.id, userFeed!.id),
  });
  t.true(uuid.validate(userFeedInDB!.unsubscribeToken));
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const tokenAndId = await getToken(testData.email, userFeed?.id!, t);
  const { activateFeed } = await sdk.activateFeed(tokenAndId);
  t.like(activateFeed.userFeed, { activated: true });
  const uf = await db.query.userFeeds.findFirst({
    where: eq(userFeeds.id, activateFeed.userFeed!.id),
    with: { feed: true, user: true },
  });
  t.like(uf?.user, { emailVerified: true });
  t.like(uf, { ...feedOpts, activated: true });
  t.like(uf?.feed, { activated: true });
});

test.serial('error: user already have this feed', async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const input = { feedUrl: testData.feed1.feedUrl };
  const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input });
  const { userFeed, errors } = addFeedToCurrentUser!;
  t.falsy(userFeed);
  t.true(Array.isArray(errors));
  t.like(errors![0], { argument: 'url', message: 'feed was already added' });
});

test.serial('add another feed to user with verified account', async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.every12hours };
  const { feedUrl } = testData.feed2;
  const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input: { feedUrl }, feedOpts });
  const { userFeed, errors } = addFeedToCurrentUser!;
  t.falsy(errors);
  t.is(userFeed?.feed.url, feedUrl);
  const user = await db.query.users.findFirst({ where: eq(users.email, testData.email) });
  t.not(user, undefined);
  const uFeeds = await db.query.userFeeds.findMany({ where: eq(userFeeds.userId, user!.id) });
  t.is(uFeeds.length, 2);

  const mail = await getEmailByAddress(testData.email);
  t.falsy(mail);

  const uf = await db.query.userFeeds.findFirst({
    where: eq(userFeeds.id, userFeed!.id),
    with: { feed: true, user: true },
  });
  t.like(uf?.user, { emailVerified: true });
  t.like(uf, { ...feedOpts, activated: true });
  t.like(uf?.feed, { activated: true });
});

test.serial('feed should have lastPubdate timestamp', async (t) => {
  const feedInDb = await db.query.feeds.findFirst({ where: eq(feeds.url, testData.feed2.feedUrl) });
  const itemsInDb = await db.query.items.findMany({ where: eq(items.feedId, feedInDb!.id) });
  const pubdate = Math.max(...itemsInDb.map((i) => i.pubdate?.getTime() || 0));
  t.is(feedInDb?.lastPubdate?.getTime(), pubdate);
});

test.serial("meWithFeeds: should return user's feeds", async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const { me } = await sdk.meWithFeeds();
  const feedUrls = me?.feeds?.map((f) => f.feed.url);
  t.is(feedUrls?.length, 2);
  t.truthy(feedUrls?.includes(testData.feed1.feedUrl));
  t.truthy(feedUrls?.includes(testData.feed2.feedUrl));
});

test.serial('should update feed after activation and fetch items', async (t) => {
  const feed = await db.query.feeds.findFirst({ where: eq(feeds.url, testData.feed1.feedUrl) });
  t.truthy(feed);
  const itemsInDb = await db.query.items.findMany({ where: eq(items.feedId, feed!.id) });
  t.is(itemsInDb.length, testData.feed1.items.length);
  const guid = new Set(testData.feed1.items.map((f) => f.guid!));
  const guidInDb = new Set(itemsInDb.map((f) => f.guid!));
  t.deepEqual(guid, guidInDb);
});
