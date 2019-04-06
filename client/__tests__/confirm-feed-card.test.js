import 'jest-dom/extend-expect';
import { render, wait } from 'react-testing-library';
import ConfirmFeed, { CONFIRM_SUBSCRIPTION_MUTATION } from '../components/confirm-feed-card';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import { ME_QUERY_MOCK } from '../test-utils/qgl-mocks';

const successMessage = 'Feed "feed_name" was activated';
const errorMessage = 'Wrong or expired token';
const mocks = [{
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'token' },
    },
    result: { data: { confirmSubscription: { message: successMessage } } },
}, {
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'wrongToken' },
    },
    error: new Error(errorMessage),
},
ME_QUERY_MOCK,
];

describe('Confirm a feed subscription', () => {
    const { getByTestId, rerender } = render(
        <ApolloMockedProvider mocks={mocks}>
            <ConfirmFeed token="token" />
        </ApolloMockedProvider>,
    );

    test('should display response message', async () => {
        await wait(() => {
            expect(getByTestId('confirm-message')).toHaveTextContent(successMessage);
        });
    });

    test('should render header', () => {
        expect(getByTestId('card-header')).toBeVisible();
    });

    test('should display error message', async () => {
        rerender(
            <ApolloMockedProvider mocks={mocks}>
                <ConfirmFeed token="wrongToken" />
            </ApolloMockedProvider>,
        );
        await wait(() => {
            expect(getByTestId('confirm-message')).toHaveTextContent(errorMessage);
        });
    });
});
