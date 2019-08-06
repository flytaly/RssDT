import '@testing-library/jest-dom/extend-expect';
import { render, wait, cleanup } from '@testing-library/react';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import CardHeader from '../components/card-header';
import ME_QUERY from '../queries/me-query';
import withAuth from '../components/decorators/withAuth';
import { ME_QUERY_MOCK, UPDATE_MY_INFO_MOCK } from '../test-utils/qgl-mocks';

describe('Navigation menu', () => {
    afterEach(cleanup);
    const HeaderWithAuth = withAuth(false)(CardHeader);

    test('should have "Log out" link if user is logged in', async () => {
        const { queryByText } = render(
            <ApolloMockedProvider mocks={[ME_QUERY_MOCK, UPDATE_MY_INFO_MOCK]}>
                <HeaderWithAuth />
            </ApolloMockedProvider>,
        );
        await wait(() => {
            expect(queryByText(/log in/i)).toBeNull;
            expect(queryByText(/log out/i)).toBeInTheDocument();
            expect(queryByText(/manage/i)).toBeInTheDocument();
        });
    });

    test('should have "Log in" link if user is not logged in', async () => {
        console.error = jest.fn();
        const mocks = [{
            request: { query: ME_QUERY },
            result: { data: {} },
            error: new Error(),
        },
        UPDATE_MY_INFO_MOCK,
        ];
        const { queryByText } = render(
            <ApolloMockedProvider mocks={mocks}>
                <HeaderWithAuth />
            </ApolloMockedProvider>,
        );
        await wait(() => {
            expect(queryByText(/log in/i)).toBeInTheDocument();
            expect(queryByText(/log out/i)).toBeNull;
        });
    });
});
