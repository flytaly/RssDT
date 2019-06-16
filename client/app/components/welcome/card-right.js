import React from 'react';
import { StyledDarkHalf } from '../styled/card-half';
import AddFeedForm from './add-feed-form';
import CardHeader from '../card-header';

const WelcomeLeft = props => (
    <StyledDarkHalf>
        <CardHeader />
        <AddFeedForm {...props} />
    </StyledDarkHalf>
);

export default WelcomeLeft;
