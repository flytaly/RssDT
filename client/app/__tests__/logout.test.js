import { render, wait } from '@testing-library/react';
import Router from 'next/router';
import Logout, { LOGOUT_MUTATION, LOGOUT_CLIENT_MUTATION } from '../pages/logout';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import Page from '../components/page';

const mocks = [{
    request: { query: LOGOUT_MUTATION },
    result: { data: { logOut: {
        message: 'OK',
        __typename: 'Message',
    } } },
}, {
    request: { query: LOGOUT_CLIENT_MUTATION },
    result: { data: { logOut: {
        __typename: 'Message',
        message: 'OK',
    } } },
}];

describe('Log out', () => {
    test('should call log out and redirect', () => {
        render(
            <Page>
                <ApolloMockedProvider mocks={mocks}>
                    <Logout />
                </ApolloMockedProvider>
            </Page>,
        );
        wait(async () => {
            expect(Router.replace).toHaveBeenCalledWith('/');
        });
    });
});
