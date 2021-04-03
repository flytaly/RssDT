import argon2 from 'argon2';
import faker from 'faker';
import { Connection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { User } from '#entities';
import { initDbConnection } from '../dbConnection.js';
import { getSdk } from './graphql/generated.js';
import { deleteUserWithEmail } from './test-utils/dbQueries.js';
import getTestClient from './test-utils/getClient.js';
import { getSdkWithLoggedInUser } from './test-utils/login.js';

let dbConnection: Connection;

beforeAll(async () => {
  dbConnection = await initDbConnection();
});

afterAll(() => dbConnection.close());

const expectAuthError = async (query: () => Promise<any>) => {
  await expect(query).rejects.toThrow(/not authenticated/);
};
const expectForbiddenError = async (query: () => Promise<any>) => {
  await expect(query).rejects.toThrow(/forbidden/);
};

describe('protected queries', () => {
  let email: string;
  let sdkNoUser: ReturnType<typeof getSdk>;
  let sdkUser: ReturnType<typeof getSdk>;

  beforeAll(async () => {
    sdkNoUser = getSdk(getTestClient().client);

    email = faker.internet.email().toLowerCase();
    const password = faker.internet.password(10);
    await deleteUserWithEmail(email);
    await User.create({ email, password: await argon2.hash(password) }).save();
    sdkUser = await getSdkWithLoggedInUser(email, password);
  });
  afterAll(async () => {
    await deleteUserWithEmail(email);
  });

  test('should throw Authentication Error', async () => {
    const feedUrl = 'http://feed.com';
    await expectAuthError(() => sdkNoUser.me());
    await expectAuthError(() => sdkNoUser.addFeedToCurrentUser({ input: { feedUrl } }));
    await expectAuthError(() => sdkNoUser.users());
  });

  test('should throw Forbidden Error', async () => {
    await expectForbiddenError(() => sdkUser.users());
  });
});
