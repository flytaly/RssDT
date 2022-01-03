import 'reflect-metadata';
import test from 'ava';
import faker from 'faker';
// eslint-disable-next-line import/extensions
import { User } from '#entities';
import { defaultLocale, defaultTimeZone } from '../../constants.js';
import { OptionsInput } from '../../resolvers/resolver-types/inputs.js';
import { Theme } from '../../types/enums.js';
import { getSdk } from '../graphql/generated.js';
import { startTestServer, stopTestServer } from '../test-server.js';
import getTestClient from '../test-utils/getClient.js';
import { generateUserAndGetSdk } from '../test-utils/login.js';

let user: User;
let sdk: ReturnType<typeof getSdk>;
let sdkAnon: ReturnType<typeof getSdk>;

test.before(async () => {
  await startTestServer();
  ({ user, sdk } = await generateUserAndGetSdk());
  sdkAnon = getSdk(getTestClient().client);
});

test.after(() => stopTestServer());

test.serial('me query: get user info', async (t) => {
  const { me } = await sdk.me();
  t.like(me, { timeZone: defaultTimeZone, locale: defaultLocale });
});

test.serial('updateUserInfo mutation', async (t) => {
  const userInfo = { locale: 'ru', timeZone: 'Europe/Moscow' };
  const { updateUserInfo } = await sdk.updateUserInfo({ userInfo });
  t.like(updateUserInfo, userInfo);
});

test.serial('updateUserInfo: should not save incorrect data', async (t) => {
  const { updateUserInfo } = await sdk.updateUserInfo({
    userInfo: { locale: 'WRONG', timeZone: 'WRONG' },
  });
  t.like(updateUserInfo, {
    // TODO: should be defaultLocale
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    timeZone: defaultTimeZone,
  });
});

test.serial('updateUserInfo: not authenticated', async (t) => {
  const userInfo = { locale: 'en-GB', timeZone: 'tz' };
  const error = await t.throwsAsync(sdkAnon.updateUserInfo({ userInfo }));
  t.true(error?.message.startsWith('not authenticated'));
});

test.serial('meWithOptions and myOptions queries', async (t) => {
  const { me } = await sdk.meWithOptions();
  const { myOptions } = await sdk.myOptions();
  t.like(me?.options, myOptions);
  t.truthy(me?.options.attachmentsDefault);
  t.is(me?.options.dailyDigestHour, user.options.dailyDigestHour);
});

test.serial('setOptions mutation', async (t) => {
  const opts: OptionsInput = {
    shareEnable: true,
    attachmentsDefault: false,
    themeDefault: Theme.text,
    dailyDigestHour: 12,
  };
  const { setOptions } = await sdk.setOptions({ opts });
  t.like(setOptions.options, opts);
});

test('setOptions: not authenticated', async (t) => {
  const error = await t.throwsAsync(sdkAnon.setOptions({ opts: {} }));
  t.true(error?.message.startsWith('not authenticated'));
});

test('validation', async (t) => {
  const r1 = await sdk.setOptions({ opts: { customSubject: faker.random.alpha({ count: 51 }) } });
  t.is(
    r1.setOptions.errors?.[0].message,
    '"customSubject" length must be less than or equal to 50 characters long',
  );

  const r2 = await sdk.setOptions({ opts: { dailyDigestHour: 26 } });
  t.is(r2.setOptions.errors?.[0].message, '"dailyDigestHour" must be less than or equal to 23');
});
