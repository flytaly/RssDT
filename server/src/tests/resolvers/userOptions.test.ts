import { Connection } from 'typeorm';
import { initDbConnection } from '../../dbConnection';
import { User } from '../../entities/User';
import { getSdk } from '../graphql/generated';
import { generateUserAndGetSdk } from '../test-utils/login';
import { defaultLocale, defaultTimeZone } from '../../constants';
import { OptionsInput } from '../../resolvers/common/inputs';
import { THEME } from '../../entities/Options';
import getTestClient from '../test-utils/getClient';

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
            themeDefault: THEME.text,
            dailyDigestHour: 12,
        };
        const { setOptions } = await sdk.setOptions({ opts });
        expect(setOptions).toMatchObject(opts);
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
});
