import React from 'react';
import styled from 'styled-components';
import ResponsiveTable from './feed-table/feed-table';
import { BlueButton } from './styled/buttons';
import { useDispatch, types } from './state';

const ManageFeedsContainer = styled.main`
    padding: 0 2rem 1rem;
`;

const StyledH2 = styled.h2`
    font-size: 1.8rem;
`;

const StyledButton = styled(BlueButton)`
    margin-top: 1rem;
`;

const ManageFeeds = () => {
    const dispatch = useDispatch();
    return (
        <ManageFeedsContainer>
            <StyledH2>Edit subscriptions</StyledH2>
            <ResponsiveTable />
            <StyledButton onClick={() => { dispatch({ type: types.toggleNewFeedModal }); }}>
                Add new feed
            </StyledButton>
        </ManageFeedsContainer>);
};

export default ManageFeeds;
