import { getSdk } from '../graphql/generated';
import getTestClient from './getClient';

export const getSdkWithLoggedInUser = async (email: string, password: string) => {
    const { client, lastHeaders } = getTestClient();
    const sdk = getSdk(client);
    const { login } = await sdk.login({ email, password });
    expect(login.errors).toBeNull();
    expect(login.user?.email).toBe(email);

    const cookie = lastHeaders.pop()?.get('set-cookie');
    client.setHeader('cookie', cookie!);
    return sdk;
};
