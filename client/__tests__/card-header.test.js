import 'jest-dom/extend-expect';
import { render, wait, cleanup } from 'react-testing-library';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import CardHeader from '../components/card-header';
import ME_QUERY from '../queries/me-query';
import withAuth from '../components/decorators/withAuth';

describe('Navigation menu', () => {
    afterEach(cleanup);
    const HeaderWithAuth = withAuth(false)(CardHeader);

    test('should have "Log out" link if user is logged in', async () => {
        const mocks = [{
            request: { query: ME_QUERY },
            result: { data: { me: { email: 'email@test.com', id: 'id' } } },
        }];
        const { queryByText } = render(
            <ApolloMockedProvider mocks={mocks}>
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
        }];
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
