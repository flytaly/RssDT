import React from 'react';
import StyledCard from './styled/card';
import CardLeft from './card-left';
import CardRight from './card-right';


const WelcomeCard = () => (
    <StyledCard>
        <CardLeft />
        <CardRight />
    </StyledCard>
);

export default WelcomeCard;
