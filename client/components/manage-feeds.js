import React from 'react';
import styled from 'styled-components';
import ResponsiveTable from './feed-table/feed-table';

const ManageFeedsContainer = styled.main`
    padding: 0 2rem 1rem;
`;

const ManageFeeds = () => (
    <ManageFeedsContainer>
        <h3>Edit subscriptions</h3>
        <ResponsiveTable />
    </ManageFeedsContainer>
);

export default ManageFeeds;
