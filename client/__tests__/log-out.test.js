import { render, wait } from 'react-testing-library';
import Router from 'next/router';
import Logout, { LOGOUT_MUTATION } from '../pages/logout';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';

const mocks = [{
    request: {
        query: LOGOUT_MUTATION,
    },
    result: { data: { logOut: { message: 'OK' } } },
}];

describe('Log out', () => {
    test('should call log out and redirect', () => {
        render(
            <ApolloMockedProvider mocks={mocks}>
                <Logout />
            </ApolloMockedProvider>,
        );
        wait(async () => {
            expect(Router.replace).toHaveBeenCalledWith('/');
        });
    });
});
