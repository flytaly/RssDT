import React from 'react';
import styled from 'styled-components';
import ResponsiveTable from './feed-table/feed-table';

const ManageFeedsContainer = styled.main`
    padding: 0 2rem 1rem;
`;

const StyledH1 = styled.h1`
    font-size: 1.8rem;
`;

const ManageFeeds = () => (
    <ManageFeedsContainer>
        <StyledH1>Edit subscriptions</StyledH1>
        <ResponsiveTable />
    </ManageFeedsContainer>
);

export default ManageFeeds;
