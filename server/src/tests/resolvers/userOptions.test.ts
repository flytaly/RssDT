import { Connection } from 'typeorm';
import faker from 'faker';
// eslint-disable-next-line import/extensions
import { User } from '#entities';
import { initDbConnection } from '../../dbConnection.js';
import { getSdk, SetOptionsMutation } from '../graphql/generated.js';
import { generateUserAndGetSdk } from '../test-utils/login.js';
import { defaultLocale, defaultTimeZone } from '../../constants.js';
import { OptionsInput } from '../../resolvers/resolver-types/inputs.js';
import { Theme } from '../../types/enums.js';
import getTestClient from '../test-utils/getClient.js';

let dbConnection: Connection;

let user: User;
let sdk: ReturnType<typeof getSdk>;
let sdkAnon: ReturnType<typeof getSdk>;

beforeAll(async () => {
  dbConnection = await initDbConnection();
  ({ user, sdk } = await generateUserAndGetSdk());
  sdkAnon = getSdk(getTestClient().client);
});

afterAll(async () => {
  await user.remove();
  await dbConnection.close();
});

describe('User Info', () => {
  test('should response with user info', async () => {
    const { me } = await sdk.me();
    expect(me?.timeZone).toBe(defaultTimeZone);
    expect(me?.locale).toBe(defaultLocale);
  });
  test('should update user info', async () => {
    const userInfo = { locale: 'ru', timeZone: 'Europe/Moscow' };
    const { updateUserInfo } = await sdk.updateUserInfo({ userInfo });
    expect(updateUserInfo).toMatchObject(userInfo);
  });

  test('should not save incorrect data', async () => {
    const { updateUserInfo } = await sdk.updateUserInfo({
      userInfo: { locale: 'WRONG', timeZone: 'WRONG' },
    });
    expect(updateUserInfo).toMatchObject({ locale: 'en-US', timeZone: defaultTimeZone });
  });

  test('should throw error if user is not authenticated', async () => {
    let errMsg: string | undefined;
    try {
      await sdkAnon.updateUserInfo({ userInfo: { locale: 'en-GB', timeZone: 'tz' } });
    } catch (error) {
      errMsg = error.message;
    }
    expect(errMsg?.startsWith('not authenticated')).toBeTruthy();
  });
});

describe('User Options', () => {
  test('should response with options', async () => {
    const { me } = await sdk.meWithOptions();
    const { myOptions } = await sdk.myOptions();
    expect(me?.options).toMatchObject(myOptions);
    expect(me?.options.attachmentsDefault).toBeTruthy();
    expect(me?.options.dailyDigestHour).toBe(user.options.dailyDigestHour);
  });

  test('should update options', async () => {
    const opts: OptionsInput = {
      shareEnable: true,
      attachmentsDefault: false,
      themeDefault: Theme.text,
      dailyDigestHour: 12,
    };
    const { setOptions } = await sdk.setOptions({ opts });
    expect(setOptions.options).toMatchObject(opts);
  });

  test('should throw error if user is not authenticated', async () => {
    let errMsg: string | undefined;
    try {
      await sdkAnon.setOptions({ opts: {} });
    } catch (error) {
      errMsg = error.message;
    }
    expect(errMsg?.startsWith('not authenticated')).toBeTruthy();
  });

  test('should validate', async () => {
    const expectError = ({ setOptions }: SetOptionsMutation, msg: string) =>
      expect(setOptions?.errors?.[0].message).toBe(msg);

    expectError(
      await sdk.setOptions({ opts: { customSubject: faker.random.alpha({ count: 51 }) } }),
      '"customSubject" length must be less than or equal to 50 characters long',
    );
    expectError(
      await sdk.setOptions({ opts: { dailyDigestHour: 26 } }),
      '"dailyDigestHour" must be less than or equal to 23',
    );
  });
});
