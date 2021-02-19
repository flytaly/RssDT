import argon2 from 'argon2';
import faker from 'faker';
import nock from 'nock';
import { Connection } from 'typeorm';
import * as uuid from 'uuid';
import { initDbConnection } from '../../dbConnection';
import { Feed } from '../../entities/Feed';
import { Item } from '../../entities/Item';
import { User } from '../../entities/User';
import { UserFeed } from '../../entities/UserFeed';
import { AddFeedEmailInput, UserFeedOptionsInput, UserInfoInput } from '../../resolvers/common/inputs';
import { DigestSchedule } from '../../types/enums';
import { getSdk } from '../graphql/generated';
import { deleteFeedWithUrl, deleteUserWithEmail } from '../test-utils/dbQueries';
import { generateFeed } from '../test-utils/generate-feed';
import getTestClient from '../test-utils/getClient';
import { getSdkWithLoggedInUser } from '../test-utils/login';
import { deleteEmails, getEmailByAddress, getSubscriptionConfirmData } from '../test-utils/test-emails';

let dbConnection: Connection;

beforeAll(async () => {
  dbConnection = await initDbConnection();
});

afterAll(() => {
  nock.cleanAll();
  return dbConnection.close();
});

async function testMailAndGetToken(email: string, userFeedId: number | string) {
  const mail = await getEmailByAddress(email);
  expect(mail).not.toBeUndefined();
  const tokenAndId = getSubscriptionConfirmData(mail!);
  expect(tokenAndId.token.length).toBeGreaterThan(0);
  expect(tokenAndId.userFeedId).toBe(String(userFeedId));
  return tokenAndId;
}

describe('Add user feed without authentication', () => {
  const feed1 = generateFeed();
  const feed2 = generateFeed();
  const email = faker.internet.email().toLowerCase();
  let sdk: ReturnType<typeof getSdk>;
  const input: AddFeedEmailInput = { email, feedUrl: feed1.feedUrl };
  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.disable };
  const userInfo: UserInfoInput = { locale: 'de', timeZone: 'Europe/Berlin' };
  let tokenAndId: { token: string; userFeedId: string };

  beforeAll(async () => {
    feed1.mockRequests();
    feed2.mockRequests();
    sdk = getSdk(getTestClient().client);
    await deleteUserWithEmail(email);
  });

  afterEach(() => deleteEmails());

  afterAll(() =>
    Promise.all([deleteUserWithEmail(email), deleteFeedWithUrl(feed1.feedUrl), deleteFeedWithUrl(feed2.feedUrl)]),
  );

  async function testValuesInDb(userFeedId: number, activated: boolean) {
    const userFeedInDB = await UserFeed.findOne(userFeedId, {
      relations: ['user', 'feed'],
    });
    expect(userFeedInDB?.user).toMatchObject({ ...userInfo, emailVerified: activated });
    expect(userFeedInDB?.feed).toMatchObject({ url: input.feedUrl, activated });
    expect(userFeedInDB).toMatchObject({
      ...feedOpts,
      schedule: DigestSchedule.daily,
      activated,
    });

    expect(userFeedInDB?.unsubscribeToken).not.toBeUndefined();
    expect(uuid.validate(userFeedInDB!.unsubscribeToken)).toBeTruthy();
  }

  test('should create feed, user and send activation mail', async () => {
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input, feedOpts, userInfo });
    const { userFeed, errors } = addFeedWithEmail!;
    expect(errors).toBeNull();
    expect(userFeed).not.toBeNull();

    await testValuesInDb(userFeed?.id!, false);
    tokenAndId = await testMailAndGetToken(email, userFeed?.id!);
  });

  test("should send another mail if feed wasn't activated", async () => {
    await deleteEmails();
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({
      input: { email, feedUrl: feed1.feedUrl },
    });
    const { userFeed, errors } = addFeedWithEmail!;
    expect(userFeed).toHaveProperty('activated', false);
    expect(errors).toBeNull();
    tokenAndId = await testMailAndGetToken(email, userFeed?.id!);
  });

  test('should activate feed', async () => {
    const { activateFeed } = await sdk.activateFeed(tokenAndId);
    expect(activateFeed.userFeed).toHaveProperty('activated', true);
    await testValuesInDb(activateFeed.userFeed?.id!, true);
  });

  test('should return error if feed is already activated', async () => {
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input });
    const { userFeed, errors } = addFeedWithEmail!;
    expect(userFeed).toBeNull();
    expect(errors![0]).toMatchObject({ argument: 'url', message: 'feed was already added' });
  });

  test('should add another feed to the same user', async () => {
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({
      input: { email, feedUrl: feed2.feedUrl },
    });
    const { userFeed, errors } = addFeedWithEmail!;
    expect(errors).toBeNull();
    expect(userFeed?.feed.url).toBe(feed2.feedUrl);
    const user = await User.findOne({ where: { email } });
    const uFeed = await UserFeed.find({ where: { userId: user?.id } });
    expect(uFeed).toHaveLength(2);
  });
});

