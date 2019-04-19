import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';
import get from 'lodash.get';
import {
    Table, Th, Tr, Td, ButtonWithImg,
} from './styled-table-parts';
import trashIcon from '../../static/trash.svg';
import editIcon from '../../static/edit.svg';

const MY_FEEDS_QUERY = gql`
    query MY_FEEDS_QUERY {
        myFeeds {
            id
            feed {
                url
                link
                title
                imageUrl
                imageTitle
            }
            schedule
            lastUpdate
            createdAt
        }
    }
`;

const renderRow = feedInfo => (
    <Tr key={feedInfo.id}>
        <Td data-name="FEED">
            <a href={feedInfo.feed.url}>
                {feedInfo.feed.title || feedInfo.feed.link || feedInfo.feed.url}
            </a>
        </Td>
        <Td minWidth="8rem" data-name="ADDED">{new Date(feedInfo.createdAt).toLocaleDateString()}</Td>
        <Td data-name="LAST UPDATE">{new Date(feedInfo.lastUpdate).toLocaleString()}</Td>
        <Td data-name="DIGEST SCHEDULE">{feedInfo.schedule}</Td>
        <Td data-name="ACTIONS">
            <div>
                <ButtonWithImg src={editIcon} alt="Edit the feed" />
                <ButtonWithImg src={trashIcon} alt="Delete the feed" />
            </div>
        </Td>
    </Tr>
);
const ResponsiveTable = () => {
    const { data, loading, error } = useQuery(MY_FEEDS_QUERY);
    const feeds = get(data, 'myFeeds', []);
    if (error && error.message !== 'GraphQL error: Authentication is required') {
        console.error(error);
    }

    return (
        <Table>
            <Tr key="header">
                <Th>FEED</Th>
                <Th minWidth="8rem">ADDED</Th>
                <Th>LAST UPDATE</Th>
                <Th>DIGEST SCHEDULE</Th>
                <Th>ACTIONS</Th>
            </Tr>
            {loading ? 'loading...' : feeds.map(renderRow)}
        </Table>
    );
};

export default ResponsiveTable;
export { MY_FEEDS_QUERY };
