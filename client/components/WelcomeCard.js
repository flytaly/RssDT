import React from 'react';
import StyledCard from './styled/Card';
import CardLeft from './CardLeft';
import CardRight from './CardRight';


const WelcomeCard = () => (
    <StyledCard>
        <CardLeft />
        <CardRight />
    </StyledCard>
);

export default WelcomeCard;
