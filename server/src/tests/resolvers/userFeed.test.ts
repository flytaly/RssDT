import { startTestServer, stopTestServer } from '#root/tests/test-server.js';

import { db } from '#root/db/db.js';
import { User, userFeeds, users } from '#root/db/schema.js';
import { UserFeedOptionsInput } from '#root/resolvers/resolver-types/inputs.js';
import { getSdk } from '#root/tests/graphql/generated.js';
import { deleteFeedWithUrl, deleteUserWithEmail } from '#root/tests/test-utils/dbQueries.js';
import { generateFeed } from '#root/tests/test-utils/generate-feed.js';
import getTestClient from '#root/tests/test-utils/getClient.js';
import { createUserAndGetSdk } from '#root/tests/test-utils/login.js';
import { DigestSchedule, TernaryState, Theme } from '#root/types/enums.js';
import test from 'ava';
import { eq } from 'drizzle-orm';
import nock from 'nock';

let testData: {
  feeds: ReturnType<typeof generateFeed>[];
  user: User;
};
let sdk: ReturnType<typeof getSdk>;

test.before(async () => {
  await startTestServer();
  const feeds = [generateFeed(), generateFeed(), generateFeed()];
  feeds.forEach((f) => f.mockRequests());
  const { user, sdk: $sdk } = await createUserAndGetSdk(db, 'testmyfeeds@test.com');
  sdk = $sdk;
  testData = { user, feeds };
});

test.after(async () => {
  nock.cleanAll();
  await deleteUserWithEmail(db, testData.user.email);
  await Promise.all(testData.feeds.map(async (f) => deleteFeedWithUrl(db, f.feedUrl)));
  await stopTestServer();
});

test.serial('myFeeds query', async (t) => {
  const r = testData.feeds.map(({ feedUrl }) => sdk.addFeedToCurrentUser({ input: { feedUrl } }));
  await Promise.all(r);
  const { myFeeds } = await sdk.myFeeds();
  t.is(myFeeds?.length, testData.feeds.length);
  const urls = new Set(testData.feeds.map((f) => f.feedUrl));
  t.true(myFeeds?.every((f) => urls.has(f.feed.url)));
});

test.serial('deleteMyFeeds mutation: delete 2 feeds', async (t) => {
  const feeds = await db.query.userFeeds.findMany({
    where: eq(userFeeds.userId, testData.user.id),
  });
  t.is(feeds.length, testData.feeds.length);
  const idsToDelete = feeds.map((f) => f.id).slice(0, 2);
  const { deleteMyFeeds } = await sdk.deleteMyFeeds({ ids: idsToDelete });
  t.deepEqual(
    deleteMyFeeds.ids,
    idsToDelete.map((id) => `${id}`),
  );
});

test.serial('feeds options: return default options', async (t) => {
  const { myFeeds } = await sdk.myFeeds();
  t.like(myFeeds?.[0], {
    activated: false,
    title: null,
    schedule: DigestSchedule.disable,
    withContentTable: TernaryState.default,
    itemBody: TernaryState.default,
    attachments: TernaryState.default,
    theme: Theme.default,
    filter: null,
  });
});

test.serial('feed options: update', async (t) => {
  const opts: UserFeedOptionsInput = {
    title: 'test title',
    schedule: DigestSchedule.every6hours,
    withContentTable: TernaryState.disable,
    itemBody: TernaryState.enable,
    attachments: TernaryState.enable,
    theme: Theme.text,
    filter: 'cat or dog',
  };
  const feeds = await db.query.userFeeds.findMany({
    where: eq(userFeeds.userId, testData.user.id),
  });
  const { setFeedOptions } = await sdk.setFeedOptions({ id: feeds[0].id, opts });
  t.like(setFeedOptions.userFeed, opts);
});

test.serial("feed options: forbid updating someone else's feed", async (t) => {
  const anotherUser = await createUserAndGetSdk(db, 'someoneelse@test.com');
  let userFeed = await db.query.userFeeds.findFirst({
    where: eq(userFeeds.userId, testData.user.id),
  });
  t.truthy(userFeed);
  await db.update(userFeeds).set({ attachments: TernaryState.default }).returning();
  const { setFeedOptions } = await anotherUser.sdk.setFeedOptions({
    id: userFeed!.id,
    opts: { attachments: TernaryState.disable },
  });
  // reload the feed
  userFeed = await db.query.userFeeds.findFirst({ where: eq(userFeeds.id, userFeed!.id) });
  t.falsy(setFeedOptions.userFeed);
  t.is(userFeed!.attachments, TernaryState.default);
  db.delete(users).where(eq(users.id, anotherUser.user.id)).execute();
});

test.serial("unsubscribe flow: fetch feed's info and unsubscribe", async (t) => {
  const anonSdk = getSdk(getTestClient().client);
  const userFeed = await db.query.userFeeds.findFirst({
    where: eq(userFeeds.userId, testData.user.id),
    with: { feed: true },
  });
  t.truthy(userFeed);
  const { feed, id, unsubscribeToken } = userFeed!;
  await db.update(userFeeds).set({ schedule: DigestSchedule.daily }).execute();

  const info = await anonSdk.getFeedInfoByToken({ id: `${id}`, token: unsubscribeToken });
  t.is(info.getFeedInfoByToken?.feed.title, feed.title);
  t.is(info.getFeedInfoByToken?.feed.url, feed.url);

  const unsub = await sdk.unsubscribeByToken({ id: `${id}`, token: unsubscribeToken });
  t.true(unsub.unsubscribeByToken);

  const userFeedAfter = await db.query.userFeeds.findFirst({ where: eq(userFeeds.id, id) });
  t.like(userFeedAfter, { id, schedule: DigestSchedule.disable });
});
