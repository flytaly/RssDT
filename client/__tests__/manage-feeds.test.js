import { render, wait } from 'react-testing-library';
import ManageFeeds from '../components/manage-feeds';
import { MY_FEEDS_QUERY } from '../components/feed-table/feed-table';
import ApolloMockedProvider from '../test-utils/apollo-mocked-provider';
import types from '../types/digest-periods';

const mocks = [{
    request: { query: MY_FEEDS_QUERY },
    result: {
        data: {
            myFeeds: [{
                id: 'id1',
                createdAt: new Date('2019-04-19T00:11:00.000Z'),
                lastUpdate: new Date('2019-04-19T00:12:00.000Z'),
                schedule: types.DAILY,
                feed: {
                    title: 'Test Feed Title',
                    link: 'http://testfeed.com',
                    url: 'http://testfeed.com/feed',
                    imageTitle: 'Image Title',
                    imageUrl: 'http://testfeed.com/logo.png',
                },
            }],
        },
    },
}];

describe('Manage feeds', () => {
    const { container } = render(
        <ApolloMockedProvider mocks={mocks}>
            <ManageFeeds />
        </ApolloMockedProvider>,
    );

    test('should match snapshot', async () => {
        await wait(() => {
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});
