import '@testing-library/jest-dom/extend-expect';
import { render, wait } from '@testing-library/react';
import ConfirmFeed, { CONFIRM_SUBSCRIPTION_MUTATION } from '../components/confirm-feed-card';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import { ME_QUERY_MOCK, UPDATE_MY_INFO_MOCK } from '../test-utils/qgl-mocks';
import Page from '../components/page';

const successMessage = 'Feed "feed_name" was activated';
const errorMessage = 'Wrong or expired token';
const mocks = [{
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'token' },
    },
    result: { data: { confirmSubscription: {
        __typename: 'Message',
        message: successMessage,
    } } },
}, {
    request: {
        query: CONFIRM_SUBSCRIPTION_MUTATION,
        variables: { token: 'wrongToken' },
    },
    error: new Error(errorMessage),
},
ME_QUERY_MOCK,
UPDATE_MY_INFO_MOCK,
];

describe('Confirm a feed subscription', () => {
    test('should display response message', async () => {
        const { getByTestId } = render(
            <Page>
                <ApolloMockedProvider mocks={mocks}>
                    <ConfirmFeed token="token" />
                </ApolloMockedProvider>
            </Page>,
        );
        await wait(() => {
            expect(getByTestId('confirm-message')).toHaveTextContent(successMessage);
        });
    });

    test('should render header', () => {
        const { getByTestId } = render(
            <Page>
                <ApolloMockedProvider mocks={mocks}>
                    <ConfirmFeed token="token" />
                </ApolloMockedProvider>
            </Page>,
        );
        expect(getByTestId('card-header')).toBeVisible();
    });

    test('should display error message', async () => {
        const { getByTestId } = render(
            <Page>
                <ApolloMockedProvider mocks={mocks}>
                    <ConfirmFeed token="wrongToken" />
                </ApolloMockedProvider>
            </Page>,
        );
        await wait(() => {
            expect(getByTestId('confirm-message')).toHaveTextContent(errorMessage);
        });
    });
});
