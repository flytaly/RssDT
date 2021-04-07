import test from 'ava';
import nock from 'nock';
// eslint-disable-next-line import/extensions
import { User, UserFeed } from '#entities';
import { UserFeedOptionsInput } from '../../resolvers/resolver-types/inputs.js';
import { DigestSchedule, TernaryState, Theme } from '../../types/enums.js';
import { getSdk } from '../graphql/generated.js';
import { startTestServer, stopTestServer } from '../test-server.js';
import { generateFeed } from '../test-utils/generate-feed.js';
import getTestClient from '../test-utils/getClient.js';
import { generateUserAndGetSdk } from '../test-utils/login.js';

let testData: {
  feeds: ReturnType<typeof generateFeed>[];
  user: User;
};
let sdk: ReturnType<typeof getSdk>;

test.before(async () => {
  await startTestServer();
  const feeds = [generateFeed(), generateFeed(), generateFeed()];
  feeds.forEach((f) => f.mockRequests());
  const { user, sdk: $sdk } = await generateUserAndGetSdk('testmyfeeds@test.com');
  sdk = $sdk;
  testData = { user, feeds };
});

test.after(async () => {
  nock.cleanAll();
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
  const feeds = await UserFeed.find({ where: { userId: testData.user.id } });
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
  const feeds = await UserFeed.find({ where: { userId: testData.user.id } });
  const { setFeedOptions } = await sdk.setFeedOptions({ id: feeds[0].id, opts });
  t.like(setFeedOptions.userFeed, opts);
});

test.serial("feed options: forbid updating someone else's feed", async (t) => {
  const anotherUser = await generateUserAndGetSdk('someoneelse@test.com');
  const userFeed = (await UserFeed.findOne({ where: { userId: testData.user.id } })) as UserFeed;
  t.truthy(userFeed);
  userFeed.attachments = TernaryState.enable;
  await userFeed.save();
  const { setFeedOptions } = await anotherUser.sdk.setFeedOptions({
    id: userFeed.id,
    opts: { attachments: TernaryState.disable },
  });
  t.falsy(setFeedOptions.userFeed);
  await userFeed.reload();
  t.is(userFeed.attachments, TernaryState.enable);
  await anotherUser.user.remove();
});

test.serial("unsubscribe flow: fetch feed's info and unsubscribe", async (t) => {
  const anonSdk = getSdk(getTestClient().client);
  const uF = await UserFeed.findOne({ where: { userId: testData.user.id }, relations: ['feed'] });
  t.truthy(uF);
  uF!.schedule = DigestSchedule.daily;
  await uF?.save();

  const { feed, id, unsubscribeToken } = uF!;

  const info = await anonSdk.getFeedInfoByToken({ id: `${id}`, token: unsubscribeToken });
  t.is(info.getFeedInfoByToken?.feed.title, feed.title);
  t.is(info.getFeedInfoByToken?.feed.url, feed.url);

  const unsub = await sdk.unsubscribeByToken({ id: `${id}`, token: unsubscribeToken });
  t.true(unsub.unsubscribeByToken);
  await uF!.reload();
  t.like(uF, { id, schedule: DigestSchedule.disable });
});