describe('Add user feed after authentication', () => {
  const password = faker.internet.password(8);
  const feed1 = generateFeed();
  const feed2 = generateFeed();
  const email = faker.internet.email().toLowerCase();
  let sdk: ReturnType<typeof getSdk>;
  const input = { feedUrl: feed1.feedUrl };
  const feedOpts: UserFeedOptionsInput = { schedule: DigestSchedule.every3hours };
  let tokenAndId: { token: string; userFeedId: string };

  beforeAll(async () => {
    feed1.mockRequests();
    feed2.mockRequests();
    await deleteUserWithEmail(email);
    await User.create({ email, password: await argon2.hash(password) }).save();
  });

  afterEach(() => deleteEmails());

  afterAll(() =>
    Promise.all([
      deleteUserWithEmail(email), //
      deleteFeedWithUrl(feed1.feedUrl),
      deleteFeedWithUrl(feed2.feedUrl),
    ]),
  );

  test('should add feed to current user without verified email', async () => {
    sdk = await getSdkWithLoggedInUser(email, password);
    const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input, feedOpts });
    const { errors, userFeed } = addFeedToCurrentUser!;
    expect(errors).toBeNull();
    expect(userFeed).not.toBeNull();
    expect(userFeed?.feed.url).toBe(feed1.feedUrl);
    expect(userFeed?.activated).toBe(false);
    const userFeedInDB = await UserFeed.findOne(userFeed?.id);
    expect(userFeedInDB?.unsubscribeToken).not.toBeUndefined();
    expect(uuid.validate(userFeedInDB!.unsubscribeToken)).toBeTruthy();
    tokenAndId = await testMailAndGetToken(email, userFeed?.id!);
  });

  test('should activate', async () => {
    const { activateFeed } = await sdk.activateFeed(tokenAndId);
    expect(activateFeed.userFeed).toHaveProperty('activated', true);
    const uf = await UserFeed.findOne(activateFeed.userFeed?.id, {
      relations: ['feed', 'user'],
    });
    expect(uf?.user).toHaveProperty('emailVerified', true);
    expect(uf).toMatchObject({ ...feedOpts, activated: true });
    expect(uf?.feed).toHaveProperty('activated', true);
  });

  test('should return error if user already have this feed', async () => {
    const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({ input });
    const { userFeed, errors } = addFeedToCurrentUser!;
    expect(userFeed).toBeNull();
    expect(Array.isArray(errors)).toBeTruthy();
    expect(errors![0]).toMatchObject({ argument: 'url', message: 'feed was already added' });
  });

  test('should add another feed to the same user and activate automatically', async () => {
    const { addFeedToCurrentUser } = await sdk.addFeedToCurrentUser({
      input: { feedUrl: feed2.feedUrl },
      feedOpts,
    });
    const { userFeed, errors } = addFeedToCurrentUser!;
    expect(errors).toBeNull();
    expect(userFeed?.feed.url).toBe(feed2.feedUrl);
    const user = await User.findOne({ where: { email } });
    const uFeed = await UserFeed.find({ where: { userId: user?.id } });
    expect(uFeed).toHaveLength(2);

    const mail = await getEmailByAddress(email);
    expect(mail).toBeUndefined();

    const uf = await UserFeed.findOne(userFeed?.id, { relations: ['feed', 'user'] });
    expect(uf?.user).toHaveProperty('emailVerified', true);
    expect(uf).toMatchObject({ ...feedOpts, activated: true });
    expect(uf?.feed).toHaveProperty('activated', true);
  });

  test('should return user feeds', async () => {
    const { me } = await sdk.meWithFeeds();
    expect(me?.feeds).toHaveLength(2);
    expect(me?.feeds[0].feed).toHaveProperty('url', feed1.feedUrl);
    expect(me?.feeds[1].feed).toHaveProperty('url', feed2.feedUrl);
  });
  test('should update feed after activation', async () => {
    // wait for feed to update
    await new Promise((resolve) => setTimeout(resolve, 30));

    const feeds = await Feed.find({ where: { url: feed1.feedUrl } });
    expect(feeds).toHaveLength(1);
    const feed = feeds[0];
    const items = await Item.find({ where: { feedId: feed!.id } });
    expect(items).toHaveLength(feed1.items.length);
  });
});

describe('Errors', () => {
  const sdk = getSdk(getTestClient().client);
  const email = faker.internet.email().toLowerCase();

  afterAll(() => {
    nock.cleanAll();
  });
  test('should return argument error: not a feed', async () => {
    const feedUrl = faker.internet.url();
    nock(feedUrl).get('/').reply(200, 'text');
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input: { email, feedUrl } });
    const errors = addFeedWithEmail?.errors;
    expect(errors).toHaveLength(1);
    expect(errors![0]).toMatchObject({
      argument: 'url',
      message: 'Not a feed',
    });
  });
  test('should return argument error', async () => {
    const feedUrl = faker.internet.url();
    nock(feedUrl).get('/').replyWithError({ message: 'error_message', code: 'error_code' });
    const { addFeedWithEmail } = await sdk.addFeedWithEmail({ input: { email, feedUrl } });
    const errors = addFeedWithEmail?.errors;
    expect(errors).toHaveLength(1);
    expect(errors![0]).toMatchObject({
      argument: 'url',
      message: "Couldn't get access to feed",
    });
  });
});
