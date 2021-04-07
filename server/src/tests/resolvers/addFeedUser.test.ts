import argon2 from 'argon2';
import test, { ExecutionContext } from 'ava';
import faker from 'faker';
import nock from 'nock';
import * as uuid from 'uuid';
// eslint-disable-next-line import/extensions
import { Feed, Item, User, UserFeed } from '#entities';
import { UserFeedOptionsInput, UserInfoInput } from '../../resolvers/resolver-types/inputs.js';
import { DigestSchedule } from '../../types/enums.js';
import { startTestServer, stopTestServer } from '../test-server.js';
import { generateFeed } from '../test-utils/generate-feed.js';
import { getSdkWithLoggedInUser } from '../test-utils/login.js';
import {
  deleteEmails,
  getEmailByAddress,
  getSubscriptionConfirmData,
} from '../test-utils/test-emails.js';

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
  const password = faker.internet.password(10);
  const userInfo: UserInfoInput = { locale: 'de', timeZone: 'Europe/Berlin' };
  testData = { feed1, feed2, email, password, userInfo };
  await User.create({ email, password: await argon2.hash(password) }).save();
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
test.serial('add feed to user with not verified email and activate', async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const input = { feedUrl: testData.feed1.feedUrl };
  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.every6hours };
  const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input, feedOpts });
  const { errors, userFeed } = addFeedToCurrentUser!;
  t.falsy(errors);
  t.is(userFeed?.feed.url, testData.feed1.feedUrl);
  t.like(userFeed, { activated: false });

  const userFeedInDB = await UserFeed.findOne(userFeed?.id);
  t.true(uuid.validate(userFeedInDB!.unsubscribeToken));

  const tokenAndId = await getToken(testData.email, userFeed?.id!, t);
  const { activateFeed } = await sdk.activateFeed(tokenAndId);
  t.like(activateFeed.userFeed, { activated: true });
  const uf = await UserFeed.findOne(activateFeed.userFeed?.id, { relations: ['feed', 'user'] });
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
  const user = await User.findOne({ where: { email: testData.email } });
  const uFeed = await UserFeed.find({ where: { userId: user?.id } });
  t.is(uFeed.length, 2);

  const mail = await getEmailByAddress(testData.email);
  t.falsy(mail);

  const uf = await UserFeed.findOne(userFeed?.id, { relations: ['feed', 'user'] });
  t.like(uf?.user, { emailVerified: true });
  t.like(uf, { ...feedOpts, activated: true });
  t.like(uf?.feed, { activated: true });
});

test.serial('feed should have lastPubdate timestamp', async (t) => {
  const feedInDb = await Feed.findOne({ where: { url: testData.feed2.feedUrl } });
  const items = await Item.find({ where: { feedId: feedInDb?.id } });
  const pubdate = Math.max(...items.map((i) => i.pubdate?.getTime() || 0));
  t.is(feedInDb?.lastPubdate?.getTime(), pubdate);
});

test.serial("meWithFeeds: should return user's feeds", async (t) => {
  const sdk = await getSdkWithLoggedInUser(testData.email, testData.password);
  const { me } = await sdk.meWithFeeds();
  t.is(me?.feeds.length, 2);
  t.like(me?.feeds[0].feed, { url: testData.feed1.feedUrl });
  t.like(me?.feeds[1].feed, { url: testData.feed2.feedUrl });
});

test.serial('should update feed after activation and fetch items', async (t) => {
  // wait for feed to update
  // await new Promise((resolve) => setTimeout(resolve, 30));
  const feed = await Feed.findOneOrFail({ where: { url: testData.feed1.feedUrl } });
  t.truthy(feed);
  const items = await Item.find({ where: { feedId: feed!.id } });
  t.is(items.length, testData.feed1.items.length);
  const guid = new Set(testData.feed1.items.map((f) => f.guid));
  const guidInDb = new Set(items.map((f) => f.guid));
  t.deepEqual(guid, guidInDb);
});
