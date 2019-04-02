import React from 'react';
import styled from 'styled-components';
import CardHalf from '../styled/card-half';
import AddFeedForm from './add-feed-form';
import CardHeader from '../card-header';

const StyledHalf = styled(CardHalf)`
    background: ${props => props.theme.greyLight};
    border: 1px solid ${props => props.theme.greyDark};
    border-radius: 10px;
`;

const WelcomeLeft = props => (
    <StyledHalf>
        <CardHeader />
        <AddFeedForm {...props} />
    </StyledHalf>
);

export default WelcomeLeft;
